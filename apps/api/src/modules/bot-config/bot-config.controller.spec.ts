import { Test, TestingModule } from '@nestjs/testing';
import { BotConfigController } from './bot-config.controller';
import { BotConfigService } from './bot-config.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('BotConfigController', () => {
  let controller: BotConfigController;
  let service: BotConfigService;

  const mockService = {
    getBotConfig: jest.fn(),
    upsertBotConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BotConfigController],
      providers: [{ provide: BotConfigService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BotConfigController>(BotConfigController);
    service = module.get<BotConfigService>(BotConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBotConfig', () => {
    it('should return bot config', async () => {
      mockService.getBotConfig.mockResolvedValue({ id: '1' });
      const result = await controller.getBotConfig('t1');
      expect(result.data).toEqual({ id: '1' });
    });
  });

  describe('createOrUpdateBotConfig', () => {
    it('should create or update config', async () => {
      mockService.upsertBotConfig.mockResolvedValue({ id: '1' });
      const dto = { systemPrompt: 'test', greetingMessage: 'test' };
      const result = await controller.createOrUpdateBotConfig('t1', dto);
      expect(result.data).toEqual({ id: '1' });
    });
  });

  describe('updateBotConfig', () => {
    it('should patch config', async () => {
      mockService.upsertBotConfig.mockResolvedValue({ id: '1' });
      const dto = { systemPrompt: 'test', greetingMessage: 'test' };
      const result = await controller.updateBotConfig('t1', dto);
      expect(result.data).toEqual({ id: '1' });
    });
  });
});
