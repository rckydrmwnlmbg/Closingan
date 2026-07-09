import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../common/cache/cache.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_ACCESS_SECRET') || 'default_secret',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    tenantId: string;
    role: string;
  }) {
    const cacheKey = `session:${payload.sub}`;
    let isValid = await this.cacheService.get<boolean>(cacheKey, 'user_session');

    if (isValid === null) {
      // Check in DB if user is valid/active
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true }
      });
      
      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }
      
      isValid = true;
      // Cache for 15 minutes (900 seconds)
      await this.cacheService.set(cacheKey, isValid, 900);
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    };
  }
}
