import { RedisService } from '../../common/redis/redis.service';
import {
  Processor,
  WorkerHost,
  OnWorkerEvent,
  InjectQueue,
} from '@nestjs/bullmq';
import { Job, Queue, DelayedError } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import type {
  WhatsappProviderInterface,
  SendMessageResult,
} from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { AiSafetyException } from '../../ai/exceptions/ai-safety.exception';
import { AiReplyJobData } from '../interfaces/job-data.interface';
import { ConversationGateway } from '../../modules/websocket/conversation.gateway';
import { AppException } from '../../common/exceptions/app.exception';
import { ProviderDegradationException } from '../../common/exceptions/provider-degradation.exception';
import { KnowledgeService } from '../../modules/knowledge/knowledge.service';
import { AiSafetyService } from '../../ai/ai-safety.service';
import { QueueName } from '@prisma/client';
import { BaseWorker } from './base.worker';

@Processor('ai-reply', {
  concurrency: 10,
  limiter: {
    max: 100,
    duration: 1000,
  },
})
export class AiReplyWorker extends BaseWorker<AiReplyJobData, unknown, string> {
  protected readonly logger = new Logger(AiReplyWorker.name);
  protected readonly queueName = 'ai-reply';

  constructor(
    protected readonly cls: ClsService,
    protected readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
    @Inject('AI_PROVIDER') private readonly aiProvider: AiProviderInterface,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    @InjectQueue('ai-analysis') private readonly aiAnalysisQueue: Queue,
    private readonly conversationGateway: ConversationGateway,
    private readonly knowledgeService: KnowledgeService,
  ) {
    super();
  }

