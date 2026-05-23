import { Test, TestingModule } from '@nestjs/testing';
import { AiAnalysisProcessor } from './ai-analysis.processor';
import { HotLeadService } from '../hot-lead.service';
import { ClsService } from 'nestjs-cls';
import { AppException } from '../../../common/exceptions/app.exception';

describe('AiAnalysisProcessor', () => {
  let processor: AiAnalysisProcessor;
  let hotLeadService: jest.Mocked<HotLeadService>;
  let cls: jest.Mocked<ClsService>;

  beforeEach(async () => {
    hotLeadService = {
      analyzeLead: jest.fn(),
    } as any;

    cls = {
      run: jest.fn((cb) => cb()),
      set: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAnalysisProcessor,
        { provide: HotLeadService, useValue: hotLeadService },
        { provide: ClsService, useValue: cls },
      ],
    }).compile();

    processor = module.get<AiAnalysisProcessor>(AiAnalysisProcessor);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('Timeout Handling', () => {
    it('should throw an AppException with code AI_TIMEOUT if analyzeLead takes longer than 25s', async () => {
      jest.useFakeTimers();

      const job = {
        id: '1',
        data: {
          tenantId: 'tenant-1',
          conversationId: 'conv-1',
          messageContent: 'hello world',
        },
      } as any;

      // Mock analyzeLead to be a slow promise that never resolves within our fake time
      hotLeadService.analyzeLead.mockImplementation(() => {
        return new Promise((resolve) => setTimeout(resolve, 30000)); // 30s
      });

      const processPromise = processor.process(job);

      // Advance timers by 26 seconds to trigger the 25s timeout inside process
      jest.advanceTimersByTime(26000);

      await expect(processPromise).rejects.toThrow(AppException);
      await expect(processPromise).rejects.toMatchObject({
        response: {
          success: false,
          error: {
            code: 'AI_TIMEOUT',
            message: 'AI analysis timed out',
            details: {}
          }
        },
        status: 504,
      });

      expect(cls.set).toHaveBeenCalledWith('tenantId', 'tenant-1');
      expect(hotLeadService.analyzeLead).toHaveBeenCalledWith('conv-1', 'hello world');
    });

    it('should complete successfully if analyzeLead finishes quickly', async () => {
      jest.useFakeTimers();

      const job = {
        id: '1',
        data: {
          tenantId: 'tenant-1',
          conversationId: 'conv-1',
          messageContent: 'hello world',
        },
      } as any;

      hotLeadService.analyzeLead.mockResolvedValue();

      const processPromise = processor.process(job);
      jest.runAllTimers();

      await expect(processPromise).resolves.toBeUndefined();
    });
  });
});
