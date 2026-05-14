import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscriptionStore } from '@/stores/subscription-store';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const current = useSubscriptionStore((state) => state.current);
  const usage = useSubscriptionStore((state) => state.usage);
  const error = useSubscriptionStore((state) => state.error);
  const refresh = useSubscriptionStore((state) => state.refresh);

  useEffect(() => {
    refresh().catch(() => {
      // The store exposes a user-facing error state for the screen to render.
    });
  }, [refresh]);

  return (
    <GradientScreen>
      <View className="flex-1 gap-6 px-6 pt-6 pb-24">
        <SectionHeading
          eyebrow="Home"
          title={`Welcome${user?.email ? ',' : ''} ${user?.email?.split('@')[0] ?? 'back'}.`}
          body="A premium skincare dashboard designed to keep your next analysis, limits, and progress in view."
        />

        <GlassCard>
          <View className="gap-3">
            <Text className="font-medium text-sm uppercase tracking-[2px] text-roseDeep">
              Subscription
            </Text>
            {current && usage ? (
              <>
                <Text className="font-bold text-2xl text-charcoal">
                  {current.plan}
                </Text>
                <Text className="font-sans text-base text-mist">
                  {usage.remainingAnalyses} analyses remaining
                </Text>
                <Text className="font-sans text-sm text-mist">
                  {usage.reason ?? 'Your subscription is ready for the next scan.'}
                </Text>
              </>
            ) : error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : (
              <ActivityIndicator color="#D96B8C" />
            )}
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              Start your next analysis
            </Text>
            <Text className="font-sans text-base leading-7 text-mist">
              The camera-led flow and live provider integration will connect here
              after the final smoke test validation.
            </Text>
            <Button label="Begin Analysis" />
          </View>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}
