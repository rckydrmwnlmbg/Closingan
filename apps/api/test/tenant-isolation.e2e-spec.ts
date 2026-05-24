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
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { cleanDatabase } from './test-helper';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).overrideProvider(AI_PROVIDER).useValue(mockOpenAiService).overrideProvider(getQueueToken('ai-reply')).useValue(mockQueue).overrideProvider(getQueueToken('blast-campaign')).useValue(mockQueue).overrideProvider(getQueueToken('hot-lead')).useValue(mockQueue).overrideProvider(getQueueToken('campaign-worker')).useValue(mockQueue).overrideProvider(getQueueToken('ai-analysis')).useValue(mockQueue).overrideProvider(getQueueToken('health-check')).useValue(mockQueue).overrideProvider(getQueueToken('escalation')).useValue(mockQueue).overrideProvider(getQueueToken('follow-up')).useValue(mockQueue).overrideProvider(getQueueToken('summary')).useValue(mockQueue).overrideProvider(getQueueToken('analytics')).useValue(mockQueue).overrideProvider(AiAnalysisProcessor).useValue(MockWorker).overrideProvider(HotLeadProcessor).useValue(MockWorker).overrideProvider(AiReplyWorker).useValue(MockWorker).overrideProvider(BlastWorker).useValue(MockWorker).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    const queueToken = getQueueToken('ai-reply');
    const queue = app.get<Queue>(queueToken);
    await queue.pause();
    await queue.drain();

    await cleanDatabase(prisma);
    await app.close();
  });

  let tenantAToken: string;
  let tenantBToken: string;

  it('Setup: Create 2 tenants', async () => {
    // Tenant A
    const resA = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: 'userAti@example.com',
        password: 'password123',
        fullName: 'User A',
      })
      .expect(201);

    await prisma.user.update({
      where: { id: resA.body.data.userId },
      data: { emailVerified: true },
    });

    const loginA = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'userAti@example.com', password: 'password123' })
      .expect(200);
    tenantAToken = loginA.body.data.accessToken;

    const userA = await prisma.user.findUnique({
      where: { email: 'userAti@example.com' },
    });
    const tenantAId = userA!.tenantId;

    // Tenant B
    const resB = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: 'userBti@example.com',
        password: 'password123',
        fullName: 'User B',
      })
      .expect(201);

    await prisma.user.update({
      where: { id: resB.body.data.userId },
      data: { emailVerified: true },
    });

    const loginB = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'userBti@example.com', password: 'password123' })
      .expect(200);
    tenantBToken = loginB.body.data.accessToken;

    const userB = await prisma.user.findUnique({
      where: { email: 'userBti@example.com' },
    });
    const tenantBId = userB!.tenantId;

    // Create a conversation for Tenant A
    await prisma.conversation.create({
      data: {
        tenantId: tenantAId,
        customerName: 'Customer A',
        customerPhone: '628123456789',
        state: 'OPEN',
      },
    });

    // Create a conversation for Tenant B
    await prisma.conversation.create({
      data: {
        tenantId: tenantBId,
        customerName: 'Customer B',
        customerPhone: '628987654321',
        state: 'OPEN',
      },
    });
  });

  it('User A should only see 1 conversation', async () => {
    const res = await request(app.getHttpServer())
      .get('/conversations') // assuming endpoints are properly mapped without prefix, verify this later
      .set('Authorization', `Bearer ${tenantAToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].customerName).toBe('Customer A');
  });

  it('User B should only see 1 conversation', async () => {
    const res = await request(app.getHttpServer())
      .get('/conversations')
      .set('Authorization', `Bearer ${tenantBToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].customerName).toBe('Customer B');
  });
});
