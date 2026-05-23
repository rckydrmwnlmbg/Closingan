import { Injectable, Logger, UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

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

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHeader(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
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
      client.join(room);
      this.logger.log(`Client ${client.id} joined room: ${room}`);

      client.data.user = {
        userId: payload.sub,
        tenantId,
      };
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
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
    const activeTenantId = this.cls.get('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server
      .to(`tenant-${activeTenantId}`)
      .emit('conversation:updated', data);
  }

  broadcastConversationStateChanged(
    tenantId: string,
    data: { conversationId: string; state: string },
  ) {
    const activeTenantId = this.cls.get('tenantId');
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
    const activeTenantId = this.cls.get('tenantId');
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
    const activeTenantId = this.cls.get('tenantId');
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
    const activeTenantId = this.cls.get('tenantId');
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
    const activeTenantId = this.cls.get('tenantId');
    if (!activeTenantId || activeTenantId !== tenantId) {
      this.logger.warn(
        `Security Violation: Attempted cross-tenant broadcast. Context: ${activeTenantId}, Target: ${tenantId}`,
      );
      return;
    }
    this.server.to(`tenant-${activeTenantId}`).emit('ai:suggestion', data);
  }
}
