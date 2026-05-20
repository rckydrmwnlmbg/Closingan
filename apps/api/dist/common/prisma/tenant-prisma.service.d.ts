import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
export declare class TenantPrismaService implements OnModuleInit, OnModuleDestroy {
    private readonly cls;
    private baseClient;
    readonly client: any;
    private readonly logger;
    constructor(cls: ClsService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
