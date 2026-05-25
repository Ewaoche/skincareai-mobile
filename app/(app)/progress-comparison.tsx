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
  const [focusView, setFocusView] = useState<'before' | 'after'>('after');

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
      ? formatElapsedTime(baseline.capturedAt, latest.capturedAt)
      : 'your saved history';
  const focusItem = focusView === 'before' ? baseline : latest;
  const focusAverage = focusItem ? getAverageScore(focusItem.scores) : null;
  const focusTitle = focusView === 'before' ? 'Starting point' : 'Latest result';

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
              title="First scan vs latest scan"
              body="Compare your earlier and latest results side by side to see how your skin has changed over time."
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
                      Visual comparison
                    </Text>
                    <Text className="font-sans text-sm leading-6 text-mist">
                      Switch between your first and latest scan for a closer look at how your skin has changed.
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                      {[
                        { key: 'before', label: 'Before' },
                        { key: 'after', label: 'After' },
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
                            {new Date(focusItem.capturedAt).toLocaleDateString(undefined, {
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
                            ? 'This is your starting point and helps you track how your skin changes over time.'
                            : 'This is your latest result and shows where your skin stands today.'}
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
                        const title = index === 0 ? 'Starting point' : 'Latest result';

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
                        ? `Your strongest improvement is ${strongestImprovement.label.toLowerCase()}, up ${strongestImprovement.percentChange}% in ${elapsedLabel}.`
                        : largestDrop
                          ? `Your biggest drop is in ${largestDrop.label.toLowerCase()}, down ${Math.abs(largestDrop.percentChange)}% in ${elapsedLabel}.`
                          : `Your results are relatively steady across ${elapsedLabel}. Keep tracking to build a clearer picture over time.`}
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
                      The story so far
                    </Text>
                    <View
                      style={{
                        flexDirection: layout.isTablet ? 'row' : 'column',
                        gap: 12,
                      }}
                    >
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          Biggest win
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {strongestImprovement
                            ? strongestImprovement.label
                            : 'No clear winner yet'}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {strongestImprovement
                            ? `${strongestImprovement.label} is up ${Math.abs(
                                strongestImprovement.percentChange,
                              )}% over ${elapsedLabel}.`
                            : 'Keep tracking to see which area improves the most over time.'}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          Needs attention
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {largestDrop ? largestDrop.label : 'No major drop'}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {largestDrop
                            ? `${largestDrop.label} is down ${Math.abs(
                                largestDrop.percentChange,
                              )}% over ${elapsedLabel}.`
                            : 'No major drop has appeared so far, which is a good sign of stability.'}
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
                          Best scan
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {bestScan ? `Score ${bestScan.average}` : 'Not enough data'}
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {bestScan
                            ? `Your best overall scan so far was on ${new Date(
                                bestScan.item.capturedAt,
                              ).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}.`
                            : 'Complete more analyses to unlock a stronger milestone view.'}
                        </Text>
                      </View>
                      <View className="flex-1 rounded-[22px] bg-white/70 px-4 py-4">
                        <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                          Consistency
                        </Text>
                        <Text className="mt-2 font-bold text-lg text-charcoal">
                          {sortedItems.length} analyses
                        </Text>
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {`You have tracked ${sortedItems.length} analyses across ${elapsedLabel}. The more consistently you check in, the clearer your progress becomes.`}
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
                            ? 'Improving'
                            : metric.delta < 0
                              ? 'Needs more support'
                              : 'Stable'}
                        </Text>
                        <View className="mt-3 flex-row items-center justify-between gap-3">
                          <View>
                            <Text className="font-sans text-xs uppercase tracking-[1.4px] text-mist">
                              First
                            </Text>
                            <Text className="mt-1 font-bold text-lg text-charcoal">
                              {metric.baseline}
                            </Text>
                          </View>
                          <Text className="font-sans text-sm text-mist">to</Text>
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
                        <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                          {buildMetricNarrative(metric, elapsedLabel)}
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

function buildMetricNarrative(
  metric: ComparisonMetric,
  elapsedLabel: string,
): string {
  if (metric.delta === 0) {
    return `${metric.label} has stayed steady across ${elapsedLabel}. Keep the routine consistent so the next scan reveals a stronger directional change.`;
  }

  const direction = metric.delta > 0 ? 'moving in the right direction' : 'showing resistance';

  switch (metric.key) {
    case 'acne':
      return `Your acne trend is ${direction}. This helps you see how breakouts are changing over time.`;
    case 'pigmentation':
      return `Pigmentation usually changes gradually, so this ${elapsedLabel} view helps you notice progress that is easy to miss day to day.`;
    case 'skinTone':
      return `Tone consistency helps your skin look more balanced overall, not just in one area.`;
    case 'pores':
      return `Pore changes are subtle in day-to-day life. Tracking them over ${elapsedLabel} makes improvement easier to believe and maintain.`;
    case 'moisture':
      return `Moisture is one of the easiest changes to notice. When hydration improves, your skin often looks and feels healthier.`;
    case 'oiliness':
      return `Oiliness balance affects how the skin feels every day. This helps translate analysis into something the user can connect back to the routine.`;
    case 'wrinkles':
      return `Wrinkle improvement reinforces the long-game value of the app. Even modest progress here can be powerful when it is tracked clearly over time.`;
    case 'overall':
      return `Overall score gives the user one clean headline number. It is the simplest way to show whether the full routine is compounding in the right direction.`;
    default:
      return `This metric is ${direction} over ${elapsedLabel}, which helps turn raw analysis into a clearer progress story.`;
  }
}