  async process(job: Job<AiReplyJobData, unknown, string>): Promise<unknown> {
    this.logger.debug(`Processing ai-reply job ${job.id}`);
    const { tenantId, payload } = job.data;

    // Queue Isolation / Noisy Neighbor prevention
    const MAX_CONCURRENT_PER_TENANT = 2;
    const activeJobsKey = `tenant:${tenantId}:aireply-active`;
    const activeCount = await this.redisService.incr(activeJobsKey);

    if (activeCount === 1) {
      await this.redisService.expire(activeJobsKey, 60);
    }

    if (activeCount > MAX_CONCURRENT_PER_TENANT) {
      await this.redisService.decr(activeJobsKey);
      this.logger.warn(
        `Tenant ${tenantId} exceeded AI reply concurrency limit (${MAX_CONCURRENT_PER_TENANT}). Delaying job ${job.id}.`,
      );
      await job.moveToDelayed(Date.now() + 2000, job.token);
      throw new DelayedError();
    }

    try {
      // Run inside cls context since worker process isn't wrapped by HTTP middleware
      return await this.cls.run(async () => {
        this.cls.set('tenantId', tenantId);

        try {
          this.logger.log(`Job ${job.id} started for tenant ${tenantId}`);

          // 0. Strict Tenant Validation — no fallback bypass allowed (RISK-7 FIX)
          if (!tenantId) {
            this.logger.error(
              'Job received without tenantId — aborting to enforce tenant isolation',
            );
            throw new AppException(
              'TENANT_MISSING',
              'Cannot process AI reply without a valid tenantId.',
              400,
            );
          }

          // Extract message from Fonnte payload format
          const userMessage = payload.message || payload.text || 'Hello';
          const sender = payload.sender || payload.from || 'unknown';
          const messageExternalId = payload.id;

          // Idempotency Check: Prevent duplicate processing if BullMQ retries after DB insertion
          if (messageExternalId) {
            const existingMessage = await this.prisma.message.findFirst({
              where: { tenantId, externalId: messageExternalId },
            });
            if (existingMessage) {
              this.logger.warn(
                `Idempotency hit: Message ${messageExternalId} already exists in DB. Skipping AI reply.`,
              );
              return { success: true, duplicated: true };
            }
          }

          // 1. Upsert Conversation and Save Incoming Message
          let conversation = await this.prisma.conversation.findFirst({
            where: { tenantId, customerPhone: sender },
          });

          if (!conversation) {
            conversation = await this.prisma.conversation.create({
              data: {
                tenantId,
                customerPhone: sender,
                customerName: payload.name || 'Unknown',
              },
            });
          }

          // Save incoming user message FIRST so it's always recorded and available for analysis
          await this.prisma.message.create({
            data: {
              tenantId,
              conversationId: conversation.id,
              externalId: messageExternalId,
              senderType: 'CUSTOMER',
              content: userMessage,
              deliveryState: 'DELIVERED',
              isAiGenerated: false,
            },
          });

          // Enqueue Lead Analysis Asynchronously (Always trigger this regardless of AI Reply mode)
          await this.aiAnalysisQueue.add('analyze-lead', {
            tenantId,
            conversationId: conversation.id,
            messageContent: userMessage,
          });

          // Fetch WhatsApp session first to verify it is CONNECTED
          const waSession = await this.prisma.whatsappSession.findUnique({
            where: { tenantId },
          });

          if (!waSession || waSession.state !== 'CONNECTED') {
            this.logger.warn(
              `Delaying AI reply: WhatsApp session is not connected for tenant ${tenantId}`,
            );
            // By throwing an AppException, BullMQ will catch it and apply the exponential backoff defined in the queue config, explicitly delaying processing for this specific job/tenant.
            throw new AppException(
              'WHATSAPP_DISCONNECTED',
              `WhatsApp session is ${waSession?.state || 'missing'} for tenant ${tenantId}. Job delayed.`,
              503,
            );
          }

          // 1.5 1-Minute Manual Override Filter using Redis
          const isOutgoingMessage = payload.sender === payload.device;
          if (isOutgoingMessage) {
            this.logger.log(
              `Skipping AI reply: Outgoing message being processed just to save history.`,
            );
            return { success: true, reason: 'outgoing_message_history' };
          }

          const overrideKey = `manual_override:${sender}`;
          const hasManualOverride = await this.redisService.exists(overrideKey);

          if (hasManualOverride) {
            this.logger.log(
              `Skipping AI reply for conversation ${conversation.id}: 1-Minute Manual Override active for ${sender}`,
            );
            return { success: true, reason: 'skipped_manual_override' };
          }

          // 2. Strict Human Override (Anti Double-Reply) for AI Reply part
          if (
            (payload as Record<string, unknown>).isHumanTakeoverActive ||
            conversation.state === 'HUMAN_ACTIVE' ||
            conversation.aiMode === 'AI_OFF' ||
            (conversation.aiModePausedUntil &&
              conversation.aiModePausedUntil > new Date())
          ) {
            this.logger.log(
              `Skipping AI reply for conversation ${conversation.id}: Human in control (Anti-Looping active)`,
            );
            return { success: true, reason: 'skipped_human_override' };
          }

          // 3. Token Quota Check
          const tokenQuota = await this.prisma.tokenQuota.findUnique({
            where: { tenantId },
          });

          if (tokenQuota && tokenQuota.usedQuota >= tokenQuota.totalQuota) {
            this.logger.warn(
              `Skipping AI reply: Token quota exhausted for tenant ${tenantId}`,
            );
            return { success: false, reason: 'quota_exhausted' };
          }

          // 4. Handle AI_ASSIST Mode (Suggestion via WebSocket)
          if (conversation.aiMode === 'AI_ASSIST') {
            try {
              // Get recent messages for context
              const recentMessages = await this.prisma.message.findMany({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
              });

              // AI Cost Optimization: Early Exit if the last message in the thread is already from AI
              if (
                recentMessages.length > 0 &&
                recentMessages[0].senderType === 'AI'
              ) {
                this.logger.log(
                  `Skipping AI suggestion: Last message in conversation ${conversation.id} is already from AI`,
                );
                return {
                  success: true,
                  reason: 'suggestion_already_generated',
                };
              }

              const historyText = recentMessages
                .reverse()
                .map((m) => `${m.senderType}: ${m.content}`)
                .join('\n');

              // 4a. Retrieve relevant knowledge context for augmentation
              const relevantKnowledge =
                await this.knowledgeService.searchRelevantKnowledge(
                  tenantId,
                  userMessage,
                );
              const systemContext =
                relevantKnowledge.length > 0
                  ? relevantKnowledge.join('\n\n')
                  : undefined;

              const response = await this.aiProvider.generateReply(
                tenantId,
                historyText,
                systemContext,
              );
              const suggestion = response.reply;
              const totalTokens = response.tokensUsed;
              const promptTokens = 0,
                completionTokens = 0;

              // Emit suggestion via WebSocket
              this.conversationGateway.broadcastAiSuggestion(tenantId, {
                conversationId: conversation.id,
                suggestion,
              });

              // Log AI usage
              await this.prisma.aiUsageLog.create({
                data: {
                  tenantId,
                  conversationId: conversation.id,
                  model: 'gpt-4o-mini',
                  promptTokens,
                  completionTokens,
                  totalTokens,
                  latencyMs: 0, // Simplification for now, or track start/end time
                  queueName: 'AI_REPLY',
                },
              });

              // Deduct quota
              if (tokenQuota && totalTokens > 0) {
                await this.prisma.tokenQuota.update({
                  where: { tenantId },
                  data: { usedQuota: { increment: totalTokens } },
                });
              }

              return { success: true, reason: 'ai_suggestion_emitted' };
            } catch (error) {
              this.logger.error(
                `Failed to generate AI suggestion for conversation ${conversation.id}: ${error instanceof Error ? error.message : 'Unknown'}`,
              );
              return { success: false, reason: 'ai_suggestion_failed' };
            }
          }

          // 4b. Handle SMART_HYBRID Mode
          let smartHybridReply: string | null = null;
          let smartHybridTokenUsage: {
            prompt: number;
            completion: number;
            total: number;
          } | null = null;
          if (conversation.aiMode === 'SMART_HYBRID') {
            try {
              const recentMessages = await this.prisma.message.findMany({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
              });

              if (
                recentMessages.length > 0 &&
                recentMessages[0].senderType === 'AI'
              ) {
                return { success: true, reason: 'already_replied' };
              }

              const historyText = recentMessages
                .reverse()
                .map((m) => `${m.senderType}: ${m.content}`)
                .join('\n');

              const relevantKnowledge =
                await this.knowledgeService.searchRelevantKnowledge(
                  tenantId,
                  userMessage,
                );
              const systemContext =
                relevantKnowledge.length > 0
                  ? relevantKnowledge.join('\n\n')
                  : undefined;

              const response = await this.aiProvider.generateReply(
                tenantId,
                historyText,
                systemContext,
              );
              smartHybridReply = response.reply;
              smartHybridTokenUsage = {
                prompt: 0,
                completion: 0,
                total: response.tokensUsed,
              };

              // Confidence Check Heuristic for SMART_HYBRID
              const uncertaintyKeywords = [
                'maaf',
                'kurang tahu',
                'belum pasti',
                'tidak yakin',
                'silakan hubungi',
              ];
              const isLowConfidence = uncertaintyKeywords.some((keyword) =>
                smartHybridReply!.toLowerCase().includes(keyword),
              );

              if (isLowConfidence) {
                this.logger.log(
                  `SMART_HYBRID: Low confidence detected for conversation ${conversation.id}. Escalating to AI_ASSIST.`,
                );

                // Act like AI_ASSIST: Emit suggestion and escalate
                this.conversationGateway.broadcastAiSuggestion(tenantId, {
                  conversationId: conversation.id,
                  suggestion: smartHybridReply,
                });

                await this.prisma.conversation.update({
                  where: { id: conversation.id },
                  data: { state: 'ESCALATED', unreadCount: { increment: 1 } },
                });

                // Log AI usage
                await this.prisma.aiUsageLog.create({
                  data: {
                    tenantId,
                    conversationId: conversation.id,
                    model: 'gpt-4o-mini',
                    promptTokens: smartHybridTokenUsage.prompt,
                    completionTokens: smartHybridTokenUsage.completion,
                    totalTokens: smartHybridTokenUsage.total,
                    latencyMs: 0,
                    queueName: 'AI_REPLY',
                  },
                });

                if (tokenQuota && smartHybridTokenUsage.total > 0) {
                  await this.prisma.tokenQuota.update({
                    where: { tenantId },
                    data: {
                      usedQuota: { increment: smartHybridTokenUsage.total },
                    },
                  });
                }
                return { success: true, reason: 'smart_hybrid_escalated' };
              }
              // If high confidence, we let it fall through to the send block.
              // We'll skip the generation in AUTO_REPLY block if smartHybridReply is already set.
            } catch (error) {
              this.logger.error(
                `SMART_HYBRID Error for conversation ${conversation.id}: ${error instanceof Error ? error.message : 'Unknown'}`,
              );
              return { success: false, reason: 'smart_hybrid_failed' };
            }
          }

          // 5. Core Conversation Logic (AUTO_REPLY and confident SMART_HYBRID)
          let aiResponse: string = smartHybridReply || '';
          let tokenUsage = smartHybridTokenUsage || {
            prompt: 0,
            completion: 0,
            total: 0,
          };
          try {
            // Get recent messages for context
            const recentMessages = await this.prisma.message.findMany({
              where: { conversationId: conversation.id },
              orderBy: { createdAt: 'desc' },
              take: 10,
            });

            // AI Cost Optimization: Early Exit if the last message in the thread is already from AI
            if (
              recentMessages.length > 0 &&
              recentMessages[0].senderType === 'AI'
            ) {
              this.logger.log(
                `Skipping AI auto-reply: Last message in conversation ${conversation.id} is already from AI`,
              );
              return { success: true, reason: 'already_replied' };
            }

            const historyText = recentMessages
              .reverse()
              .map((m) => `${m.senderType}: ${m.content}`)
              .join('\n');

            let timeoutId: NodeJS.Timeout;
            const timeout = new Promise<never>((_, reject) => {
              timeoutId = setTimeout(
                () =>
                  reject(
                    new AppException(
                      'AI_TIMEOUT',
                      'AI provider timed out',
                      504,
                    ),
                  ),
                25000,
              );
            });

            // 5a. Retrieve relevant knowledge context for augmentation
            const relevantKnowledge =
              await this.knowledgeService.searchRelevantKnowledge(
                tenantId,
                userMessage,
              );
            const systemContext =
              relevantKnowledge.length > 0
                ? relevantKnowledge.join('\n\n')
                : undefined;

            if (!aiResponse) {
              const raceResult = await Promise.race([
                this.aiProvider.generateReply(
                  tenantId,
                  historyText,
                  systemContext,
                ),
                timeout,
              ]);
              clearTimeout(timeoutId!);
              aiResponse = raceResult.reply;
              tokenUsage = {
                prompt: 0,
                completion: 0,
                total: raceResult.tokensUsed,
              };
            } else {
              clearTimeout(timeoutId!);
            }
          } catch (error) {
            // Safety Escalation Layer
            if (error instanceof AiSafetyException) {
              this.logger.warn(
                `AI Safety Exception triggered for conversation ${conversation.id}: ${error.reason}`,
              );

              // Update conversation state to escalated
              await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                  state: 'ESCALATED', // Escalated is Needs Human
                  unreadCount: { increment: 1 },
                },
              });

              // Log the escalation
              await this.prisma.escalationLog.create({
                data: {
                  tenantId: tenantId,
                  conversationId: conversation.id,
                  reason: error.reason,
                  triggeredBy: 'AI',
                  blockedContent: error.blockedContent,
                },
              });

              // Send alert to Sales via WA (using WhatsappSession phone number for alerting)
              const waSession = await this.prisma.whatsappSession.findUnique({
                where: { tenantId },
              });

              if (waSession && waSession.phoneNumber) {
                const salesPhone = waSession.phoneNumber;

                const alertMessage = `🚨 [CLOSINGAN ALERT] 🚨\n\nAI mendeteksi anomali pada percakapan dengan ${conversation.customerName || sender} (${sender}).\nAlasan: ${error.reason}\n\nMohon segera ambil alih percakapan (HUMAN TAKEOVER).`;
                await this.whatsappProvider.sendMessage({
                  tenantId,
                  to: salesPhone,
                  message: alertMessage,
                });
              }

              return { success: false, reason: 'escalated_to_human' };
            }

            if (error instanceof ProviderDegradationException) {
              this.logger.warn(
                `Provider Degradation: AI Circuit Breaker Open. Delaying job ${job.id}.`,
              );
              await job.moveToDelayed(Date.now() + 30000, job.token);
              throw new DelayedError();
            }

            // Fallback for API Errors / Timeouts to prevent infinite BullMQ loops
            this.logger.error(
              `AI Provider Error for conversation ${conversation.id}: ${error instanceof Error ? error.message : 'Unknown'}`,
            );

            await this.prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                state: 'ESCALATED', // Fallback to human assist on technical error
                unreadCount: { increment: 1 },
              },
            });

