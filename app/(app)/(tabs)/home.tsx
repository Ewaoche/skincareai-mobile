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
import { useI18n } from '@/lib/i18n';
import { AppLanguage } from '@/lib/i18n/types';

export default function HomeScreen() {
  const layout = useResponsiveLayout();
  const { language, t } = useI18n();
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

  const displayName =
    user?.firstName?.trim() ||
    user?.fullName?.trim() ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow={t('home.eyebrow')}
          title={t('home.welcome', { name: displayName })}
          body={t('home.body')}
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
                  {t('home.subscription')}
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
                      {t('home.remaining', { count: usage.remainingAnalyses })}
                    </Text>
                    <Text className="font-sans text-sm text-mist">
                      {usage.reason ?? t('home.ready')}
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
                    label={t('home.upgradePlan')}
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
                  {t('home.status')}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {current?.status ?? t('home.loading')}
                </Text>
              </View>
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  {t('home.refresh')}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {usage ? t('home.left', { count: usage.remainingAnalyses }) : t('home.syncing')}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              {t('home.startTitle')}
            </Text>
            <Text className="font-sans text-base leading-7 text-mist">
              {t('home.startBody')}
            </Text>
            <Button
              label={t('home.beginAnalysis')}
              onPress={() => router.push('/(app)/(tabs)/analysis')}
            />
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              {t('home.latestTitle')}
            </Text>
            {latest ? (
              <>
                <Text className="font-sans text-sm text-mist">
                  {t('home.captured', {
                    date: new Date(latest.capturedAt).toLocaleString(language),
                  })}
                </Text>
                <AnalysisScoreGrid scores={latest.scores} />
                <Button
                  label={t('home.openResult')}
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
                {latestError ?? t('home.firstAnalysis')}
              </Text>
            )}
          </View>
        </GlassCard>
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}
