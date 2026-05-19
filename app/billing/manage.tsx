import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSubscriptionStore } from '@/stores/subscription-store';

function formatSubscriptionStatus(status?: string | null): string {
  switch (status) {
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
      return status ?? 'Unknown';
  }
}

export default function BillingManageScreen() {
  const refresh = useSubscriptionStore((state) => state.refresh);
  const current = useSubscriptionStore((state) => state.current);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const syncBillingState = async () => {
      try {
        setLoading(true);
        setError(null);
        await refresh();
      } catch {
        if (!cancelled) {
          setError(
            'We could not refresh your billing state right now. Please check again from the subscription screen.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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
              title="Your billing portal session is complete."
              body="We refreshed your subscription state from the backend so the app can reflect the latest Stripe changes."
            />

            {loading ? (
              <View className="gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  Refreshing your subscription details...
                </Text>
              </View>
            ) : error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : (
              <View className="gap-2">
                <Text className="font-sans text-sm text-mist">
                  Current plan: {current?.plan ?? 'Unknown'}
                </Text>
                <Text className="font-sans text-sm text-mist">
                  Status: {formatSubscriptionStatus(current?.status)}
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
