import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { syncSubscription } from '@/lib/api/subscriptions-api';
import { useSubscriptionStore } from '@/stores/subscription-store';

function formatSubscriptionStatus(input: {
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
}): string {
  if (input.cancelAtPeriodEnd) {
    return 'Cancels at period end';
  }

  switch (input.status) {
    case 'ACTIVE':
      return 'Active';
    case 'TRIAL':
      return 'Trial';
    case 'CANCELLED':
      return 'Cancels at period end';
    case 'PAST_DUE':
      return 'Payment past due';
    case 'INCOMPLETE':
      return 'Payment incomplete';
    case 'EXPIRED':
      return 'Expired';
    default:
      return input.status ?? 'Unknown';
  }
}

export default function BillingManageScreen() {
  const refresh = useSubscriptionStore((state) => state.refresh);
  const current = useSubscriptionStore((state) => state.current);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncBillingState = async () => {
      setLoading(true);
      setError(null);

      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          await syncSubscription();
          await refresh();
          if (cancelled) {
            return;
          }

          const latest = useSubscriptionStore.getState().current;
          if (latest) {
            const accessEndsAt = latest.currentPeriodEnd ?? latest.renewsAt;
            const accessEndsAtLabel = accessEndsAt
              ? new Date(accessEndsAt).toLocaleDateString()
              : null;
            setMessage(
              latest.cancelAtPeriodEnd
                ? accessEndsAtLabel
                  ? `Your subscription will end on ${accessEndsAtLabel}. You will continue to have access until then. No further renewal will be charged.`
                  : 'Your subscription is scheduled to end at the close of the current billing period. You will continue to have access until then. No further renewal will be charged.'
                : 'Your billing details have been updated.',
            );
          }

          setLoading(false);
          return;
        } catch {
          // Retry briefly because the Stripe webhook may still be settling.
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setLoading(false);
        setError(
          'We could not refresh your billing details right now. Please check your subscription page again shortly.',
        );
      }
    };

    void syncBillingState();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-16 pt-10">
        <GlassCard>
          <View className="gap-5">
            <SectionHeading
              eyebrow="Billing Updated"
              title="Your billing update is complete"
              body="Your latest billing changes have been applied to your account."
            />

            {loading ? (
              <View className="gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  Refreshing your billing details...
                </Text>
              </View>
            ) : error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : (
              <View className="gap-2">
                <Text className="font-sans text-sm text-mist">
                  {message ?? 'Your billing details have been refreshed.'}
                </Text>
                <Text className="font-sans text-sm text-mist">
                  Current plan: {current?.plan ?? 'Unknown'}
                </Text>
                <Text className="font-sans text-sm text-mist">
                  Status: {formatSubscriptionStatus({
                    status: current?.status,
                    cancelAtPeriodEnd: current?.cancelAtPeriodEnd,
                  })}
                </Text>
              </View>
            )}

            <Button
              label="Open Subscription"
              onPress={() =>
                router.replace({
                  pathname: '/subscription' as never,
                })
              }
            />
            <Button
              label="Return Home"
              variant="secondary"
              onPress={() => router.replace('/(app)/(tabs)/home')}
            />
          </View>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}
