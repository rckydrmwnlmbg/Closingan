import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionState } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { REQUIRE_SUBSCRIPTION_KEY } from '../../decorators/require-subscription.decorator';
import { CacheService } from '../../cache/cache.service';

@Injectable()
export class PlanEntitlementGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    private cls: ClsService,
    private cacheService: CacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSubscriptionRequired = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isSubscriptionRequired) {
      return true;
    }

    const tenantId = this.cls.get<string>('tenantId');

    if (!tenantId) {
      // If there's no tenantId in CLS context, try to get it from request user
      const request = context.switchToHttp().getRequest<{ user?: any }>();
      const userTenantId = (request.user as { tenantId?: string })?.tenantId;
      if (!userTenantId) {
        throw new ForbiddenException('Subscription context missing.');
      }
      return this.checkSubscription(userTenantId);
    }

    return this.checkSubscription(tenantId);
  }

  private async checkSubscription(tenantId: string): Promise<boolean> {
    const cacheKey = `tenant:${tenantId}:entitlement`;
    let isEntitled = await this.cacheService.get<boolean>(cacheKey, 'tenant_entitlement');

    if (isEntitled !== null) {
      if (!isEntitled) {
        throw new ForbiddenException('Subscription expired. Please upgrade or renew your plan.');
      }
      return true;
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { tenantId },
      select: { state: true },
    });

    if (!subscription) {
      await this.cacheService.set(cacheKey, false, 300); // 5 mins
      throw new ForbiddenException('Subscription expired. Please upgrade or renew your plan.');
    }

    const allowedStates: SubscriptionState[] = [
      SubscriptionState.ACTIVE,
      SubscriptionState.TRIAL,
      SubscriptionState.PAST_DUE, // Allowed as a grace period
    ];

    const valid = allowedStates.includes(subscription.state);
    await this.cacheService.set(cacheKey, valid, 300); // 5 mins

    if (!valid) {
      throw new ForbiddenException('Subscription expired. Please upgrade or renew your plan.');
    }

    return true;
  }
}
