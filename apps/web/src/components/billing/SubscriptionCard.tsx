import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBillingSubscription } from './hooks/useBilling';

export function SubscriptionCard() {
  const { subscription, isLoading } = useBillingSubscription();

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 animate-pulse">
        <CardHeader className="h-24"></CardHeader>
        <CardContent className="h-16"></CardContent>
      </Card>
    );
  }

  const isPastDue = subscription?.status === 'PAST_DUE';
  const isActive = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIAL';

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="text-emerald-500" size={24} />
              Subscription Plan
            </CardTitle>
            <CardDescription className="text-white/50 mt-1">
              Manage your billing and plan details
            </CardDescription>
          </div>
          {subscription && (
            <Badge variant={isActive ? 'default' : 'destructive'} className="uppercase">
              {subscription.planId} ({subscription.status})
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isPastDue && (
          <Alert variant="destructive" className="mb-4 bg-red-500/10 border-red-500/20 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Past Due</AlertTitle>
            <AlertDescription>
              We were unable to process your last payment. Please update your payment method to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {!subscription ? (
          <div className="text-white/50 py-4">No active subscription found.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/50 block mb-1">Current Period Ends</span>
                <span className="font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-white/50 block mb-1">Auto-Renew</span>
                <span className="font-medium flex items-center gap-1">
                  {!subscription.cancelAtPeriodEnd ? (
                    <><CheckCircle2 className="text-emerald-500" size={16} /> Enabled</>
                  ) : (
                    'Disabled'
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-white/10 pt-6 flex gap-3">
        {isPastDue ? (
          <Button variant="destructive" className="w-full sm:w-auto">Pay Now</Button>
        ) : (
          <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white">
            Upgrade Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
