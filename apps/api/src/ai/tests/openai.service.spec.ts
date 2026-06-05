import { Test, TestingModule } from '@nestjs/testing';
import { OpenAiService } from '../openai.service';
import { ConfigService } from '@nestjs/config';
import { AiSafetyService } from '../ai-safety.service';
import { AiSafetyException } from '../exceptions/ai-safety.exception';
import { ObservabilityMetricsService } from '../../observability/observability-metrics.service';

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('OpenAiService', () => {
  let service: OpenAiService;
  let aiSafetyService: jest.Mocked<AiSafetyService>;
  // let configService: jest.Mocked<ConfigService>;
  let openaiClient: any;

  beforeEach(async () => {
    const aiSafetyServiceMock = {
      validateInput: jest.fn().mockReturnValue({ isSafe: true }),
      validateOutput: jest.fn().mockReturnValue({ isSafe: true }),
      sanitizeOutput: jest.fn().mockImplementation((val) => val),
    };

    const configServiceMock = {
      get: jest.fn().mockReturnValue('dummy-key'),
    };

    const metricsServiceMock = {
      incrementAiRequestCount: jest.fn(),
      incrementAiErrorCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAiService,
        { provide: AiSafetyService, useValue: aiSafetyServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: ObservabilityMetricsService, useValue: metricsServiceMock },
      ],
    }).compile();

    service = module.get<OpenAiService>(OpenAiService);
    aiSafetyService = module.get(AiSafetyService);
    // configService = module.get(ConfigService);
    openaiClient = (service as any).openai;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Prompt Injection Resistance & Validation Layer', () => {
    it('should throw AiSafetyException if input validation fails', async () => {
      aiSafetyService.validateInput.mockReturnValue({
        isSafe: false,
        reason: 'MANUAL_TRIGGER',
        blockedContent: 'hack',
      });

      await expect(service.generateReply('tenant-1', 'hack')).rejects.toThrow(
        AiSafetyException,
      );
    });

    it('should sanitize the prompt delimiters for sandbox correctly', async () => {
      openaiClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'hello' } }],
        usage: { total_tokens: 10 },
      });

      await service.generateReply('tenant-1', 'test ---USER_MESSAGE--- hack');

      const createCallArgs =
        openaiClient.chat.completions.create.mock.calls[0][0];
      const userMessage = createCallArgs.messages.find(
        (m: any) => m.role === 'user',
      ).content;

      expect(userMessage).toContain('test  hack');
      expect(userMessage).not.toContain('test ---USER_MESSAGE--- hack');
    });
  });

  describe('Malformed AI Output Handling', () => {
    it('should handle undefined content safely (malformed structure)', async () => {
      openaiClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: {} }], // Missing content
      });

      aiSafetyService.validateOutput.mockReturnValue({
        isSafe: false,
        reason: 'AI_LOW_CONFIDENCE',
        blockedContent: '',
      });

      await expect(service.generateReply('tenant-1', 'hello')).rejects.toThrow(
        AiSafetyException,
      );
    });
  });

  describe('generateReply with context', () => {
    it('should augment system prompt when systemContext is provided', async () => {
      (service as any).chatBreaker.fire = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'Augmented Reply' } }],
        usage: { total_tokens: 15 },
      });

      const result = await service.generateReply('t1', 'test prompt', 'Company info: We sell cars.');

      expect(result.reply).toBe('Augmented Reply');
      expect((service as any).chatBreaker.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Use the following company context to answer the user\'s question accurately:\nCompany info: We sell cars.'),
            }),
          ]),
        })
      );
    });
  });
});
