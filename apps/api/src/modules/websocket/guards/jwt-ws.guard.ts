import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'default_secret',
      });

      // Attach user to socket client directly so we can use it in Gateway
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        role: payload.role,
      };

      if (payload.tenantId) {
        this.cls.set('tenantId', payload.tenantId);
      }
      if (payload.sub) {
        this.cls.set('user', client.data.user);
      }
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authorization = client.handshake.headers.authorization;
    if (authorization) {
      const [type, token] = authorization.split(' ');
      return type === 'Bearer' ? token : undefined;
    }
    // As a fallback, check query param or auth payload in connect
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    return token as string;
  }
}
