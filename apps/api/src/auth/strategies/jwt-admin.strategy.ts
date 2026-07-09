import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Access denied. Super Admin only.');
    }

    const admin = await this.prisma.systemAdmin.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException('Admin account not found or inactive');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
