import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { syncSubscription } from '@/lib/api/subscriptions-api';
import { useI18n } from '@/lib/i18n';
import { useSubscriptionStore } from '@/stores/subscription-store';

function formatSuccessMessage(input: {
  t: ReturnType<typeof useI18n>['t'];
  plan?: string | null;
  status?: string | null;
}): string {
  if (input.plan === 'PREMIUM' && input.status === 'ACTIVE') {
    return input.t('billing.success.active');
  }

  if (input.status === 'PAST_DUE') {
    return input.t('billing.success.pastDue');
  }

  if (input.status === 'INCOMPLETE') {
    return input.t('billing.success.incomplete');
  }

  return input.t('billing.success.updated');
}

export default function BillingSuccessScreen() {
  const { t } = useI18n();
  const refresh = useSubscriptionStore((state) => state.refresh);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const confirmSubscription = async () => {
      setConfirming(true);
      setError(null);

      for (let attempt = 0; attempt < 4; attempt += 1) {
        try {
          await syncSubscription();
          await refresh();
          if (cancelled) {
            return;
          }

          const current = useSubscriptionStore.getState().current;
          if (current) {
            setMessage(
              formatSuccessMessage({
                t,
                plan: current.plan,
                status: current.status,
              }),
            );
          }

          if (
            current?.plan === 'PREMIUM' ||
            current?.status === 'PAST_DUE' ||
            current?.status === 'INCOMPLETE'
          ) {
            setConfirming(false);
            return;
          }
        } catch {
          // Keep retrying briefly because the webhook may still be settling.
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setConfirming(false);
        setError(
          t('billing.success.pending'),
        );
      }
    };

    void confirmSubscription();

    return () => {
      cancelled = true;
    };
  }, [refresh, t]);

  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-16 pt-10">
        <GlassCard>
          <View className="gap-5">
            <SectionHeading
              eyebrow={t('billing.success.eyebrow')}
              title={t('billing.success.title')}
              body={t('billing.success.body')}
            />

            {confirming ? (
              <View className="gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  {t('billing.success.loading')}
                </Text>
              </View>
            ) : error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : (
              <Text className="font-sans text-sm text-mist">
                {message ?? t('billing.success.default')}
              </Text>
            )}

            <Button
              label={t('billing.openSubscription')}
              onPress={() =>
                router.replace({
                  pathname: '/subscription' as never,
                })
              }
            />
            <Button
              label={t('billing.returnHome')}
              variant="secondary"
              onPress={() => router.replace('/(app)/(tabs)/home')}
            />
          </View>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}
