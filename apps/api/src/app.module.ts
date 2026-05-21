import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AiModule } from './ai/ai.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { WebhookModule } from './webhook/webhook.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AuditModule } from './common/audit/audit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConversationModule } from './modules/conversation/conversation.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { LeadModule } from './modules/lead/lead.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        return {
          pinoHttp: {
            level: isProduction ? 'info' : 'debug',
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            // Redact sensitive headers/data
            redact: ['req.headers.authorization', 'req.headers.cookie'],
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuditModule,
    MailModule,
    AuthModule,
    QueueModule,
    WhatsappModule,
    HealthModule,
    AiModule,
    WebhookModule,
    ConversationModule,
    WebsocketModule,
    LeadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
