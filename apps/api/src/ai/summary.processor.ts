import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { QueueName } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import type { AiProviderInterface } from './interfaces/ai-provider.interface';

@Processor(QueueName.SUMMARY)
export class SummaryProcessor extends WorkerHost {
  private readonly logger = new Logger(SummaryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('AI_PROVIDER')
    private readonly aiProvider: AiProviderInterface,
  ) {
    super();
  }

  async process(job: Job<{ tenantId: string; conversationId: string }>): Promise<any> {
    const { tenantId, conversationId } = job.data;

    try {
      const messages = await this.prisma.message.findMany({
        where: { tenantId, conversationId },
        orderBy: { createdAt: 'asc' },
      });

      if (messages.length === 0) return;

      const formattedContext = messages
        .map((msg) => `[${msg.senderType}]: ${msg.content}`)
        .join('\n');

      const prompt = `Buatkan ringkasan dari percakapan berikut:
1. Ringkasan 3-5 kalimat
2. Status lead (INTERESTED / NOT_INTERESTED / FOLLOW_UP_NEEDED / DEAL_DONE)
3. Recommended next action
4. Key info (budget, tipe, timeline)

Format respons wajib JSON: { "summaryText": "...", "leadStatus": "...", "nextAction": "...", "keyInfo": "..." }

Percakapan:
${formattedContext}`;

      const aiResponse = await this.aiProvider.generateReply(tenantId, prompt);
      
      let parsed;
      try {
        parsed = JSON.parse(aiResponse.reply);
      } catch (e) {
        this.logger.error(`Failed to parse AI summary as JSON`, e);
        return;
      }

      await this.prisma.conversationSummary.upsert({
        where: { conversationId },
        update: {
          summaryText: parsed.summaryText || '',
          leadStatus: parsed.leadStatus || 'UNKNOWN',
          nextAction: parsed.nextAction || '',
          keyInfo: parsed.keyInfo || '',
        },
        create: {
          tenantId,
          conversationId,
          summaryText: parsed.summaryText || '',
          leadStatus: parsed.leadStatus || 'UNKNOWN',
          nextAction: parsed.nextAction || '',
          keyInfo: parsed.keyInfo || '',
        },
      });

      this.logger.log(`Summary created for conversation ${conversationId}`);
    } catch (error) {
      this.logger.error(`Error generating summary for ${conversationId}`, error);
      throw error;
    }
  }
}
