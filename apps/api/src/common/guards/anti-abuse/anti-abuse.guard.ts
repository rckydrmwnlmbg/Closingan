import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AntiAbuseService } from './anti-abuse.service';

@Injectable()
export class AntiAbuseGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly antiAbuseService: AntiAbuseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip non-HTTP contexts like WebSockets
    if (!request || !request.headers) {
      return true;
    }

    const fingerprintHash = this.antiAbuseService.generateFingerprint(request);

    // Check if fingerprint exists in AbusiveClient table
    const blockedClient = await this.prisma.abusiveClient.findUnique({
      where: { fingerprintHash },
    });

    if (blockedClient) {
      throw new ForbiddenException(
        'Access denied: Client blocked due to abuse or violation of terms.',
      );
    }

    return true;
  }
}
