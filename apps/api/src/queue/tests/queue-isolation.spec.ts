import { Test, TestingModule } from '@nestjs/testing';
import { BlastWorker } from '../workers/blast.worker';
import { ClsService } from 'nestjs-cls';

describe('Queue Context Isolation Test', () => {
  let processor: BlastWorker;
  let clsService: ClsService;

  beforeEach(async () => {
    clsService = {
      run: jest.fn().mockImplementation(async (callback) => {
          return await callback();
      }),
      set: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlastWorker,
        { provide: ClsService, useValue: clsService },
      ],
    }).compile();

    processor = module.get<BlastWorker>(BlastWorker);

    jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => cb() as any);
  });

  it('should wrap job processing in cls.run() and securely set tenantId', async () => {
    // Arrange
    const job = {
        id: 'job-123',
        data: { tenantId: 'tenant-secure-1' }
    } as any;

    // Act
    await processor.process(job);

    // Assert
    expect(clsService.run).toHaveBeenCalled();
    expect(clsService.set).toHaveBeenCalledWith('tenantId', 'tenant-secure-1');
  });
});
