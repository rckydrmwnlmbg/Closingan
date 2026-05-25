import { Test, TestingModule } from '@nestjs/testing';
import { FonnteService } from './fonnte.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { throwError, TimeoutError, of } from 'rxjs';
import { InternalServerErrorException } from '@nestjs/common';

describe('FonnteService - Provider Timeout Hardening', () => {
  let fonnteService: FonnteService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'FONNTE_BASE_URL') return 'http://fonnte.com';
        if (key === 'FONNTE_SYSTEM_TOKEN') return 'token';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FonnteService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    fonnteService = module.get<FonnteService>(FonnteService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should gracefully handle TimeoutError on generateQrCode and throw standard error', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(throwError(() => new TimeoutError()));

    await expect(fonnteService.generateQrCode('tenant-1')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('should return failure result gracefully on timeout during sendMessage', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(throwError(() => new TimeoutError()));

    const result = await fonnteService.sendMessage({
      tenantId: 'tenant-1',
      to: '123',
      message: 'test',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Fonnte API timeout');
  });

  it('should succeed sendMessage if no timeout', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(of({ data: { status: true, id: ['msg1'] } }) as any);

    const result = await fonnteService.sendMessage({
      tenantId: 'tenant-1',
      to: '123',
      message: 'test',
    });
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg1');
  });
});
