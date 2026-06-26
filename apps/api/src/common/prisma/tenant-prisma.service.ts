/* eslint-disable */
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

const EXEMPTED_MODELS = [
  'Tenant',
  'RefreshToken',
  'OtpCode',
  'UserBadge',
  'FailedJob',
];

@Injectable()
export class TenantPrismaService implements OnModuleInit, OnModuleDestroy {
  private baseClient: PrismaClient;
  public readonly client: any;
  private readonly logger = new Logger(TenantPrismaService.name);

  constructor(private readonly cls: ClsService) {
    this.baseClient = new PrismaClient();

    const self = this;

    // Create the extension wrapper
    this.client = this.baseClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const tenantId = cls.get('tenantId');

            if (EXEMPTED_MODELS.includes(model)) {
              return query(args);
            }

            if (!tenantId) {
              throw new Error(
                `Missing tenantId in context for model ${model}. Tenant Isolation Error.`,
              );
            }

            const argsClone: any = args ? JSON.parse(JSON.stringify(args)) : {};

            if (
              [
                'findFirst',
                'findFirstOrThrow',
                'findMany',
                'count',
                'aggregate',
                'groupBy',
              ].includes(operation)
            ) {
              argsClone.where = { ...argsClone.where, tenantId };
            } else if (
              ['findUnique', 'findUniqueOrThrow'].includes(operation)
            ) {
              // Prisma findUnique strictly requires unique identifiers in where.
              // We map findUnique to findFirst behind the scenes to allow adding tenantId.
              argsClone.where = { ...argsClone.where, tenantId };

              const newOperation =
                operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
              return (self.baseClient as any)[model as string][newOperation](
                argsClone,
              );
            } else if (['create', 'createMany'].includes(operation)) {
              if (operation === 'create') {
                argsClone.data = { ...argsClone.data, tenantId };
              } else {
                // createMany
                if (Array.isArray(argsClone.data)) {
                  argsClone.data = argsClone.data.map((d: any) => ({
                    ...d,
                    tenantId,
                  }));
                } else {
                  argsClone.data = { ...argsClone.data, tenantId };
                }
              }
            } else if (['update', 'delete'].includes(operation)) {
              // Check ownership by fetching the record first without tenantId restriction
              // to see if it exists, and then verifying tenantId matches
              if (argsClone.where) {
                const record = await (self.baseClient as any)[
                  model as string
                ].findUnique({ where: argsClone.where });
                if (!record || record.tenantId !== tenantId) {
                  throw new Error(
                    `Record not found or does not belong to tenant for operation ${operation} on model ${model}`,
                  );
                }
              }
            } else if (operation === 'upsert') {
              // Convert upsert to manual findFirst -> update / create to strictly guarantee tenant verification.
              // Since findUnique requires unique compound, findFirst bypasses that and enforces tenant filter.
              const existingRecord = await (self.baseClient as any)[
                model as string
              ].findFirst({
                where: { ...argsClone.where, tenantId },
              });

              if (existingRecord) {
                // Convert to update
                const updateArgs = {
                  ...argsClone,
                  where: argsClone.where,
                  data: { ...argsClone.update, tenantId },
                };
                delete updateArgs.create;
                delete updateArgs.update;
                return (self.baseClient as any)[model as string].update(
                  updateArgs,
                );
              } else {
                // Convert to create
                const createArgs = {
                  ...argsClone,
                  data: { ...argsClone.create, tenantId },
                };
                delete createArgs.create;
                delete createArgs.update;
                delete createArgs.where;
                return (self.baseClient as any)[model as string].create(
                  createArgs,
                );
              }
            } else if (['updateMany', 'deleteMany'].includes(operation)) {
              argsClone.where = { ...argsClone.where, tenantId };
            }

            // Apply 10-second timeout
            const timeoutMs = 10000;
            let timeoutId: NodeJS.Timeout;

            const timeoutPromise = new Promise((_, reject) => {
              timeoutId = setTimeout(() => {
                self.logger.error(
                  `Database slow query timeout: ${model as string}.${operation} exceeded ${timeoutMs}ms`,
                );
                const { AppException } = require('../exceptions/app.exception');
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
              const result = await Promise.race([
                query(argsClone),
                timeoutPromise,
              ]);
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
    await this.baseClient.$connect();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
}
