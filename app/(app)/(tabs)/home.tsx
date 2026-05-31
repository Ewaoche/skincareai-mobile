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
import { getAverageScore, getOverallGrade } from '@/lib/analysis/score-insights';

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
  const latestAverage = latest ? getAverageScore(latest.scores) : null;
  const latestGrade = latest ? getOverallGrade(latest.scores) : null;

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow={t('home.eyebrow')}
          title={t('home.welcome', { name: displayName })}
          body={t('home.body')}
        />

        <GlassCard>
          <View style={{ gap: 18 }}>
            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                alignItems: layout.isTablet ? 'center' : 'stretch',
                justifyContent: 'space-between',
                gap: 18,
              }}
            >
              <View
                style={{
                  flex: 1,
                  gap: 10,
                }}
              >
                <View
                  className="self-start rounded-pill border border-white/80 bg-white/70 px-3 py-2"
                >
                  <Text className="font-medium text-[11px] uppercase tracking-[1.8px] text-roseDeep">
                    {t('home.subscription')}
                  </Text>
                </View>
                {current && usage ? (
                  <View style={{ gap: 8 }}>
                    <Text
                      className="font-bold text-charcoal"
                      style={{ fontSize: layout.isTablet ? 38 : 30, lineHeight: layout.isTablet ? 44 : 36 }}
                    >
                      {current.plan}
                    </Text>
                    <Text className="font-sans text-base text-mist">
                      {t('home.remaining', { count: usage.remainingAnalyses })}
                    </Text>
                    <Text className="font-sans text-sm leading-6 text-mist">
                      {usage.reason ?? t('home.ready')}
                    </Text>
                  </View>
                ) : error ? (
                  <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                ) : (
                  <ActivityIndicator color="#D96B8C" />
                )}
              </View>

              <View
                style={{
                  width: layout.isTablet ? 220 : '100%',
                  minHeight: layout.isTablet ? 188 : 164,
                  borderRadius: layout.isTablet ? 34 : 28,
                  backgroundColor: 'rgba(255,255,255,0.68)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.78)',
                  padding: layout.isTablet ? 22 : 18,
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ gap: 8 }}>
                  <Text className="font-medium text-[11px] uppercase tracking-[1.6px] text-roseDeep">
                    Skin Snapshot
                  </Text>
                  <View className="flex-row items-end gap-2">
                    <Text
                      className="font-extra text-charcoal"
                      style={{ fontSize: layout.isTablet ? 50 : 42, lineHeight: layout.isTablet ? 52 : 44 }}
                    >
                      {latestAverage ?? '--'}
                    </Text>
                    <Text className="mb-1 font-medium text-sm text-mist">
                      {latestGrade ? `Grade ${latestGrade}` : 'No report yet'}
                    </Text>
                  </View>
                  <Text className="font-sans text-sm leading-6 text-mist">
                    {latest
                      ? 'Your latest scan is ready to review, compare, and turn into a clearer routine.'
                      : 'Run your first scan to unlock personalized skin scores and recommendations.'}
                  </Text>
                </View>
                <Button
                  label={current?.plan === 'FREE' ? t('home.upgradePlan') : 'View history'}
                  variant="secondary"
                  onPress={() =>
                    router.push(current?.plan === 'FREE' ? ('/subscription' as never) : ('/(app)/(tabs)/history' as never))
                  }
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                gap: 12,
              }}
            >
              <View className="rounded-[24px] border border-white/70 bg-white/62 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  {t('home.status')}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {current?.status ?? t('home.loading')}
                </Text>
              </View>
              <View className="rounded-[24px] border border-white/70 bg-white/62 px-4 py-4" style={{ flex: 1 }}>
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

        <View
          style={{
            flexDirection: layout.isTablet ? 'row' : 'column',
            gap: 18,
          }}
        >
          <GlassCard>
            <View className="gap-4">
              <View className="self-start rounded-pill border border-white/80 bg-white/72 px-3 py-2">
                <Text className="font-medium text-[11px] uppercase tracking-[1.6px] text-roseDeep">
                  Analysis Flow
                </Text>
              </View>
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
              <View className="self-start rounded-pill border border-white/80 bg-white/72 px-3 py-2">
                <Text className="font-medium text-[11px] uppercase tracking-[1.6px] text-roseDeep">
                  Complexion Match
                </Text>
              </View>
              <Text className="font-bold text-lg text-charcoal">
                Shade Matching
              </Text>
              <Text className="font-sans text-base leading-7 text-mist">
                Use the separate complexion flow to find foundation and concealer shades, then keep the best ones in your Saved Shade Shelf.
              </Text>
              <View style={{ gap: 12 }}>
                <Button
                  label="Open Shade Match"
                  variant="secondary"
                  onPress={() => router.push('/shade-match' as never)}
                />
                <Button
                  label="Open Saved Shade Shelf"
                  variant="ghost"
                  onPress={() => router.push('/shade-shelf' as never)}
                />
              </View>
            </View>
          </GlassCard>
        </View>

        <GlassCard>
          <View className="gap-4">
            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                justifyContent: 'space-between',
                alignItems: layout.isTablet ? 'center' : 'flex-start',
                gap: 10,
              }}
            >
              <View style={{ gap: 6 }}>
                <Text className="font-bold text-lg text-charcoal">
                  {t('home.latestTitle')}
                </Text>
                {latest ? (
                  <Text className="font-sans text-sm text-mist">
                    {t('home.captured', {
                      date: new Date(latest.capturedAt).toLocaleString(language),
                    })}
                  </Text>
                ) : null}
              </View>
              {latestAverage !== null ? (
                <View className="rounded-pill border border-white/80 bg-white/72 px-4 py-2">
                  <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                    Overall {latestAverage}
                  </Text>
                </View>
              ) : null}
            </View>
            {latest ? (
              <>
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
