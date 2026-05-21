import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAnalysisHistory({ page: 1, limit: 12 });
      setItems(response.items);
    } catch {
      setError('We could not load your progress comparison right now.');
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
      { key: 'overall', label: 'Overall score' },
      { key: 'acne', label: 'Acne' },
      { key: 'pigmentation', label: 'Pigmentation' },
      { key: 'skinTone', label: 'Skin tone' },
      { key: 'pores', label: 'Pores' },
      { key: 'moisture', label: 'Moisture' },
      { key: 'oiliness', label: 'Oiliness' },
      { key: 'wrinkles', label: 'Wrinkles' },
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
  }, [baseline, latest]);

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

  const elapsedLabel =
    baseline && latest
      ? formatElapsedTime(baseline.capturedAt, latest.capturedAt)
      : 'your saved history';

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
              eyebrow="Comparison"
              title="First scan vs latest scan."
              body="This is the emotional proof layer behind your subscription. Use it to make improvement feel visible, measurable, and worth continuing."
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
                    label="Try Again"
                    variant="secondary"
                    onPress={() => void loadHistory()}
                  />
                </View>
              </GlassCard>
            ) : sortedItems.length < 2 || !baseline || !latest ? (
              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    Comparison unlocks after two analyses
                  </Text>
                  <Text className="font-sans text-base leading-7 text-mist">
                    Complete one more analysis so the app can compare your earliest and latest results and show visible progress over time.
                  </Text>
                  <Button
                    label="Run Another Analysis"
                    onPress={() => router.push('/(app)/(tabs)/analysis')}
                  />
                </View>
              </GlassCard>
            ) : (
              <>
                <GlassCard>
                  <View className="gap-4">
                    <Text className="font-bold text-lg text-charcoal">
                      Side-by-side proof
                    </Text>
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 14,
                      }}
                    >
                      {[baseline, latest].map((item, index) => {
                        const average = getAverageScore(item.scores);
                        const title = index === 0 ? 'Starting point' : 'Latest result';

                        return (
                          <View
                            key={`${item.analysisId}-${title}`}
                            className="flex-1 rounded-[24px] bg-white/70 p-4"
                          >
                            <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                              {title}
                            </Text>
                            <Text className="mt-2 font-bold text-base text-charcoal">
                              {new Date(item.capturedAt).toLocaleDateString(undefined, {
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
                              <Text className="font-sans text-sm text-mist">Average score</Text>
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
                      Progress summary
                    </Text>
                    <Text className="font-sans text-base leading-7 text-mist">
                      {strongestImprovement
                        ? `Your strongest improvement is ${strongestImprovement.label.toLowerCase()}, up ${strongestImprovement.percentChange}% in ${elapsedLabel}. This is the kind of visible progress that helps users keep trusting the routine.`
                        : largestDrop
                          ? `Your biggest drop is in ${largestDrop.label.toLowerCase()}, down ${Math.abs(largestDrop.percentChange)}% in ${elapsedLabel}. That makes your next routine adjustment and follow-up scan especially important.`
                          : `Your results are relatively steady across ${elapsedLabel}. Keep scanning consistently so the next visible shift is easy to prove.`}
                    </Text>
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 12,
                      }}
                    >
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          Time span
                        </Text>
                        <Text className="mt-2 font-bold text-xl text-charcoal">
                          {elapsedLabel}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          Net overall change
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
                      Parameter changes
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
                        <View className="mt-3 flex-row items-center justify-between gap-3">
                          <View>
                            <Text className="font-sans text-xs uppercase tracking-[1.4px] text-mist">
                              First
                            </Text>
                            <Text className="mt-1 font-bold text-lg text-charcoal">
                              {metric.baseline}
                            </Text>
                          </View>
                          <Text className="font-sans text-sm text-mist">→</Text>
                          <View className="items-end">
                            <Text className="font-sans text-xs uppercase tracking-[1.4px] text-mist">
                              Latest
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
                            ? `${metric.label} improved by ${Math.abs(metric.percentChange)}% over ${elapsedLabel}.`
                            : `${metric.label} decreased by ${Math.abs(metric.percentChange)}% over ${elapsedLabel}.`}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>

                <View className="gap-3 pb-6">
                  <Button
                    label="Open Latest Report"
                    onPress={() =>
                      router.push({
                        pathname: '/analysis-result/[id]' as never,
                        params: { id: latest.analysisId } as never,
                      })
                    }
                  />
                  <Button
                    label="Back to History"
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

function formatElapsedTime(start: string, end: string): string {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return 'your recent timeline';
  }

  const diffDays = Math.max(Math.round((endTime - startTime) / (1000 * 60 * 60 * 24)), 1);

  if (diffDays < 14) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }

  if (diffDays < 60) {
    const weeks = Math.max(Math.round(diffDays / 7), 1);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  const months = Math.max(Math.round(diffDays / 30), 1);
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
