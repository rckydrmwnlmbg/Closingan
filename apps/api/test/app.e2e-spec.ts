import { Test, TestingModule } from '@nestjs/testing';
import { AI_PROVIDER } from '../src/ai/interfaces/ai-provider.interface';
import { mockQueue, mockOpenAiService, MockWorker } from './test-mocks';
import { getQueueToken } from '@nestjs/bullmq';
import { AiAnalysisProcessor } from '../src/modules/lead/queue/ai-analysis.processor';
import { HotLeadProcessor } from '../src/modules/lead/queue/hot-lead.processor';
import { AiReplyWorker } from '../src/queue/workers/ai-reply.worker';
import { BlastWorker } from '../src/queue/workers/blast.worker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(AI_PROVIDER).useValue(mockOpenAiService).overrideProvider(getQueueToken('ai-reply')).useValue(mockQueue).overrideProvider(getQueueToken('blast-campaign')).useValue(mockQueue).overrideProvider(getQueueToken('hot-lead')).useValue(mockQueue).overrideProvider(getQueueToken('campaign-worker')).useValue(mockQueue).overrideProvider(getQueueToken('ai-analysis')).useValue(mockQueue).overrideProvider(getQueueToken('health-check')).useValue(mockQueue).overrideProvider(getQueueToken('escalation')).useValue(mockQueue).overrideProvider(getQueueToken('follow-up')).useValue(mockQueue).overrideProvider(getQueueToken('summary')).useValue(mockQueue).overrideProvider(getQueueToken('analytics')).useValue(mockQueue).overrideProvider(AiAnalysisProcessor).useValue(MockWorker).overrideProvider(HotLeadProcessor).useValue(MockWorker).overrideProvider(AiReplyWorker).useValue(MockWorker).overrideProvider(BlastWorker).useValue(MockWorker).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
