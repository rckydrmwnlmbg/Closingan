import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';
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
    } else if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      httpStatus = HttpStatus.CONFLICT;
      responseBody = {
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: 'Data already exists.',
          details: exception.meta,
        },
      };
    } else {
      // Log unhandled exceptions
      this.logger.error(
        {
          error:
            exception instanceof Error ? exception.message : String(exception),
        },
        `Unhandled Exception: ${exception instanceof Error ? exception.stack : String(exception)}`,
      );
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
