import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useSubscriptionStore } from '@/stores/subscription-store';

function formatSuccessMessage(input: {
  plan?: string | null;
  status?: string | null;
}): string {
  if (input.plan === 'PREMIUM' && input.status === 'ACTIVE') {
    return 'Your Premium subscription is active and your updated entitlement is ready to use.';
  }

  if (input.status === 'PAST_DUE') {
    return 'Stripe returned from checkout, but your payment still needs attention before Premium can continue normally.';
  }

  if (input.status === 'INCOMPLETE') {
    return 'Your billing session returned, but Stripe still shows the subscription as incomplete. Open the subscription screen to continue.';
  }

  return 'Your billing session returned successfully. Open the subscription screen to review the latest backend-confirmed status.';
}

export default function BillingSuccessScreen() {
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
          await refresh();
          if (cancelled) {
            return;
          }

          const current = useSubscriptionStore.getState().current;
          if (current) {
            setMessage(
              formatSuccessMessage({
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
          'We are still confirming your subscription with the backend. Please refresh from the subscription screen in a moment.',
        );
      }
    };

    void confirmSubscription();

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
              eyebrow="Billing Success"
              title="Confirming your subscription."
              body="The app only unlocks paid access after the backend confirms Stripe state. This protects your entitlement from browser-only assumptions."
            />

            {confirming ? (
              <View className="gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  Checking your updated subscription now...
                </Text>
              </View>
            ) : error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : (
              <Text className="font-sans text-sm text-mist">
                {message ??
                  'Your subscription has been confirmed. You can continue using the app with the updated entitlement.'}
              </Text>
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
