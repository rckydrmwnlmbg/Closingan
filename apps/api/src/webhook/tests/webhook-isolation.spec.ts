import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from '../webhook.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { ClsService } from 'nestjs-cls';
import { getQueueToken } from '@nestjs/bullmq';
import { WHATSAPP_PROVIDER } from '../../whatsapp/interfaces/whatsapp-provider.interface';
import { UnauthorizedException } from '@nestjs/common';

describe('Webhook Routing Isolation Test', () => {
  let service: WebhookService;
  let whatsappProvider: any;
  let prismaService: any;
  let clsService: any;

  beforeEach(async () => {
    whatsappProvider = {
      validateWebhookSignature: jest.fn(),
    };

    prismaService = {
      whatsappSession: {
        findFirst: jest.fn(),
      },
    };

    clsService = {
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: WHATSAPP_PROVIDER, useValue: whatsappProvider },
        { provide: PrismaService, useValue: prismaService },
        { provide: ClsService, useValue: clsService },
        { provide: AuditService, useValue: { log: jest.fn() } },
        { provide: getQueueToken('ai-reply'), useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  it('should throw UnauthorizedException if signature is invalid', async () => {
    whatsappProvider.validateWebhookSignature.mockReturnValue(false);

    await expect(
      service.handleFonnteIncomingMessage(
        { device: '123', sender: 'abc', message: 'hello' },
        'invalid_sig'
      )
    ).rejects.toThrow(UnauthorizedException);
    expect(whatsappProvider.validateWebhookSignature).toHaveBeenCalledWith(
        expect.any(Object),
        'invalid_sig'
    );
  });

  it('should throw UnauthorizedException if payload device is not found in DB', async () => {
    whatsappProvider.validateWebhookSignature.mockReturnValue(true);
    prismaService.whatsappSession.findFirst.mockResolvedValue(null);

    await expect(
      service.handleFonnteIncomingMessage(
        { device: 'unknown_device', sender: 'abc', message: 'hello' },
        'valid_sig'
      )
    ).rejects.toThrow(UnauthorizedException);
    expect(prismaService.whatsappSession.findFirst).toHaveBeenCalledWith({
        where: { phoneNumber: 'unknown_device' }
    });
  });

  it('should successfully set tenantId in CLS context when device matches', async () => {
    whatsappProvider.validateWebhookSignature.mockReturnValue(true);
    prismaService.whatsappSession.findFirst.mockResolvedValue({
      tenantId: 'tenant-123',
      phoneNumber: 'known_device',
    });

    await service.handleFonnteIncomingMessage(
      { device: 'known_device', sender: 'abc', message: 'hello' },
      'valid_sig'
    );

    expect(clsService.set).toHaveBeenCalledWith('tenantId', 'tenant-123');
  });
});
