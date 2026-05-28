import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { syncSubscription } from '@/lib/api/subscriptions-api';
import { useI18n } from '@/lib/i18n';
import { AppLanguage, TranslationKey } from '@/lib/i18n/types';
import { useSubscriptionStore } from '@/stores/subscription-store';

function formatSubscriptionStatus(input: {
  t: (key: TranslationKey) => string;
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
}): string {
  if (input.cancelAtPeriodEnd) {
    return input.t('subscription.status.cancelAtPeriodEnd');
  }

  switch (input.status) {
    case 'ACTIVE':
      return input.t('subscription.status.active');
    case 'TRIAL':
      return input.t('subscription.status.trial');
    case 'CANCELLED':
      return input.t('subscription.status.cancelled');
    case 'PAST_DUE':
      return input.t('subscription.status.pastDue');
    case 'INCOMPLETE':
      return input.t('subscription.status.incomplete');
    case 'EXPIRED':
      return input.t('subscription.status.expired');
    default:
      return input.status ?? input.t('subscription.status.unknown');
  }
}

export default function BillingManageScreen() {
  const { language, t } = useI18n();
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
              ? new Date(accessEndsAt).toLocaleDateString(language)
              : null;
            setMessage(
              latest.cancelAtPeriodEnd
                ? accessEndsAtLabel
                  ? t('subscription.message.cancelWithDate', { date: accessEndsAtLabel })
                  : t('subscription.message.cancelNoDate')
                : t('billing.manage.updated'),
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
          t('billing.manage.pending'),
        );
      }
    };

    void syncBillingState();

    return () => {
      cancelled = true;
    };
  }, [language, refresh, t]);

  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-16 pt-10">
        <GlassCard>
          <View className="gap-5">
            <SectionHeading
              eyebrow={t('billing.manage.eyebrow')}
              title={t('billing.manage.title')}
              body={t('billing.manage.body')}
            />

            {loading ? (
              <View className="gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  {t('billing.manage.loading')}
                </Text>
              </View>
            ) : error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : (
              <View className="gap-2">
                <Text className="font-sans text-sm text-mist">
                  {message ?? t('billing.manage.default')}
                </Text>
                <Text className="font-sans text-sm text-mist">
                  {t('billing.currentPlan', {
                    plan: current?.plan ?? t('subscription.status.unknown'),
                  })}
                </Text>
                <Text className="font-sans text-sm text-mist">
                  {t('billing.currentStatus', {
                    status: formatSubscriptionStatus({
                      t,
                      status: current?.status,
                      cancelAtPeriodEnd: current?.cancelAtPeriodEnd,
                    }),
                  })}
                </Text>
              </View>
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
