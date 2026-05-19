import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAnalysisStore } from '@/stores/analysis-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { AnalysisScoreGrid } from '@/components/analysis/analysis-score-grid';
import { ResponsiveScrollScreen, useResponsiveLayout } from '@/components/ui/responsive';

export default function HomeScreen() {
  const layout = useResponsiveLayout();
  const user = useAuthStore((state) => state.user);
  const current = useSubscriptionStore((state) => state.current);
  const usage = useSubscriptionStore((state) => state.usage);
  const error = useSubscriptionStore((state) => state.error);
  const refresh = useSubscriptionStore((state) => state.refresh);
  const latest = useAnalysisStore((state) => state.latest);
  const latestLoading = useAnalysisStore((state) => state.latestLoading);
  const latestError = useAnalysisStore((state) => state.latestError);
  const refreshLatest = useAnalysisStore((state) => state.refreshLatest);

  useEffect(() => {
    refresh().catch(() => {
      // The store exposes a user-facing error state for the screen to render.
    });
    refreshLatest().catch(() => {
      // The store exposes a user-facing error state for the screen to render.
    });
  }, [refresh, refreshLatest]);

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow="Home"
          title={`Welcome${user?.email ? ',' : ''} ${user?.email?.split('@')[0] ?? 'back'}.`}
          body="A premium skincare dashboard designed to keep your next analysis, limits, and progress in view."
        />

        <GlassCard>
          <View style={{ gap: 16 }}>
            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                alignItems: layout.isTablet ? 'center' : 'flex-start',
                justifyContent: 'space-between',
                gap: 14,
              }}
            >
              <View style={{ flex: 1, gap: 8 }}>
                <Text className="font-medium text-sm uppercase tracking-[2px] text-roseDeep">
                  Subscription
                </Text>
                {current && usage ? (
                  <>
                    <Text
                      className="font-bold text-charcoal"
                      style={{ fontSize: layout.isTablet ? 34 : 28 }}
                    >
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

              {current?.plan === 'FREE' ? (
                <View style={{ width: layout.isTablet ? 220 : '100%' }}>
                  <Button
                    label="Upgrade Plan"
                    variant="secondary"
                    onPress={() =>
                      router.push({
                        pathname: '/subscription' as never,
                      })
                    }
                  />
                </View>
              ) : null}
            </View>

            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                gap: 12,
              }}
            >
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  Status
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {current?.status ?? 'Loading'}
                </Text>
              </View>
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  Refresh
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {usage ? `${usage.remainingAnalyses} left` : 'Syncing'}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              Start your next analysis
            </Text>
            <Text className="font-sans text-base leading-7 text-mist">
              Pick a clear selfie, upload it to the live analysis endpoint, and
              review your returned skin scores in a premium result view.
            </Text>
            <Button
              label="Begin Analysis"
              onPress={() => router.push('/(app)/(tabs)/analysis')}
            />
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              Latest analysis
            </Text>
            {latest ? (
              <>
                <Text className="font-sans text-sm text-mist">
                  Captured {new Date(latest.capturedAt).toLocaleString()}
                </Text>
                <AnalysisScoreGrid scores={latest.scores} />
                <Button
                  label="Open Result"
                  variant="secondary"
                  onPress={() =>
                    router.push({
                      pathname: '/analysis-result/[id]' as never,
                      params: { id: latest.analysisId } as never,
                    })
                  }
                />
              </>
            ) : latestLoading ? (
              <ActivityIndicator color="#D96B8C" />
            ) : (
              <Text className="font-sans text-sm text-mist">
                {latestError ?? 'Your first completed analysis will appear here.'}
              </Text>
            )}
          </View>
        </GlassCard>
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}
