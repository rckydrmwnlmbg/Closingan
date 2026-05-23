import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { cleanDatabase } from './test-helper';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Do NOT set global prefix in tests, as controllers ALREADY have 'v1' in their decorator (e.g. @Controller('v1/auth')).
    // Setting global prefix 'v1' will make the route '/v1/v1/auth'
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

  let userId: string;
  let otpCode: string;
  let accessToken: string;
  let refreshToken: string;

  it('1. Register', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({
        email: 'authflow@example.com',
        password: 'password123',
        fullName: 'Auth Flow User',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBeDefined();
    userId = res.body.data.userId;

    const otpRecord = await prisma.otpCode.findFirst({ where: { userId } });
    expect(otpRecord).toBeDefined();
    otpCode = otpRecord!.code;
  });

  it('2. Verify OTP', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/verify-otp')
      .send({ userId, code: otpCode })
      .expect(200);

    expect(res.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user!.emailVerified).toBe(true);
  });

  it('3. Login', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'authflow@example.com', password: 'password123' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('4. Access protected endpoint', async () => {
    // Calling /v1/auth/logout without a body will fail its own validation but it checks auth first
    // Actually let's find a simple protected endpoint. We don't have a simple GET /me maybe?
    // /v1/auth/logout with valid token will return 200 or 400 depending on body, 401 if token is bad.
    // Let's use /v1/whatsapp/qr-status which is protected
    const res = await request(app.getHttpServer())
      .get('/whatsapp/qr-status')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200); // qr-status usually returns 200 with success: true and data: DISCONNECTED
    expect(res.body.success).toBe(true);
  });

  it('5. Refresh Token', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('6. Logout', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);

    // Make sure token is marked as used in DB
    const tokenInDb = await prisma.refreshToken.findFirst({
      where: { token: refreshToken },
    });
    expect(tokenInDb!.usedAt).not.toBeNull();
  });
});
