/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { RedisModule } from './common/redis/redis.module';
import { WebhookModule } from './webhook/webhook.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AuditModule } from './common/audit/audit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConversationModule } from './modules/conversation/conversation.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { LeadModule } from './modules/lead/lead.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FollowUpModule } from './modules/follow-up/follow-up.module';
import { BillingModule } from './modules/billing/billing.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { AntiAbuseModule } from './common/guards/anti-abuse/anti-abuse.module';
import { AntiAbuseControllerModule } from './modules/anti-abuse/anti-abuse.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BackupModule } from './modules/backup/backup.module';
import { AntiAbuseGuard } from './common/guards/anti-abuse/anti-abuse.guard';
import { TenantModule } from './modules/tenant/tenant.module';
import { DeviceModule } from './modules/device/device.module';
import { BotConfigModule } from './modules/bot-config/bot-config.module';
import { UsersModule } from './modules/users/users.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AdminModule } from './modules/admin/admin.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
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
    ThrottlerModule.forRootAsync({
      imports: [RedisModule, ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 10,
          },
        ],
      }),
    }),
    PrismaModule,
    RedisModule,
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
    DashboardModule,
    FollowUpModule,
    BillingModule,
    CampaignModule,
    KnowledgeModule,
    AntiAbuseModule,
    AntiAbuseControllerModule,
    AnalyticsModule,
    BackupModule,
    TenantModule,
    DeviceModule,
    BotConfigModule,
    UsersModule,
    SettingsModule,
    AdminModule,
    StatusModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AntiAbuseGuard,
    },
  ],
})
export class AppModule {}
