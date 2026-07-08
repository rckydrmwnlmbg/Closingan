/* eslint-disable @typescript-eslint/no-base-to-string */
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('v1');
  app.enableCors();

  // 1. Logger
  app.useLogger(app.get(Logger));

  // 2. Security Headers & Cookies
  app.use(helmet());
  app.use(cookieParser());

  // 3. Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 4. Global Exception Filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost));

  // 5. Catch Unhandled Promise Rejections
  process.on(
    'unhandledRejection',
    (reason: unknown, promise: Promise<unknown>) => {
      app
        .get(Logger)
        .error(
          `Unhandled Rejection at: ${String(promise)}, reason: ${String(reason)}`,
        );
    },
  );

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});
