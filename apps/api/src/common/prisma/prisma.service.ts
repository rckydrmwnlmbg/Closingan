import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppException } from '../exceptions/app.exception';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private extendedClient: any;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Apply 10-second timeout
            const timeoutMs = 10000;
            let timeoutId: NodeJS.Timeout;

            const timeoutPromise = new Promise((_, reject) => {
              timeoutId = setTimeout(() => {
                reject(
                  new AppException(
                    'DB_TIMEOUT',
                    `Database query timed out for ${model as string}.${operation}`,
                    504,
                  ),
                );
              }, timeoutMs);
            });

            try {
              const result = await Promise.race([query(args), timeoutPromise]);
              return result;
            } finally {
              clearTimeout(timeoutId!);
            }
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    Object.assign(this, this.extendedClient);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
