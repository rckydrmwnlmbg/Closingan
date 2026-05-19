import { Queue } from 'bullmq';
export declare class HealthController {
    private readonly healthQueue;
    constructor(healthQueue: Queue);
    check(): Promise<{
        success: boolean;
        data: {
            status: string;
            queue: string;
        };
    }>;
}
