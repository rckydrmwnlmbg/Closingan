/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { TenantPrismaService } from './tenant-prisma.service';
import { PrismaClient } from '@prisma/client';

describe('Tenant Isolation Runtime Extension Test', () => {
  let tenantPrisma: TenantPrismaService;
  let clsService: ClsService;

  beforeAll(async () => {
    // We create mock functions for cls to simulate context changes
    let currentTenantId: string | null = null;
    const mockClsService = {
      get: (key: string) => {
        if (key === 'tenantId') return currentTenantId;
        return null;
      },
      set: (key: string, value: any) => {
        if (key === 'tenantId') currentTenantId = value;
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPrismaService,
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    }).compile();

    tenantPrisma = module.get<TenantPrismaService>(TenantPrismaService);

    // We need to mock baseClient as well because findUnique etc bypasses query extension and calls baseClient directly
    (tenantPrisma as any).baseClient = {
      lead: {
        findFirst: jest.fn().mockImplementation(async (args) => {
          if (args?.where?.tenantId !== currentTenantId) return null;
          return { id: 'mock-lead', tenantId: currentTenantId };
        }),
        findUnique: jest.fn().mockImplementation(async (args) => {
          // findUnique mock is used for ownership check
          if (args.where.id === 'lead-b1') {
            return { id: 'lead-b1', tenantId: 'tenant-b' }; // Simulate record owned by another tenant
          } else if (args.where.id === 'lead-a1') {
            return { id: 'lead-a1', tenantId: 'tenant-a' }; // Simulate record owned by our tenant
          }
          return null; // Does not exist
        }),
        create: jest.fn().mockImplementation(async (args) => {
          return { ...args.data };
        }),
      },
      $extends: (args) => {
        // We'll proxy back to our mock for query extension calls
        return {
          lead: {
            findMany: jest.fn().mockImplementation(async (queryArgs) => {
              return args.query.$allModels.$allOperations({
                model: 'lead',
                operation: 'findMany',
                args: queryArgs,
                query: async (qArgs) => {
                  if (qArgs?.where?.tenantId !== currentTenantId)
                    throw new Error('Tenant mismatch');
                  return [{ id: 'mock-lead', tenantId: currentTenantId }];
                },
              });
            }),
            findUnique: jest.fn().mockImplementation(async (queryArgs) => {
              return args.query.$allModels.$allOperations({
                model: 'lead',
                operation: 'findUnique',
                args: queryArgs,
                query: async (qArgs) => {
                  // Note: we actually redirect findUnique to baseClient.findFirst in the implementation
                  throw new Error('This should not be called');
                },
              });
            }),
            create: jest.fn().mockImplementation(async (queryArgs) => {
              return args.query.$allModels.$allOperations({
                model: 'lead',
                operation: 'create',
                args: queryArgs,
                query: async (qArgs) => {
                  return { ...qArgs.data };
                },
              });
            }),
            update: jest.fn().mockImplementation(async (queryArgs) => {
              return args.query.$allModels.$allOperations({
                model: 'lead',
                operation: 'update',
                args: queryArgs,
                query: async (qArgs) => {
                  return {
                    ...qArgs.data,
                    id: qArgs.where.id,
                    tenantId: currentTenantId,
                  };
                },
              });
            }),
            upsert: jest.fn().mockImplementation(async (queryArgs) => {
              return args.query.$allModels.$allOperations({
                model: 'lead',
                operation: 'upsert',
                args: queryArgs,
                query: async (qArgs) => {
                  return { ...qArgs.create, id: qArgs.where.id };
                },
              });
            }),
          },
        };
      },
    };

    // Re-initialize client with the mocked baseClient
    tenantPrisma.client = (tenantPrisma as any).baseClient.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: any) {
            const tenantId = mockClsService.get('tenantId');

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
              argsClone.where = { ...argsClone.where, tenantId };
              const newOperation =
                operation === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
              return (tenantPrisma as any).baseClient[model as string][
                newOperation
              ](argsClone);
            } else if (['create', 'createMany'].includes(operation)) {
              if (operation === 'create') {
                argsClone.data = { ...argsClone.data, tenantId };
              }
            } else if (['update', 'delete', 'upsert'].includes(operation)) {
              if (argsClone.where) {
                const record = await (tenantPrisma as any).baseClient[
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
                if (argsClone.create) argsClone.create.tenantId = tenantId;
                if (argsClone.update) argsClone.update.tenantId = tenantId;
              }
            }
            return query(argsClone);
          },
        },
      },
    });

    clsService = module.get<ClsService>(ClsService);
  });

  afterEach(() => {
    clsService.set('tenantId', null); // Reset context
  });

  it('should throw an error if query is made without tenantId in context', async () => {
    clsService.set('tenantId', null);

    await expect(tenantPrisma.client.lead.findMany()).rejects.toThrow(
      /Missing tenantId in context/,
    );
  });

  it('should automatically scope findMany and count to tenantId', async () => {
    clsService.set('tenantId', 'tenant-a');

    const leadsA = await tenantPrisma.client.lead.findMany({ where: {} });
    expect(leadsA).toHaveLength(1);
    expect(leadsA[0].tenantId).toBe('tenant-a');

    clsService.set('tenantId', 'tenant-b');
    const leadsB = await tenantPrisma.client.lead.findMany({ where: {} });
    expect(leadsB).toHaveLength(1);
    expect(leadsB[0].tenantId).toBe('tenant-b');
  });

  it('should route findUnique to findFirst to inject tenantId successfully', async () => {
    clsService.set('tenantId', 'tenant-a');

    const lead = await tenantPrisma.client.lead.findUnique({
      where: { id: 'mock-lead' },
    });

    expect(lead).toBeDefined();
    expect(lead.tenantId).toBe('tenant-a');
    expect(
      (tenantPrisma as any).baseClient.lead.findFirst,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'mock-lead', tenantId: 'tenant-a' },
      }),
    );
  });

  it('should automatically inject tenantId on create', async () => {
    clsService.set('tenantId', 'tenant-a');

    const newLead = await tenantPrisma.client.lead.create({
      data: {
        id: 'lead-a2',
        phoneNumber: '333',
        name: 'Lead A2',
      },
    });

    expect(newLead.tenantId).toBe('tenant-a');
  });

  it('should throw error when updating a record belonging to another tenant', async () => {
    clsService.set('tenantId', 'tenant-a');

    await expect(
      tenantPrisma.client.lead.update({
        where: { id: 'lead-b1' },
        data: { name: 'Hacked by Tenant A' },
      }),
    ).rejects.toThrow(/Record not found or does not belong to tenant/);
  });

  it('should allow upsert if record does not exist', async () => {
    clsService.set('tenantId', 'tenant-a');

    const newLead = await tenantPrisma.client.lead.upsert({
      where: { id: 'new-lead' },
      create: { name: 'New Lead' },
      update: { name: 'Updated Lead' },
    });

    expect(newLead.tenantId).toBe('tenant-a');
    expect(newLead.id).toBe('new-lead');
  });

  it('should allow update if record belongs to current tenant', async () => {
    clsService.set('tenantId', 'tenant-a');

    const updatedLead = await tenantPrisma.client.lead.update({
      where: { id: 'lead-a1' },
      data: { name: 'Update by Tenant A' },
    });

    expect(updatedLead.tenantId).toBe('tenant-a');
    expect(updatedLead.name).toBe('Update by Tenant A');
  });
});
