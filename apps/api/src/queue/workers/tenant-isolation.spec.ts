import { Test, TestingModule } from '@nestjs/testing';
import { IncomingMessagesWorker } from './incoming-messages.worker';
import { ClsService } from 'nestjs-cls';
import { RedisService } from '../../common/redis/redis.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiService } from '../../ai/ai.service';

import { Job, DelayedError } from 'bullmq';

describe('Tenant Isolation (Noisy Neighbor)', () => {
  let worker: IncomingMessagesWorker;
  let redisService: jest.Mocked<RedisService>;
  let clsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    redisService = {
      incr: jest.fn(),
      decr: jest.fn(),
      expire: jest.fn(),
    } as any;

    clsService = {
      run: jest.fn((cb) => cb()),
      set: jest.fn(),
    } as any;

    const aiService = {
      generateSuggestedReply: jest.fn().mockResolvedValue('Hello AI'),
    };

    const prismaService = {
      message: {
        create: jest.fn().mockResolvedValue({ id: 'msg-1' }),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomingMessagesWorker,
        { provide: RedisService, useValue: redisService },
        { provide: ClsService, useValue: clsService },
        { provide: PrismaService, useValue: prismaService },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    worker = module.get<IncomingMessagesWorker>(IncomingMessagesWorker);
  });

  it('should process job when concurrency limit is not exceeded', async () => {
    const job = {
      id: 'job-1',
      data: { tenantId: 'tenant-1', payload: 'test' },
    } as unknown as Job;

    redisService.incr.mockResolvedValue(1);

    await worker.process(job);

    expect(redisService.incr).toHaveBeenCalledWith(
      'tenant:tenant-1:incoming-active',
    );
    expect(redisService.expire).toHaveBeenCalledWith(
      'tenant:tenant-1:incoming-active',
      60,
    );
    expect(clsService.run).toHaveBeenCalled();
    expect(redisService.decr).toHaveBeenCalledWith(
      'tenant:tenant-1:incoming-active',
    );
  });

  it('should delay job and throw DelayedError when concurrency limit is exceeded', async () => {
    const job = {
      id: 'job-2',
      data: { tenantId: 'noisy-tenant', payload: 'spam' },
      moveToDelayed: jest.fn().mockResolvedValue(true),
      token: 'token-abc',
    } as unknown as Job;

    redisService.incr.mockResolvedValue(3); // > 2 (MAX_CONCURRENT_PER_TENANT)

    await expect(worker.process(job)).rejects.toThrow(DelayedError);

    expect(redisService.decr).toHaveBeenCalledWith(
      'tenant:noisy-tenant:incoming-active',
    );
    expect(job.moveToDelayed).toHaveBeenCalledWith(
      expect.any(Number),
      'token-abc',
    );
    expect(clsService.run).not.toHaveBeenCalled();
  });
});
