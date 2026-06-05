import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class MetaSignatureGuard implements CanActivate {
  private readonly logger = new Logger(MetaSignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signatureHeader = request.headers['x-hub-signature-256'];

    if (!signatureHeader || typeof signatureHeader !== 'string') {
      this.logger.warn('Missing or invalid x-hub-signature-256 header');
      throw new UnauthorizedException('Missing signature');
    }

    const appSecret = this.configService.get<string>('META_APP_SECRET');
    if (!appSecret) {
      this.logger.error('META_APP_SECRET is not configured');
      throw new UnauthorizedException('Server configuration error');
    }

    // Extract signature hash part (after 'sha256=')
    const [algorithm, providedHash] = signatureHeader.split('=');

    if (algorithm !== 'sha256' || !providedHash) {
      this.logger.warn('Invalid signature format');
      throw new UnauthorizedException('Invalid signature format');
    }

    const rawBody = request.rawBody;
    if (!rawBody) {
      this.logger.error('Raw body not found on request');
      throw new UnauthorizedException('Missing raw body');
    }

    // Compute expected hash
    const expectedHash = createHmac('sha256', appSecret)
      .update(rawBody)
      .digest('hex');

    // Secure comparison to prevent timing attacks
    const providedHashBuffer = Buffer.from(providedHash, 'utf8');
    const expectedHashBuffer = Buffer.from(expectedHash, 'utf8');

    if (providedHashBuffer.length !== expectedHashBuffer.length) {
      this.logger.warn('Signature length mismatch');
      throw new UnauthorizedException('Invalid signature');
    }

    const isValid = timingSafeEqual(providedHashBuffer, expectedHashBuffer);

    if (!isValid) {
      this.logger.warn('Signature verification failed');
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
