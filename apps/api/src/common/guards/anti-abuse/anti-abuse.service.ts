import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class AntiAbuseService {
  /**
   * Generates a device fingerprint hash based on the IP address and User-Agent.
   */
  generateFingerprint(req: Request): string {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown-ip';
    const userAgent = req.headers['user-agent'] || 'unknown-ua';

    // Normalize IP if x-forwarded-for returns a list
    const normalizedIp = Array.isArray(ip)
      ? ip[0]
      : typeof ip === 'string'
        ? ip.split(',')[0].trim()
        : ip;

    const rawFingerprint = `${normalizedIp}|${userAgent}`;

    return createHash('sha256').update(rawFingerprint).digest('hex');
  }
}
