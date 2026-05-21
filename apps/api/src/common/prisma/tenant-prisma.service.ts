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
            } else if (['update', 'delete', 'upsert'].includes(operation)) {
              // For update and delete, we need to ensure the record belongs to the tenant
              // before performing the operation.

              // Check ownership by fetching the record first without tenantId restriction
              // to see if it exists, and then verifying tenantId matches
              if (argsClone.where) {
                const record = await (self.baseClient as any)[
                  model as string
                ].findUnique({ where: argsClone.where });
                if (record) {
                  if (record.tenantId !== tenantId) {
                    throw new Error(
                      `Record not found or does not belong to tenant for operation ${operation} on model ${model}`,
                    );
                  }
                } else {
                  if (operation !== 'upsert') {
                    throw new Error(
                      `Record not found or does not belong to tenant for operation ${operation} on model ${model}`,
                    );
                  }
                }
              }

              if (operation === 'upsert') {
                if (argsClone.create) {
                  argsClone.create.tenantId = tenantId;
                }
                if (argsClone.update) {
                  argsClone.update.tenantId = tenantId;
                }
              }
            } else if (['updateMany', 'deleteMany'].includes(operation)) {
              argsClone.where = { ...argsClone.where, tenantId };
            }

            return query(argsClone);
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
