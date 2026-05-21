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

export default function HistoryScreen() {
  const layout = useResponsiveLayout();
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
      setError('We could not load your analysis history right now.');
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
      { key: 'overall', label: 'Overall' },
      { key: 'acne', label: 'Acne' },
      { key: 'pigmentation', label: 'Pigment' },
      { key: 'skinTone', label: 'Tone' },
      { key: 'pores', label: 'Pores' },
      { key: 'moisture', label: 'Moisture' },
      { key: 'oiliness', label: 'Oiliness' },
      { key: 'wrinkles', label: 'Wrinkles' },
    ],
    [],
  );

  const progressData = useMemo(() => {
    return timelineItems.map((item) => {
      const date = new Date(item.capturedAt);
      const value =
        selectedMetric === 'overall'
          ? getAverageScore(item.scores)
          : item.scores[selectedMetric as keyof AnalysisResult['scores']];

      return {
        label: date.toLocaleDateString(),
        shortLabel: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        value,
      };
    });
  }, [selectedMetric, timelineItems]);

  const progressSummary = useMemo(() => {
    if (progressData.length === 0) {
      return {
        latestValue: null,
        deltaValue: null,
        percentChange: null,
        elapsedLabel: null,
        deltaLabel:
          'Complete more analyses to unlock your long-term skin progress view.',
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
        ? formatElapsedTime(firstItem.capturedAt, latestItem.capturedAt)
        : null;

    return {
      latestValue: latest,
      deltaValue,
      percentChange,
      elapsedLabel,
      deltaLabel:
        deltaValue === null
          ? 'Complete more analyses to unlock your long-term skin progress view.'
          : deltaValue > 0
            ? 'Your scores are moving in the right direction. This is the proof users come back to.'
            : deltaValue < 0
              ? 'This metric dipped. That makes the next routine adjustment and follow-up scan more valuable.'
              : 'This metric is flat right now. Keep tracking to see whether your routine starts shifting it.',
    };
  }, [progressData, timelineItems]);

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
              eyebrow="History"
              title="Your skin timeline."
              body="See your skin move over time. This should become the clearest proof that your routine and subscription are working."
            />

            {!loading && !error ? (
              <ProgressChartCard
                title="Progress over time"
                description="Track one metric at a time and make improvement visible. This is the strongest retention surface in the app."
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
                    Retention signal
                  </Text>
                  <Text className="font-sans text-base leading-7 text-mist">
                    {progressSummary.percentChange !== null &&
                    progressSummary.percentChange > 0 &&
                    progressSummary.elapsedLabel
                      ? `Your ${selectedMetric === 'overall' ? 'overall skin score' : metricOptions.find((option) => option.key === selectedMetric)?.label?.toLowerCase() ?? 'selected metric'} improved by ${progressSummary.percentChange}% in ${progressSummary.elapsedLabel}. This is the kind of visible progress users stay subscribed to keep seeing.`
                      : progressSummary.percentChange !== null &&
                          progressSummary.percentChange < 0 &&
                          progressSummary.elapsedLabel
                        ? `Your ${selectedMetric === 'overall' ? 'overall skin score' : metricOptions.find((option) => option.key === selectedMetric)?.label?.toLowerCase() ?? 'selected metric'} decreased by ${Math.abs(progressSummary.percentChange)}% in ${progressSummary.elapsedLabel}. That makes the next routine adjustment and follow-up scan more important.`
                      : latestWeakConcern
                        ? `Your latest lowest area is still ${latestWeakConcern.label.toLowerCase()} at ${latestWeakConcern.score}. Keep scanning consistently so progress is visible and product recommendations stay targeted.`
                        : 'Keep scanning consistently so your long-term skin progress becomes obvious and motivating.'}
                  </Text>
                  {items.length > 1 ? (
                    <Button
                      label="Compare First vs Latest"
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
                    label="Try Again"
                    variant="secondary"
                    onPress={() => void loadHistory()}
                  />
                </View>
              ) : items.length === 0 ? (
                <Text className="font-sans text-base leading-7 text-mist">
                  Your completed analyses will appear here after your first successful upload.
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
                            {new Date(item.capturedAt).toLocaleString()}
                          </Text>
                          <Text className="mt-1 font-sans text-sm text-mist">
                            {`Average ${getAverageScore(item.scores)} · Grade ${getOverallGrade(item.scores)}`}
                          </Text>
                        </View>
                        <View className="rounded-pill bg-charcoal px-3 py-2">
                          <Text className="font-medium text-xs uppercase tracking-[1.4px] text-white">
                            View Report
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
