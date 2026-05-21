import { Processor, WorkerHost, OnWorkerEvent, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { AiSafetyException } from '../../ai/exceptions/ai-safety.exception';

@Processor('ai-reply', {
  concurrency: 5,
  limiter: {
    max: 10,       // Max 10 jobs processed
    duration: 1000 // per 1 second (1000ms) - backpressure control for OpenAI
  }
})
export class AiReplyWorker extends WorkerHost {
  private readonly logger = new Logger(AiReplyWorker.name);

  constructor(
    private readonly cls: ClsService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject('AI_PROVIDER') private readonly aiProvider: AiProviderInterface,
    @Inject(WHATSAPP_PROVIDER)
    private readonly whatsappProvider: WhatsappProviderInterface,
    @InjectQueue('ai-analysis') private readonly aiAnalysisQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(`Processing ai-reply job ${job.id}`);
    const { tenantId, payload } = job.data;

    // Run inside cls context since worker process isn't wrapped by HTTP middleware
    return this.cls.run(async () => {
      this.cls.set('tenantId', tenantId);

      try {
        await this.auditService.log({
          action: 'AI_MODE_CHANGED' as any, // Using existing enum value for ai trigger log
          entityType: 'JOB',
          entityId: job.id,
          metadata: { step: 'STARTED' }
        });

        // Extract message from Fonnte payload format
        const userMessage = payload.message || payload.text || 'Hello';
        const sender = payload.sender || payload.from;

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
        const incomingMessage = await this.prisma.message.create({
          data: {
            tenantId,
            conversationId: conversation.id,
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

        // 2. Strict Human Override (Anti Double-Reply) for AI Reply part
        if (
          conversation.state === 'HUMAN_ACTIVE' ||
          conversation.aiMode === 'AI_OFF' ||
          (conversation.aiModePausedUntil && conversation.aiModePausedUntil > new Date())
        ) {
          this.logger.log(`Skipping AI reply for conversation ${conversation.id}: Human in control`);
          return { success: true, reason: 'skipped_human_override' };
        }

        // 3. Token Quota Check
        const tokenQuota = await this.prisma.tokenQuota.findUnique({
          where: { tenantId },
        });

        if (tokenQuota && tokenQuota.usedQuota >= tokenQuota.totalQuota) {
          this.logger.warn(`Skipping AI reply: Token quota exhausted for tenant ${tenantId}`);
          return { success: false, reason: 'quota_exhausted' };
        }

        // 4. Core Conversation Logic
        let aiResponse: string;
        try {
          aiResponse = await this.aiProvider.generateReply(tenantId, userMessage);
        } catch (error) {
          // Safety Escalation Layer
          if (error instanceof AiSafetyException) {
            this.logger.warn(`AI Safety Exception triggered for conversation ${conversation.id}: ${error.reason}`);

            // Update conversation state to escalated
            await this.prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                state: 'ESCALATED', // Escalated is Needs Human
                unreadCount: { increment: 1 }
              }
            });

            // Log the escalation
            await this.prisma.escalationLog.create({
              data: {
                tenantId: tenantId,
                conversationId: conversation.id,
                reason: error.reason,
                triggeredBy: 'AI',
                blockedContent: error.blockedContent
              }
            });

            // Send alert to Sales via WA (using WhatsappSession phone number for alerting)
            const waSession = await this.prisma.whatsappSession.findUnique({
              where: { tenantId }
            });

            if (waSession && waSession.fonnteToken && waSession.phoneNumber) {
              const salesPhone = waSession.phoneNumber;

              const alertMessage = `🚨 [CLOSINGAN ALERT] 🚨\n\nAI mendeteksi anomali pada percakapan dengan ${conversation.customerName || sender} (${sender}).\nAlasan: ${error.reason}\n\nMohon segera ambil alih percakapan (HUMAN TAKEOVER).`;
              await this.whatsappProvider.sendMessage({
                tenantId,
                to: salesPhone,
                message: alertMessage,
                tenantToken: waSession.fonnteToken
              });
            }

            return { success: false, reason: 'escalated_to_human' };
          }
          throw error;
        }

        // Fetch WhatsApp session for token
        const waSession = await this.prisma.whatsappSession.findUnique({
          where: { tenantId },
        });

        if (!waSession || !waSession.fonnteToken) {
          throw new Error('WhatsApp session not configured or token missing');
        }

        const sendResult = await this.whatsappProvider.sendMessage({
          tenantId,
          to: sender,
          message: aiResponse,
          tenantToken: waSession.fonnteToken
        });

        if (!sendResult.success) {
          throw new Error(`Failed to send message: ${sendResult.error}`);
        }

        // 5. Save outgoing AI message
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

        // 6. Update Conversation state
        await this.prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(),
            lastMessagePreview: aiResponse.substring(0, 100),
            lastSenderType: 'AI',
            unreadCount: 0, // AI read and replied
          },
        });

        // 7. Audit Logging & Quota Update (Deduction tracking)
        // Deduct 1 from token quota for generating an AI reply
        if (tokenQuota) {
          await this.prisma.tokenQuota.update({
            where: { tenantId },
            data: {
              usedQuota: { increment: 1 }
            }
          });
        }

        await this.auditService.log({
          action: 'AI_MODE_CHANGED' as any,
          entityType: 'JOB',
          entityId: job.id,
          metadata: {
            step: 'COMPLETED',
            messageId: outgoingMessage.id,
            tokensUsed: 1 // Example flat token usage, will integrate with true token usage from OpenAI later
          }
        });

        return { success: true };
      } catch (error: any) {
        this.logger.error(`Failed ai-reply job ${job.id}: ${error.message}`);
        throw error; // Let BullMQ handle retries
      }
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${error.message}`,
      error.stack,
    );
    // When attempts exhaust, bullmq stops retrying. We capture it for DLQ handling.
    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      this.logger.error(`Job ${job.id} has exhausted all retries and moved to Dead Letter Queue behavior.`);
      // Run in a new context as we may need to insert to DB independently of the queue job run context
      await this.cls.run(async () => {

        await this.prisma.failedJob.create({
          data: {
            queueName: 'AI_REPLY' as any, // Adjust to Prisma QueueName enum if exact string differs
            jobId: job.id || 'unknown',
            jobData: job.data,
            errorMessage: error.message,
            errorStack: error.stack,
            attemptCount: job.attemptsMade,
          }
        });

        await this.auditService.log({
          action: 'WA_DISCONNECTED' as any, // Nearest semantic log to a disconnected process
          tenantId: job.data.tenantId, // Must provide tenantId due to Isolation rule
          entityType: 'FAILED_JOB',
          entityId: job.id,
          metadata: {
            error: error.message,
            queue: 'ai-reply',
            attempts: job.attemptsMade
          }
        });
      });
    }
  }
}
