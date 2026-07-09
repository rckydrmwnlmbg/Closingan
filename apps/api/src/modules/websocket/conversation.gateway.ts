import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { RedisService } from '../../common/redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for production
  },
})
@Injectable()
export class ConversationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConversationGateway.name);

  private async emitDebounced(
    room: string,
    event: string,
    key: string,
    data: Record<string, unknown> | string | number | boolean,
    delayMs = 500,
  ) {
    const timestamp = Date.now().toString() + Math.random().toString();
    const ttlSeconds = Math.ceil(delayMs / 1000) + 1;
    await this.redisService.set(key, timestamp, ttlSeconds);

    setTimeout(async () => {
      const current = await this.redisService.get(key);
      if (current === timestamp) {
        // This instance was the last one to schedule the emit, so it executes
        this.server.to(room).emit(event, data);
        await this.redisService.del(key);
      }
    }, delayMs);
  }

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
    private readonly redisService: RedisService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHeader(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{
        tenantId: string;
        sub: string;
      }>(token, {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'default_secret',
      });

      const tenantId = payload.tenantId;

      if (!tenantId) {
        client.disconnect();
        return;
      }

      // Hard constraint: Tenant-scoped rooms — cross-tenant broadcast is a security violation
      const room = `tenant-${tenantId}`;
      void client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);

      client.data = (client.data as Record<string, unknown>) || {};
      (client.data as Record<string, unknown>).user = {
        userId: payload.sub,
        tenantId,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Connection error for client ${client.id}: ${err.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authorization = client.handshake.headers.authorization;
    if (authorization) {
      const [type, token] = authorization.split(' ');
      if (type === 'Bearer') return token;
    }
    return (
      (client.handshake.auth?.token as string) ||
      (client.handshake.query?.token as string)
    );
  }

  // --- Broadcast Methods for Internal Services ---
  // Hard constraint: Broadcast methods must strictly derive the target room from ClsService context
  // rather than trusting caller-provided tenant IDs to prevent broadcast leakage.

  broadcastConversationUpdated(
    tenantId: string,
    data: { conversationId: string; unreadCount: number; lastMessage: string },
  ) {
    const activeTenantId = this.cls.get<string>('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }

    // Performance Optimization: Distributed Debounce for horizontal scaling
    const room = `tenant-${activeTenantId}`;
    const key = `debounce:${room}:conv_updated:${data.conversationId}`;
    this.emitDebounced(room, 'conversation:updated', key, data, 500);
  }

  broadcastConversationStateChanged(
    tenantId: string,
    data: { conversationId: string; state: string },
  ) {
    const activeTenantId = this.cls.get<string>('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server
      .to(`tenant-${activeTenantId}`)
      .emit('conversation:state_changed', data);
  }

  broadcastLeadHeatChanged(
    tenantId: string,
    data: { conversationId: string; heatTier: string; heatReasons: string[] },
  ) {
    const activeTenantId = this.cls.get<string>('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server.to(`tenant-${activeTenantId}`).emit('lead:heat_changed', data);
  }

  broadcastAiModeChanged(
    tenantId: string,
    data: { conversationId: string; aiMode: string },
  ) {
    const activeTenantId = this.cls.get<string>('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server.to(`tenant-${activeTenantId}`).emit('ai:mode_changed', data);
  }

  broadcastSystemAlert(
    tenantId: string,
    data: { type: string; message: string; conversationId?: string },
  ) {
    const activeTenantId = this.cls.get<string>('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server.to(`tenant-${activeTenantId}`).emit('system:alert', data);
  }

  broadcastAiSuggestion(
    tenantId: string,
    data: { conversationId: string; suggestion: string },
  ) {
    const activeTenantId = this.cls.get<string>('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server.to(`tenant-${activeTenantId}`).emit('ai:suggestion', data);
  }
}
