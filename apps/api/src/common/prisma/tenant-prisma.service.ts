import { Injectable, OnModuleInit, OnModuleDestroy, Scope, Inject } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';

// Define exempted models that don't need tenant isolation
export const EXEMPTED_MODELS = [
  'User',
  'Tenant',
  'Subscription',
  'Invoice',
  'QueueStats',
  'DeadLetterQueue', // or whatever global system tables exist
];

@Injectable({ scope: Scope.REQUEST })
export class TenantPrismaService implements OnModuleInit, OnModuleDestroy {
  public baseClient: PrismaClient;
  public tenantClient: any; // Dynamic type

  constructor(
    @Inject(REQUEST) private request: Request,
    private readonly cls: ClsService
  ) {
    this.baseClient = new PrismaClient();

    // Fallback: Check if CLS has tenantId, otherwise try to extract from request headers (for HTTP contexts)
    const tenantId = this.cls.get('tenantId') || (this.request?.headers as any)?.['x-tenant-id'];

    if (tenantId) {
       this.tenantClient = this.baseClient.$extends({
        query: {
           $allModels: {
             async $allOperations({ model, operation, args, query }) {
                // Skip tenant isolation for exempted global models
                if (EXEMPTED_MODELS.includes(model)) {
                   return query(args);
                }

                const argsWithTenant = { ...args } as any;

                // Operations that inject tenantId into where clause
                const readOps = ['findUnique', 'findFirst', 'findMany', 'count', 'update', 'delete'];
                if (readOps.includes(operation)) {
                    argsWithTenant.where = { ...argsWithTenant.where, tenantId };
                }

                // Operations that inject tenantId into data payload
                const writeOps = ['create', 'createMany'];
                if (writeOps.includes(operation)) {
                    if (Array.isArray(argsWithTenant.data)) {
                        argsWithTenant.data = argsWithTenant.data.map((d: any) => ({ ...d, tenantId }));
                    } else {
                        argsWithTenant.data = { ...argsWithTenant.data, tenantId };
                    }
                }

                return query(argsWithTenant);
             }
           }
        }
      });
    } else {
       // If no tenant context is provided, return the base client (Warning: unsafe if abused)
       this.tenantClient = this.baseClient;
    }
  }

  // Create a proxy to delegate calls to tenantClient seamlessly
  get client(): PrismaClient {
     return new Proxy(this.baseClient, {
        get: (target, prop) => {
           if (this.tenantClient[prop]) {
               return this.tenantClient[prop];
           }
           return target[prop as keyof typeof target];
        }
     });
  }

  async onModuleInit() {
    try {
      await this.baseClient.$connect();
    } catch (e) {
      if (process.env.NODE_ENV !== 'test') {
        throw e;
      }
    }
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
}
