import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { useResponsiveLayout } from '@/components/ui/responsive';
import { SectionHeading } from '@/components/ui/section-heading';
import { getAverageScore } from '@/lib/analysis/score-insights';
import { AnalysisResult, getAnalysisHistory } from '@/lib/api/analysis-api';
import { useI18n } from '@/lib/i18n';
import { AppLanguage } from '@/lib/i18n/types';

type ComparisonMetric = {
  key: string;
  label: string;
  baseline: number;
  latest: number;
  delta: number;
  percentChange: number;
};

export default function ProgressComparisonScreen() {
  const layout = useResponsiveLayout();
  const { language, t } = useI18n();
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusView, setFocusView] = useState<'before' | 'after'>('after');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalysisHistory({ page: 1, limit: 12 });
      setItems(response.items);
    } catch {
      setError(t('comparison.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (left, right) =>
          new Date(left.capturedAt).getTime() - new Date(right.capturedAt).getTime(),
      ),
    [items],
  );

  const baseline = sortedItems[0] ?? null;
  const latest = sortedItems[sortedItems.length - 1] ?? null;

  const comparisonMetrics = useMemo<ComparisonMetric[]>(() => {
    if (!baseline || !latest) {
      return [];
    }

    const metricDefinitions = [
      { key: 'overall', label: t('history.metric.overall') },
      { key: 'acne', label: t('history.metric.acne') },
      { key: 'pigmentation', label: t('history.metric.pigmentation') },
      { key: 'skinTone', label: t('history.metric.skinTone') },
      { key: 'pores', label: t('history.metric.pores') },
      { key: 'moisture', label: t('history.metric.moisture') },
      { key: 'oiliness', label: t('history.metric.oiliness') },
      { key: 'wrinkles', label: t('history.metric.wrinkles') },
    ] as const;

    return metricDefinitions.map((metric) => {
      const baselineValue =
        metric.key === 'overall'
          ? getAverageScore(baseline.scores)
          : baseline.scores[metric.key];
      const latestValue =
        metric.key === 'overall'
          ? getAverageScore(latest.scores)
          : latest.scores[metric.key];
      const delta = Math.round((latestValue - baselineValue) * 10) / 10;
      const percentChange =
        Math.round((((latestValue - baselineValue) / Math.max(baselineValue, 1)) * 100) * 10) /
        10;

      return {
        key: metric.key,
        label: metric.label,
        baseline: baselineValue,
        latest: latestValue,
        delta,
        percentChange,
      };
    });
  }, [baseline, latest, t]);

  const strongestImprovement = useMemo(
    () =>
      comparisonMetrics
        .filter((metric) => metric.delta > 0)
        .sort((left, right) => right.percentChange - left.percentChange)[0] ?? null,
    [comparisonMetrics],
  );

  const largestDrop = useMemo(
    () =>
      comparisonMetrics
        .filter((metric) => metric.delta < 0)
        .sort((left, right) => left.percentChange - right.percentChange)[0] ?? null,
    [comparisonMetrics],
  );

  const bestScan = useMemo(
    () =>
      sortedItems
        .map((item) => ({
          item,
          average: getAverageScore(item.scores),
        }))
        .sort((left, right) => right.average - left.average)[0] ?? null,
    [sortedItems],
  );

  const elapsedLabel =
    baseline && latest
      ? formatElapsedTime(baseline.capturedAt, latest.capturedAt, language, t('comparison.timelineRecent'))
      : t('comparison.timelineRecent');
  const focusItem = focusView === 'before' ? baseline : latest;
  const focusAverage = focusItem ? getAverageScore(focusItem.scores) : null;
  const focusTitle =
    focusView === 'before' ? t('comparison.startingPoint') : t('comparison.latestResult');

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void loadHistory()}
            tintColor="#D96B8C"
          />
        }
      >
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: layout.horizontalPadding,
            paddingTop: 18,
            paddingBottom: layout.tabBarHeight + 64,
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: layout.contentMaxWidth,
              gap: 18,
            }}
          >
            <SectionHeading
              eyebrow={t('comparison.eyebrow')}
              title={t('comparison.title')}
              body={t('comparison.body')}
            />

            {loading ? (
              <GlassCard>
                <ActivityIndicator color="#D96B8C" />
              </GlassCard>
            ) : error ? (
              <GlassCard>
                <View className="gap-4">
                  <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                  <Button
                    label={t('comparison.tryAgain')}
                    variant="secondary"
                    onPress={() => void loadHistory()}
                  />
                </View>
              </GlassCard>
            ) : sortedItems.length < 2 || !baseline || !latest ? (
              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    {t('comparison.unlockTitle')}
                  </Text>
                  <Text className="font-sans text-base leading-7 text-mist">
                    {t('comparison.unlockBody')}
                  </Text>
                  <Button
                    label={t('comparison.runAnother')}
                    onPress={() => router.push('/(app)/(tabs)/analysis')}
                  />
                </View>
              </GlassCard>
            ) : (
              <>
                <GlassCard>
                  <View className="gap-4">
                    <Text className="font-bold text-lg text-charcoal">
                      {t('comparison.visualTitle')}
                    </Text>
                    <Text className="font-sans text-sm leading-6 text-mist">
                      {t('comparison.visualBody')}
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                      {[
                        { key: 'before', label: t('comparison.before') },
                        { key: 'after', label: t('comparison.after') },
                      ].map((option) => {
                        const active = focusView === option.key;

                        return (
                          <Pressable
                            key={option.key}
                            onPress={() => setFocusView(option.key as 'before' | 'after')}
                            className={`rounded-full px-4 py-3 ${
                              active ? 'bg-roseDeep' : 'bg-white/70'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold uppercase tracking-[1.4px] ${
                                active ? 'text-white' : 'text-charcoal'
                              }`}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {focusItem ? (
                      <View className="rounded-[24px] bg-white/70 p-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {focusTitle}
                        </Text>
                        <View className="mt-2 flex-row items-center justify-between gap-3">
                          <Text className="font-bold text-base text-charcoal">
                            {new Date(focusItem.capturedAt).toLocaleDateString(language, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                          {focusAverage !== null ? (
                            <Text className="font-extra text-[28px] leading-[30px] text-charcoal">
                              {focusAverage}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          className="mt-4 overflow-hidden rounded-[22px] bg-[#f7f1ee]"
                          style={{ aspectRatio: 3 / 4 }}
                        >
                          <Image
                            source={{ uri: focusItem.selfieUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        </View>
                        <Text className="mt-4 font-sans text-sm leading-6 text-mist">
                          {focusView === 'before'
                            ? t('comparison.startingBody')
                            : t('comparison.latestBody')}
                        </Text>
                      </View>
                    ) : null}
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 14,
                      }}
                    >
                      {[baseline, latest].map((item, index) => {
                        const average = getAverageScore(item.scores);
                        const title =
                          index === 0
                            ? t('comparison.startingPoint')
                            : t('comparison.latestResult');

                        return (
                          <View
                            key={`${item.analysisId}-${title}`}
                            className={`flex-1 rounded-[24px] p-4 ${
                              focusView === (index === 0 ? 'before' : 'after')
                                ? 'bg-white'
                                : 'bg-white/55'
                            }`}
                          >
                            <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                              {title}
                            </Text>
                            <Text className="mt-2 font-bold text-base text-charcoal">
                              {new Date(item.capturedAt).toLocaleDateString(language, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Text>
                            <View
                              className="mt-4 overflow-hidden rounded-[22px] bg-[#f7f1ee]"
                              style={{ aspectRatio: 3 / 4 }}
                            >
                              <Image
                                source={{ uri: item.selfieUrl }}
                                className="h-full w-full"
                                resizeMode="cover"
                              />
                            </View>
                            <View className="mt-4 flex-row items-center justify-between">
                              <Text className="font-sans text-sm text-mist">
                                {t('comparison.averageScore')}
                              </Text>
                              <Text className="font-extra text-[28px] leading-[30px] text-charcoal">
                                {average}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </GlassCard>

                <GlassCard>
                  <View className="gap-4">
                    <Text className="font-bold text-lg text-charcoal">
                      {t('comparison.progressSummary')}
                    </Text>
                    <Text className="font-sans text-base leading-7 text-mist">
                      {strongestImprovement
                        ? t('comparison.summary.improved', {
                            label: strongestImprovement.label.toLowerCase(),
                            percent: strongestImprovement.percentChange,
                            elapsed: elapsedLabel,
                          })
                        : largestDrop
                          ? t('comparison.summary.decreased', {
                              label: largestDrop.label.toLowerCase(),
                              percent: Math.abs(largestDrop.percentChange),
                              elapsed: elapsedLabel,
                            })
                          : t('comparison.summary.steady', { elapsed: elapsedLabel })}
                    </Text>
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 12,
                      }}
                    >
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {t('comparison.timeSpan')}
                        </Text>
                        <Text className="mt-2 font-bold text-xl text-charcoal">
                          {elapsedLabel}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {t('comparison.netOverallChange')}
                        </Text>
                        <Text
                          className={`mt-2 font-bold text-xl ${
                            (comparisonMetrics[0]?.delta ?? 0) >= 0
                              ? 'text-emerald-700'
                              : 'text-roseDeep'
                          }`}
                        >
                          {formatDelta(comparisonMetrics[0]?.delta ?? 0)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>

                <GlassCard>
                  <View className="gap-4">
                    <Text className="font-bold text-lg text-charcoal">
                      {t('comparison.storyTitle')}
                    </Text>
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 12,
                      }}
                    >
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {t('comparison.biggestWin')}
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {strongestImprovement ? strongestImprovement.label : t('comparison.noWinner')}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {strongestImprovement
                            ? t('comparison.winDetail', {
                                label: strongestImprovement.label,
                                percent: Math.abs(strongestImprovement.percentChange),
                                elapsed: elapsedLabel,
                              })
                            : t('comparison.winFallback')}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {t('comparison.needsAttention')}
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {largestDrop ? largestDrop.label : t('comparison.noDrop')}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {largestDrop
                            ? t('comparison.dropDetail', {
                                label: largestDrop.label,
                                percent: Math.abs(largestDrop.percentChange),
                                elapsed: elapsedLabel,
                              })
                            : t('comparison.dropFallback')}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 12,
                      }}
                    >
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {t('comparison.bestScan')}
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {bestScan
                            ? t('comparison.bestScanScore', { score: bestScan.average })
                            : t('comparison.notEnoughData')}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {bestScan
                            ? t('comparison.bestScanDetail', {
                                date: new Date(bestScan.item.capturedAt).toLocaleDateString(
                                  language,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  },
                                ),
                              })
                            : t('comparison.bestScanFallback')}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          {t('comparison.consistency')}
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {t('comparison.analysisCount', { count: sortedItems.length })}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {t('comparison.consistencyDetail', {
                            count: sortedItems.length,
                            elapsed: elapsedLabel,
                          })}
                        </Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>

                <GlassCard>
                  <View className="gap-4">
                    <Text className="font-bold text-lg text-charcoal">
                      {t('comparison.parameterChanges')}
                    </Text>
                    {comparisonMetrics.map((metric) => (
                      <View
                        key={metric.key}
                        className="rounded-[22px] bg-white/70 px-4 py-4"
                      >
                        <View className="flex-row items-center justify-between gap-3">
                          <Text className="font-bold text-base text-charcoal">
                            {metric.label}
                          </Text>
                          <Text
                            className={`font-semibold text-sm ${
                              metric.delta >= 0 ? 'text-emerald-700' : 'text-roseDeep'
                            }`}
                          >
                            {formatPercent(metric.percentChange)}
                          </Text>
                        </View>
                        <Text
                          className={`mt-2 font-sans text-xs uppercase tracking-[1.4px] ${
                            metric.delta > 0
                              ? 'text-emerald-700'
                              : metric.delta < 0
                                ? 'text-roseDeep'
                                : 'text-mist'
                          }`}
                        >
                          {metric.delta > 0
                            ? t('comparison.improving')
                            : metric.delta < 0
                              ? t('comparison.needsSupport')
                              : t('comparison.stable')}
                        </Text>
                        <View className="mt-3 flex-row items-center justify-between gap-3">
                          <View>
                            <Text className="font-sans text-xs uppercase tracking-[1.4px] text-mist">
                              {t('comparison.first')}
                            </Text>
                            <Text className="mt-1 font-bold text-lg text-charcoal">
                              {metric.baseline}
                            </Text>
                          </View>
                          <Text className="font-sans text-sm text-mist">{t('comparison.to')}</Text>
                          <View className="items-end">
                            <Text className="font-sans text-xs uppercase tracking-[1.4px] text-mist">
                              {t('comparison.latest')}
                            </Text>
                            <Text className="mt-1 font-bold text-lg text-charcoal">
                              {metric.latest}
                            </Text>
                          </View>
                        </View>
                        <Text
                          className={`mt-3 font-sans text-sm ${
                            metric.delta >= 0 ? 'text-emerald-700' : 'text-roseDeep'
                          }`}
                        >
                          {metric.delta >= 0
                            ? t('comparison.metricImproved', {
                                label: metric.label,
                                percent: Math.abs(metric.percentChange),
                                elapsed: elapsedLabel,
                              })
                            : t('comparison.metricDecreased', {
                                label: metric.label,
                                percent: Math.abs(metric.percentChange),
                                elapsed: elapsedLabel,
                              })}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {buildMetricNarrative(metric, elapsedLabel, t)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>

                <View className="gap-3 pb-6">
                  <Button
                    label={t('comparison.openLatest')}
                    onPress={() =>
                      router.push({
                        pathname: '/analysis-result/[id]' as never,
                        params: { id: latest.analysisId } as never,
                      })
                    }
                  />
                  <Button
                    label={t('comparison.backHistory')}
                    variant="secondary"
                    onPress={() => router.back()}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </GradientScreen>
  );
}

function formatElapsedTime(
  start: string,
  end: string,
  language: AppLanguage,
  fallback: string,
): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return fallback;
  }

  const diffDays = Math.max(Math.round((endTime - startTime) / (1000 * 60 * 60 * 24)), 1);

  if (diffDays < 14) {
    if (language === 'el') {
      return diffDays === 1 ? '1 ημέρα' : `${diffDays} ημέρες`;
    }

    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }

  if (diffDays < 60) {
    const weeks = Math.max(Math.round(diffDays / 7), 1);
    if (language === 'el') {
      return weeks === 1 ? '1 εβδομάδα' : `${weeks} εβδομάδες`;
    }

    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  const months = Math.max(Math.round(diffDays / 30), 1);
  if (language === 'el') {
    return months === 1 ? '1 μήνα' : `${months} μήνες`;
  }

  return `${months} month${months === 1 ? '' : 's'}`;
}

function formatDelta(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded > 0 ? `+${rounded}%` : `${rounded}%`;
}

function buildMetricNarrative(
  metric: ComparisonMetric,
  elapsedLabel: string,
  t: (key: any, variables?: Record<string, string | number>) => string,
): string {
  if (metric.delta === 0) {
    return t('comparison.narrative.steady', {
      label: metric.label,
      elapsed: elapsedLabel,
    });
  }

  const direction =
    metric.delta > 0
      ? t('comparison.narrative.directionPositive')
      : t('comparison.narrative.directionNegative');

  switch (metric.key) {
    case 'acne':
      return t('comparison.narrative.acne', { direction });
    case 'pigmentation':
      return t('comparison.narrative.pigmentation', { elapsed: elapsedLabel });
    case 'skinTone':
      return t('comparison.narrative.skinTone');
    case 'pores':
      return t('comparison.narrative.pores', { elapsed: elapsedLabel });
    case 'moisture':
      return t('comparison.narrative.moisture');
    case 'oiliness':
      return t('comparison.narrative.oiliness');
    case 'wrinkles':
      return t('comparison.narrative.wrinkles');
    case 'overall':
      return t('comparison.narrative.overall');
    default:
      return t('comparison.narrative.default', {
        direction,
        elapsed: elapsedLabel,
      });
  }
}
