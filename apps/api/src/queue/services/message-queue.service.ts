import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class MessageQueueService {
  private readonly logger = new Logger(MessageQueueService.name);

  constructor(
    @InjectQueue('incoming-messages-queue')
    private readonly incomingMessagesQueue: Queue,
  ) {}

  /**
   * Enqueues an incoming message with strict backoff policies to act as a governor.
   */
  async enqueueMessage(tenantId: string, payload: Record<string, unknown>) {
    this.logger.debug(`Enqueueing message for tenant ${tenantId}`);

    return this.incomingMessagesQueue.add(
      'process-incoming-message',
      { tenantId, payload },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }
}
