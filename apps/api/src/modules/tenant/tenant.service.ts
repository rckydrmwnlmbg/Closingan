import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    this.logger.log({
      message: `Creating new tenant: ${createTenantDto.name}`,
    });

    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
      },
    });
  }

  async getOnboardingState(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        isOnboarded: true,
        onboardingState: true,
      },
    });
    return tenant;
  }

  async updateOnboardingState(tenantId: string, isOnboarded: boolean, onboardingState: any) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        isOnboarded,
        onboardingState,
      },
      select: {
        isOnboarded: true,
        onboardingState: true,
      },
    });
  }

  async checkExitSurveyEligibility(tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId }
    });

    if (!subscription || subscription.state !== 'ACTIVE') {
      return { eligible: false };
    }

    const now = new Date();
    const expiresAt = subscription.currentPeriodEnd;
    
    // Check if expiring within 24 hours
    if (!expiresAt || expiresAt.getTime() - now.getTime() > 24 * 60 * 60 * 1000) {
      return { eligible: false };
    }

    const existingSurvey = await this.prisma.exitSurvey.findFirst({
      where: { tenantId }
    });

    if (existingSurvey) {
      return { eligible: false };
    }

    return { eligible: true };
  }

  async submitExitSurvey(tenantId: string, userId: string, data: { reason: string, reasonDetail?: string, npsScore?: number }) {
    const isPriceReason = data.reason === 'PRICE';
    
    const survey = await this.prisma.exitSurvey.create({
      data: {
        tenantId,
        userId,
        reason: data.reason,
        reasonDetail: data.reasonDetail,
        npsScore: data.npsScore,
        saveOfferShown: isPriceReason,
        saveOfferAccepted: false,
      }
    });

    return {
      survey,
      saveOfferAvailable: isPriceReason
    };
  }

  async acceptSaveOffer(tenantId: string) {
    const survey = await this.prisma.exitSurvey.findFirst({
      where: { tenantId, saveOfferShown: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!survey) {
      throw new Error('Save offer not available');
    }

    await this.prisma.exitSurvey.update({
      where: { id: survey.id },
      data: { saveOfferAccepted: true }
    });

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId }
    });

    if (subscription && subscription.currentPeriodEnd) {
      // Extend subscription by 1 month (30 days)
      const newEndDate = new Date(subscription.currentPeriodEnd);
      newEndDate.setDate(newEndDate.getDate() + 30);
      
      await this.prisma.subscription.update({
        where: { tenantId },
        data: { currentPeriodEnd: newEndDate, state: 'ACTIVE' }
      });
    }

    return { success: true };
  }

  async getReferrals(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { referralCode: true }
    });

    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: tenantId },
      include: {
        receiver: {
          select: { name: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const stats = {
      total: referrals.length,
      converted: referrals.filter(r => r.status === 'CONVERTED_TO_PAID').length,
      pending: referrals.filter(r => r.status === 'SIGNED_UP' || r.status === 'TRIAL_ACTIVE').length,
    };

    return {
      referralCode: tenant?.referralCode,
      stats,
      referrals
    };
  }
}
