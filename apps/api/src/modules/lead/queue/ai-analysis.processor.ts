import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { HotLeadService } from '../hot-lead.service';
import { ClsService } from 'nestjs-cls';
import { AiAnalysisJobData } from '../../../queue/interfaces/job-data.interface';

@Processor('ai-analysis')
export class AiAnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AiAnalysisProcessor.name);

  constructor(
    private readonly hotLeadService: HotLeadService,
    private readonly cls: ClsService,
  ) {
    super();
  }

  async process(
    job: Job<AiAnalysisJobData, unknown, string>,
  ): Promise<unknown> {
    const { tenantId, conversationId, messageContent } = job.data;

    if (!tenantId || !conversationId || !messageContent) {
      this.logger.warn(`Invalid job data for ai-analysis: ${job.id}`);
      return;
    }

    // MEMORY REQUIREMENT: Background workers MUST explicitly wrap execution in cls.run()
    // and manually inject context variables like tenantId to maintain isolation.
    return this.cls.run(async () => {
      this.cls.set('tenantId', tenantId);

      this.logger.log(
        `Processing AI analysis for conversation: ${conversationId}`,
      );
      try {
        await this.hotLeadService.analyzeLead(
          tenantId,
          conversationId,
          messageContent,
        );
      } catch (error) {
        this.logger.error(
          `Error during AI analysis for ${conversationId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        throw error;
      }
    });
  }
}
