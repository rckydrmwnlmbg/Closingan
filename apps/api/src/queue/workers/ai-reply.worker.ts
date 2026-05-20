import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import type { AiProviderInterface } from '../../ai/interfaces/ai-provider.interface';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import type { WhatsappProviderInterface } from '../../whatsapp/interfaces/whatsapp-provider.interface';

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

        // Core Conversation Logic
        const aiResponse = await this.aiProvider.generateReply(tenantId, userMessage);

        const sendResult = await this.whatsappProvider.sendMessage({
          tenantId,
          to: sender,
          message: aiResponse,
          tenantToken: 'DUMMY_TOKEN_FROM_DB' // In a real app we fetch tenant configuration from DB
        });

        if (!sendResult.success) {
          throw new Error(`Failed to send message: ${sendResult.error}`);
        }

        await this.auditService.log({
          action: 'AI_MODE_CHANGED' as any,
          entityType: 'JOB',
          entityId: job.id,
          metadata: { step: 'COMPLETED' }
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
