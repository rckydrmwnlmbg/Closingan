import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FonnteWebhookPayload } from '../../whatsapp/interfaces/fonnte-webhook.interface';
import { ClsService } from 'nestjs-cls';
import { MessageQueueService } from '../../queue/services/message-queue.service';

@Injectable()
export class MessageIngestionService {
  private readonly logger = new Logger(MessageIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async processIncomingMessage(
    tenantId: string,
    payload: FonnteWebhookPayload,
  ) {
    this.cls.set('tenantId', tenantId);

    const senderNumber = payload.sender || payload.from;
    const deviceNumber = payload.device;
    const messageText = payload.message || payload.pesan || payload.text;

    if (!senderNumber || !deviceNumber || !messageText) {
      this.logger.error(
        { tenantId, payload },
        'Missing required payload fields for ingestion',
      );
      return;
    }

    const isOutgoing = senderNumber === deviceNumber;
    const prospectNumber = isOutgoing ? payload.to : senderNumber;

    if (!prospectNumber) {
      this.logger.error(
        { tenantId, payload },
        'Unable to determine prospect number',
      );
      return;
    }

    const phoneNormalized = prospectNumber.replace(/\D/g, '');
    const prospectName = payload.name || 'Unknown';

    // Ensure Conversation exists
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        tenantId,
        customerPhone: phoneNormalized,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          tenantId,
          customerPhone: phoneNormalized,
          customerName: prospectName,
        },
      });
      this.logger.log(
        { tenantId, conversationId: conversation.id },
        'Created new conversation',
      );
    } else {
      // Update conversation timestamp
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          updatedAt: new Date(),
          customerName: prospectName, // update name if available
        },
      });
    }

    // Ensure Lead exists
    let lead = await this.prisma.lead.findUnique({
      where: {
        conversationId: conversation.id,
      },
    });

    if (!lead) {
      lead = await this.prisma.lead.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          customerPhone: phoneNormalized,
          customerName: prospectName,
        },
      });
      this.logger.log({ tenantId, leadId: lead.id }, 'Created new lead');
    }

    // Determine sender type
    let senderType: 'CUSTOMER' | 'AI' | 'SELLER' | 'SYSTEM' = 'CUSTOMER';
    if (isOutgoing) {
      senderType = 'SELLER'; // Assuming it's human agent if it matches device number via Fonnte webhook
    }

    // Save Message
    const message = await this.prisma.message.create({
      data: {
        tenantId,
        conversationId: conversation.id,
        senderType,
        content: messageText,
        externalId: payload.id,
      },
    });

    this.logger.log(
      { tenantId, messageId: message.id },
      'Ingested new message successfully',
    );

    // Dispatch job to incoming-messages-queue
    if (senderType === 'CUSTOMER') {
      await this.messageQueueService.enqueueMessage(tenantId, {
        conversationId: conversation.id,
      });
    }

    return message;
  }
}
