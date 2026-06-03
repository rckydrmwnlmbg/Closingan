import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SUBSCRIPTION_KEY = 'require_subscription';
export const RequireSubscription = () =>
  SetMetadata(REQUIRE_SUBSCRIPTION_KEY, true);
