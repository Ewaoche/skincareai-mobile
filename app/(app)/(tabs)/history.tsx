import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AnalysisScoreGrid } from '@/components/analysis/analysis-score-grid';
import {
  ProgressChartCard,
  ProgressMetricOption,
} from '@/components/analysis/progress-chart-card';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useResponsiveLayout } from '@/components/ui/responsive';
import {
  getAverageScore,
  getOverallGrade,
  getWeakestConcerns,
} from '@/lib/analysis/score-insights';
import { AnalysisResult, getAnalysisHistory } from '@/lib/api/analysis-api';
import { useI18n } from '@/lib/i18n';
import { AppLanguage } from '@/lib/i18n/types';

export default function HistoryScreen() {
  const layout = useResponsiveLayout();
  const { language, t } = useI18n();
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalysisHistory({ page: 1, limit: 10 });
      setItems(response.items);
    } catch {
      setError(t('history.errorDefault'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const timelineItems = useMemo(
    () =>
      [...items]
        .sort(
          (left, right) =>
            new Date(left.capturedAt).getTime() - new Date(right.capturedAt).getTime(),
        )
        .slice(-6),
    [items],
  );

  const metricOptions = useMemo<ProgressMetricOption[]>(
    () => [
      { key: 'overall', label: t('history.metric.overall') },
      { key: 'acne', label: t('history.metric.acne') },
      { key: 'pigmentation', label: t('history.metric.pigmentation') },
      { key: 'skinTone', label: t('history.metric.skinTone') },
      { key: 'pores', label: t('history.metric.pores') },
      { key: 'moisture', label: t('history.metric.moisture') },
      { key: 'oiliness', label: t('history.metric.oiliness') },
      { key: 'wrinkles', label: t('history.metric.wrinkles') },
    ],
    [t],
  );

  const progressData = useMemo(() => {
    return timelineItems.map((item) => {
      const date = new Date(item.capturedAt);
      const value =
        selectedMetric === 'overall'
          ? getAverageScore(item.scores)
          : item.scores[selectedMetric as keyof AnalysisResult['scores']];

      return {
        label: date.toLocaleDateString(language),
        shortLabel: date.toLocaleDateString(language, {
          month: 'short',
          day: 'numeric',
        }),
        value,
      };
    });
  }, [language, selectedMetric, timelineItems]);

  const progressSummary = useMemo(() => {
    const selectedMetricLabel =
      selectedMetric === 'overall'
        ? t('history.metric.overall').toLowerCase()
        : metricOptions.find((option) => option.key === selectedMetric)?.label?.toLowerCase() ??
          t('history.metric.overall').toLowerCase();

    if (progressData.length === 0) {
      return {
        latestValue: null,
        deltaValue: null,
        percentChange: null,
        elapsedLabel: null,
        deltaLabel: t('history.summary.noTrend'),
      };
    }

    const first = progressData[0]?.value ?? null;
    const latest = progressData[progressData.length - 1]?.value ?? null;
    const firstItem = timelineItems[0] ?? null;
    const latestItem = timelineItems[timelineItems.length - 1] ?? null;
    const deltaValue =
      first === null || latest === null ? null : Math.round((latest - first) * 10) / 10;
    const percentChange =
      first === null || latest === null
        ? null
        : Math.round((((latest - first) / Math.max(first, 1)) * 100) * 10) / 10;
    const elapsedLabel =
      firstItem && latestItem
        ? formatElapsedTime(firstItem.capturedAt, latestItem.capturedAt, language)
        : null;

    return {
      latestValue: latest,
      deltaValue,
      percentChange,
      elapsedLabel,
      deltaLabel:
        deltaValue === null
          ? t('history.summary.noTrend')
          : deltaValue > 0
            ? t('history.summary.improved', {
                label: selectedMetricLabel,
                percent: Math.abs(percentChange ?? 0),
                elapsed: elapsedLabel ?? '',
              })
            : deltaValue < 0
              ? t('history.summary.decreased', {
                  label: selectedMetricLabel,
                  percent: Math.abs(percentChange ?? 0),
                  elapsed: elapsedLabel ?? '',
                })
              : t('history.summary.noTrend'),
    };
  }, [language, metricOptions, progressData, selectedMetric, t, timelineItems]);

  const latestWeakConcern = items[0]
    ? getWeakestConcerns(items[0].scores, 1)[0] ?? null
    : null;

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
              eyebrow={t('history.eyebrow')}
              title={t('history.title')}
              body={t('history.body')}
            />

            {!loading && !error ? (
              <ProgressChartCard
                title={t('history.progressTitle')}
                description={t('history.progressBody')}
                options={metricOptions}
                selectedKey={selectedMetric}
                onSelect={setSelectedMetric}
                data={progressData}
                latestValue={progressSummary.latestValue}
                deltaValue={progressSummary.deltaValue}
                deltaLabel={progressSummary.deltaLabel}
              />
            ) : null}

            {!loading && !error && items.length > 0 ? (
              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    {t('history.summaryTitle')}
                  </Text>
                  <Text className="font-sans text-base leading-7 text-mist">
                    {progressSummary.percentChange !== null &&
                    progressSummary.percentChange > 0 &&
                    progressSummary.elapsedLabel
                      ? `Your ${selectedMetric === 'overall' ? 'overall skin score' : metricOptions.find((option) => option.key === selectedMetric)?.label?.toLowerCase() ?? 'selected metric'} improved by ${progressSummary.percentChange}% in ${progressSummary.elapsedLabel}.`
                      : progressSummary.percentChange !== null &&
                          progressSummary.percentChange < 0 &&
                          progressSummary.elapsedLabel
                        ? `Your ${selectedMetric === 'overall' ? 'overall skin score' : metricOptions.find((option) => option.key === selectedMetric)?.label?.toLowerCase() ?? 'selected metric'} decreased by ${Math.abs(progressSummary.percentChange)}% in ${progressSummary.elapsedLabel}. A follow-up analysis can help you see what changes next.`
                      : latestWeakConcern
                        ? t('history.summary.lowest', {
                            label: latestWeakConcern.label.toLowerCase(),
                            score: latestWeakConcern.score,
                          })
                        : t('history.summary.noTrend')}
                  </Text>
                  {items.length > 1 ? (
                    <Button
                      label={t('history.summary.compare')}
                      variant="secondary"
                      onPress={() => router.push('/progress-comparison' as never)}
                    />
                  ) : null}
                </View>
              </GlassCard>
            ) : null}

            <GlassCard>
              {loading ? (
                <ActivityIndicator color="#D96B8C" />
              ) : error ? (
                <View className="gap-4">
                  <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                  <Button
                    label={t('history.tryAgain')}
                    variant="secondary"
                    onPress={() => void loadHistory()}
                  />
                </View>
              ) : items.length === 0 ? (
                <Text className="font-sans text-base leading-7 text-mist">
                  {t('history.empty')}
                </Text>
              ) : (
                <View className="gap-4">
                  {items.map((item) => (
                    <Pressable
                      key={item.analysisId}
                      onPress={() =>
                        router.push({
                          pathname: '/analysis-result/[id]' as never,
                          params: { id: item.analysisId } as never,
                        })
                      }
                      className="gap-4 rounded-[24px] border border-white/70 bg-white/60"
                      style={{ padding: layout.isTablet ? 20 : 16 }}
                    >
                      <View
                        style={{
                          flexDirection: layout.isTablet ? 'row' : 'column',
                          alignItems: layout.isTablet ? 'center' : 'flex-start',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text className="font-bold text-base text-charcoal">
                            {new Date(item.capturedAt).toLocaleString(language)}
                          </Text>
                          <Text className="mt-1 font-sans text-sm text-mist">
                            {t('history.averageGrade', {
                              average: getAverageScore(item.scores),
                              grade: getOverallGrade(item.scores),
                            })}
                          </Text>
                        </View>
                        <View className="rounded-pill bg-charcoal px-3 py-2">
                          <Text className="font-medium text-xs uppercase tracking-[1.4px] text-white">
                            {t('history.viewReport')}
                          </Text>
                        </View>
                      </View>
                      <AnalysisScoreGrid scores={item.scores} />
                    </Pressable>
                  ))}
                </View>
              )}
            </GlassCard>
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
): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return language === 'el' ? 'το πρόσφατο χρονικό σας διάστημα' : 'your recent timeline';
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
