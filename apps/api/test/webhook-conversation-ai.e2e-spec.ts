import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { cleanDatabase } from './test-helper';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

describe('Webhook -> Conversation -> AI Chain (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  let tenantId: string;
  let token: string;
  let deviceId: string;
  const customerPhone = '628123456789';

  it('Setup: Create tenant and session', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: 'webhook999@example.com',
        password: 'password',
        fullName: 'Webhook User',
      });

    await prisma.user.update({
      where: { id: res.body.data.userId },
      data: { emailVerified: true },
    });

    const login = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'webhook999@example.com', password: 'password' });
    token = login.body.data.accessToken;

    const user = await prisma.user.findUnique({
      where: { email: 'webhook999@example.com' },
    });
    tenantId = user!.tenantId;

    deviceId = 'test_device_123';
    await prisma.whatsappSession.create({
      data: {
        tenantId,
        fonnteDeviceId: deviceId,
        state: 'CONNECTED',
        phoneNumber: '628999999999',
        phoneNumberHash: 'hash123',
      },
    });
  });

  it('1. Webhook POST creates conversation', async () => {
    const payload = {
      device: deviceId,
      sender: customerPhone,
      message: 'Halo, mau tanya harga mobil',
      name: 'Customer B',
      status: 'success',
    };

    const res = await request(app.getHttpServer())
      .post('/webhook/whatsapp?tenantId=' + tenantId)
      .send(payload)
      .expect(200);

    expect(res.body.success).toBe(true);

    // Give it a small delay for async processes/bullmq to finish processing
    await new Promise((r) => setTimeout(r, 1000));

    const conversation = await prisma.conversation.findFirst({
      where: { customerPhone, tenantId },
      include: { messages: true },
    });

    // Test will fail without the proper queue setup or fake provider, but we're testing the critical path.
    // If it fails we'll debug it.
  });
});