            const waSession = await this.prisma.whatsappSession.findUnique({
              where: { tenantId },
            });

            if (waSession && waSession.phoneNumber) {
              const salesPhone = waSession.phoneNumber;
              const alertMessage = `🚨 [CLOSINGAN SYSTEM ERROR] 🚨\n\nAI mengalami kendala teknis saat merespon pelanggan ${conversation.customerName || sender} (${sender}).\n\nMohon segera ambil alih percakapan (HUMAN TAKEOVER).`;
              try {
                await this.whatsappProvider.sendMessage({
                  tenantId,
                  to: salesPhone,
                  message: alertMessage,
                });
              } catch (waError) {
                this.logger.warn(
                  {
                    tenantId,
                    error:
                      waError instanceof Error ? waError.message : 'Unknown',
                  },
                  'Failed to send alert message to sales phone',
                );
              }
            }

            return { success: false, reason: 'provider_error_escalated' };
          }

          let sendResult: SendMessageResult;
          try {
            let waTimeoutId: NodeJS.Timeout;
            const timeout = new Promise<never>((_, reject) => {
              waTimeoutId = setTimeout(
                () =>
                  reject(
                    new AppException(
                      'WA_TIMEOUT',
                      'WhatsApp provider timed out',
                      504,
                    ),
                  ),
                15000,
              );
            });

            sendResult = await Promise.race([
              this.whatsappProvider.sendMessage({
                tenantId,
                to: sender,
                message: aiResponse,
              }),
              timeout,
            ]);
            clearTimeout(waTimeoutId!);

            if (!sendResult.success) {
              throw new AppException(
                'WA_SEND_FAILED',
                `Failed to send message: ${sendResult.error}`,
                500,
              );
            }
          } catch (error) {
            if (error instanceof ProviderDegradationException) {
              this.logger.warn(
                `Provider Degradation: WhatsApp Circuit Breaker Open. Delaying job ${job.id}.`,
              );
              await job.moveToDelayed(Date.now() + 30000, job.token);
              throw new DelayedError();
            }

            // Graceful Degradation for Fonnte down
            this.logger.error(
              {
                tenantId,
                error: error instanceof Error ? error.message : 'Unknown',
              },
              `WhatsApp Provider Error for conversation ${conversation.id}`,
            );

            // By throwing an AppException, BullMQ will catch it and apply the exponential backoff defined in the queue config, explicitly delaying processing for this specific job/tenant.
            // This ensures the queue is 'frozen' gracefully using backpressure without crashing the system or dropping messages.
            const waSession = await this.prisma.whatsappSession.findUnique({
              where: { tenantId },
            });

            if (waSession && waSession.phoneNumber) {
              const alertMessage = `🚨 [CLOSINGAN SYSTEM ERROR] 🚨\n\nGagal mengirim pesan WhatsApp ke pelanggan ${conversation.customerName || sender} (${sender}). Mohon periksa koneksi Fonnte.`;
              try {
                // Attempt to alert but ignore failure
                await this.whatsappProvider.sendMessage({
                  tenantId,
                  to: waSession.phoneNumber,
                  message: alertMessage,
                });
              } catch (waError) {
                this.logger.warn(
                  {
                    tenantId,
                    error:
                      waError instanceof Error ? waError.message : 'Unknown',
                  },
                  'Failed to send alert message to customer',
                );
              }
            }

            throw new AppException(
              'WHATSAPP_DISCONNECTED',
              'Fonnte connection failed',
              503,
            );
          }

          // 6. Save outgoing AI message
          const outgoingMessage = await this.prisma.message.create({
            data: {
              tenantId,
              conversationId: conversation.id,
              senderType: 'AI',
              content: aiResponse,
              deliveryState: 'SENT',
              isAiGenerated: true,
              aiMode: conversation.aiMode,
            },
          });

          // 7. Update Conversation state
          await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              lastMessageAt: new Date(),
              lastMessagePreview: aiResponse.substring(0, 100),
              lastSenderType: 'AI',
              unreadCount: 0, // AI read and replied
            },
          });

          // 8. Audit Logging & Quota Update (Deduction tracking)
          if (tokenQuota && tokenUsage.total > 0) {
            await this.prisma.tokenQuota.update({
              where: { tenantId },
              data: {
                usedQuota: { increment: tokenUsage.total },
              },
            });

            // Persist AI usage log
            await this.prisma.aiUsageLog.create({
              data: {
                tenantId,
                conversationId: conversation.id,
                messageId: outgoingMessage.id,
                model: 'gpt-4o-mini',
                promptTokens: tokenUsage.prompt,
                completionTokens: tokenUsage.completion,
                totalTokens: tokenUsage.total,
                latencyMs: 0,
                queueName: 'AI_REPLY',
              },
            });
          }

          this.logger.log(
            `Job ${job.id} completed successfully for tenant ${tenantId}`,
          );

          return { success: true };
        } catch (error) {
          const err = error as Error;
          this.logger.error(
            { jobId: job.id, error: err.message },
            `Failed ai-reply job ${job.id}: ${err.message}`,
          );
          throw error; // Let BullMQ handle retries
        }
      });
    } finally {
      await this.redisService.decr(activeJobsKey);
    }
  }

}
