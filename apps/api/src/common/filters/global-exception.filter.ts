import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AppException } from '../exceptions/app.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: Record<string, unknown> = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      },
    };

    if (exception instanceof AppException) {
      httpStatus = exception.getStatus();
      responseBody = exception.getResponse() as Record<string, unknown>;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const res = exception.getResponse();

      const message =
        typeof res === 'string'
          ? res
          : (res as Record<string, unknown>).message || exception.message;
      const code =
        typeof res === 'string'
          ? 'HTTP_ERROR'
          : (res as Record<string, unknown>).error || 'HTTP_ERROR';

      responseBody = {
        success: false,
        error: {
          code,
          message,
        },
      };
    } else {
      // Log unhandled exceptions
      this.logger.error(
        `Unhandled Exception: ${exception instanceof Error ? exception.stack : String(exception)}`,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
