import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AppException } from '../exceptions/app.exception';
import { ClsServiceManager } from 'nestjs-cls';

const EXEMPTED_MODELS = [
  'Tenant',
  'RefreshToken',
  'OtpCode',
  'UserBadge',
  'FailedJob',
  'DeadLetterLog',
  'AuditLog',
  'AbusiveClient',
];

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private extendedClient: any;
  private readonly logger = new Logger(PrismaService.name);
  
  public replicaClient: PrismaClient;
  private currentReplicaLag: number = 0;
  private lagCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();

    // Initialize Replica Client (fallback to primary if not set)
    this.replicaClient = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL_REPLICA || process.env.DATABASE_URL,
    });

    const self = this;

    // The $extends setup applies multi-tenant filtering, timeout, and read replica routing
    this.extendedClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const cls = ClsServiceManager.getClsService();
            const tenantId = cls.isActive() ? cls.get('tenantId') : undefined;
            const argsClone: any = args ? JSON.parse(JSON.stringify(args)) : {};

            if (tenantId && !EXEMPTED_MODELS.includes(model)) {
              if (
                [
                  'findUnique',
                  'findFirst',
                  'findFirstOrThrow',
                  'findMany',
                  'count',
                  'aggregate',
                  'groupBy',
                ].includes(operation)
              ) {
                argsClone.where = { ...argsClone.where, tenantId };
              } else if (['updateMany', 'deleteMany'].includes(operation)) {
                argsClone.where = { ...argsClone.where, tenantId };
              }
            }

            // Route to Replica or Primary
            const readOperations = [
              'findUnique',
              'findUniqueOrThrow',
              'findFirst',
              'findFirstOrThrow',
              'findMany',
              'count',
              'aggregate',
              'groupBy',
            ];

            const isReadOperation = readOperations.includes(operation);
            
            // Note: Since this is an arrow function, we can access the outer 'this'
            // To avoid infinite recursion with `$extends`, we must use `this.replicaClient` but as an un-extended client, 
            // wait, if we call `this.replicaClient[model][operation]`, it won't apply extensions.
            // But we need the extensions applied? We only have one `$extends` which we are inside right now.
            // So we can just use `this.replicaClient[model][operation]` directly if it's read.
            // Actually, we must use `this.replicaClient` cast to any to call it dynamically.
            
            // Apply 10-second timeout
            const timeoutMs = 10000;
            let timeoutId: NodeJS.Timeout;
            const timeoutPromise = new Promise((_, reject) => {
              timeoutId = setTimeout(() => {
                reject(new AppException('DB_TIMEOUT', `Database query timed out for ${model as string}.${operation}`, 504));
              }, timeoutMs);
            });

            const executeQuery = async () => {
              // Read operation & lag <= 2s -> use replica
              if (isReadOperation && self.currentReplicaLag <= 2) {
                // Warning: To call replica, we do not use `query(args)` because `query` points to the extended client itself (primary).
                // We use the raw replica client.
                try {
                  const modelClient = (self.replicaClient as any)[model];
                  if (modelClient && typeof modelClient[operation] === 'function') {
                    // Log query for analytics verification
                    self.logger.debug(`[REPLICA ROUTING] Routing ${model as string}.${operation} to Read Replica. Lag: ${self.currentReplicaLag}s`);
                    return await modelClient[operation](argsClone);
                  }
                } catch (err) {
                  self.logger.warn(`Replica query failed, falling back to primary: ${err}`);
                  // fallback to primary below
                }
              }

              // Default: use primary
              return await query(argsClone);
            };

            try {
              return await Promise.race([executeQuery(), timeoutPromise]);
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
    try {
      await this.replicaClient.$connect();
    } catch (err) {
      this.logger.error(`Failed to connect to replica: ${err}`);
    }
    
    // Start polling replica lag
    this.lagCheckInterval = setInterval(async () => {
      try {
        // In PostgreSQL, you can check lag from the replica using:
        const res = await this.replicaClient.$queryRaw<{lag: number}[]>`SELECT extract(epoch from now() - pg_last_xact_replay_timestamp()) as lag`;
        if (res && res[0] && res[0].lag !== null) {
          this.currentReplicaLag = Number(res[0].lag);
        } else {
          this.currentReplicaLag = 0; // If it's primary itself or no lag
        }
      } catch (err) {
        this.currentReplicaLag = 999; // Set high lag on error to force fallback
      }
    }, 5000);

    Object.assign(this, this.extendedClient);
  }

  getReplicaLag(): number {
    return this.currentReplicaLag;
  }

  async onModuleDestroy() {
    if (this.lagCheckInterval) clearInterval(this.lagCheckInterval);
    await this.replicaClient.$disconnect();
    await this.$disconnect();
  }
}
