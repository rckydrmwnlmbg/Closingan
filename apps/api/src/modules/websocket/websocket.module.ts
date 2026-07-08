import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationGateway } from './conversation.gateway';
import { JwtWsGuard } from './guards/jwt-ws.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [ConversationGateway, JwtWsGuard],
  exports: [ConversationGateway],
})
export class WebsocketModule {}
