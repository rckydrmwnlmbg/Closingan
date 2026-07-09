import { Module } from '@nestjs/common';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminService } from './system-admin.service';
import { JwtAdminStrategy } from '../../auth/strategies/jwt-admin.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [SystemAdminController],
  providers: [SystemAdminService, JwtAdminStrategy],
})
export class SystemAdminModule {}

