import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadResult {
  url: string;
  key: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly cdnUrl: string;
  private readonly isS3Enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.cdnUrl = this.configService.get<string>('CDN_URL') || '';
    this.isS3Enabled = !!this.configService.get<string>('AWS_S3_BUCKET');
    
    if (this.cdnUrl) {
      this.logger.log(`Storage service initialized with CDN URL: ${this.cdnUrl}`);
    } else {
      this.logger.warn('Storage service initialized without CDN. Using direct URLs.');
    }
  }

  /**
   * Uploads a file buffer to the configured storage provider (S3 or Local fallback).
   */
  async uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<UploadResult> {
    const uniqueKey = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}`;
    
    if (this.isS3Enabled) {
      // TODO: Implement actual S3 upload logic here using aws-sdk or @aws-sdk/client-s3
      this.logger.debug(`[S3 MOCK] Uploading ${originalName} to S3 bucket...`);
      // Simulating network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        key: uniqueKey,
        url: this.getPublicUrl(uniqueKey),
      };
    } else {
      // Fallback: Local filesystem or just return a dummy URL for development
      this.logger.debug(`[LOCAL MOCK] Storing ${originalName} to local filesystem...`);
      return {
        key: uniqueKey,
        url: `/uploads/${uniqueKey}`,
      };
    }
  }

  /**
   * Returns a publicly accessible URL for a given storage key.
   * Routes through CDN if configured.
   */
  getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      // Strip trailing slash if present on cdnUrl
      const base = this.cdnUrl.endsWith('/') ? this.cdnUrl.slice(0, -1) : this.cdnUrl;
      return `${base}/${key}`;
    }
    
    if (this.isS3Enabled) {
      // Fallback direct S3 URL
      const bucket = this.configService.get<string>('AWS_S3_BUCKET');
      const region = this.configService.get<string>('AWS_REGION', 'ap-southeast-1');
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    return `/uploads/${key}`;
  }
}
