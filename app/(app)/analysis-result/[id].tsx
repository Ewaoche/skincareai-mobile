import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AnalysisScoreGrid } from '@/components/analysis/analysis-score-grid';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { useResponsiveLayout } from '@/components/ui/responsive';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  getAverageScore,
  getOverallGrade,
  getScoreNarrative,
  getWeakestConcerns,
} from '@/lib/analysis/score-insights';
import { AnalysisResult, getAnalysisById } from '@/lib/api/analysis-api';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function AnalysisResultScreen() {
  const layout = useResponsiveLayout();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
  const current = useAnalysisStore((state) => state.current);
  const setCurrent = useAnalysisStore((state) => state.setCurrent);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    current && current.analysisId === analysisId ? current : null,
  );
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcernKey, setSelectedConcernKey] = useState<string | null>(
    null,
  );

  const priorityConcerns = useMemo(
    () => (analysis ? getWeakestConcerns(analysis.scores) : []),
    [analysis],
  );
  const visibleConcernMasks = useMemo(() => {
    if (!analysis) {
      return [];
    }

    return analysis.concernMasks
      .filter((mask) => mask.urls.length > 0)
      .sort((left, right) => {
        const leftPriority = priorityConcerns.findIndex(
          (concern) => concern.key === left.concern,
        );
        const rightPriority = priorityConcerns.findIndex(
          (concern) => concern.key === right.concern,
        );

        const leftOrder = leftPriority === -1 ? 999 : leftPriority;
        const rightOrder = rightPriority === -1 ? 999 : rightPriority;

        return leftOrder - rightOrder;
      });
  }, [analysis, priorityConcerns]);
  const selectedConcernMask = useMemo(() => {
    if (visibleConcernMasks.length === 0) {
      return null;
    }

    if (selectedConcernKey) {
      return (
        visibleConcernMasks.find((mask) => mask.concern === selectedConcernKey) ??
        visibleConcernMasks[0]
      );
    }

    return visibleConcernMasks[0];
  }, [selectedConcernKey, visibleConcernMasks]);
  const selectedConcernScore = selectedConcernMask
    ? getConcernScore(
        analysis?.scores ?? null,
        selectedConcernMask.concern,
      )
    : null;
  const selectedConcernInsight = selectedConcernMask
    ? buildConcernInsight(selectedConcernMask.concern, selectedConcernScore)
    : null;

  useEffect(() => {
    if (!analysisId) {
      setError('The analysis identifier is missing.');
      setLoading(false);
      return;
    }

    if (analysis && analysis.analysisId === analysisId) {
      return;
    }

    const loadAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getAnalysisById(analysisId);
        setAnalysis(result);
        setCurrent(result);
      } catch {
        setError('We could not load this analysis result right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadAnalysis();
  }, [analysis, analysisId, setCurrent]);

  useEffect(() => {
    if (!analysis) {
      setSelectedConcernKey(null);
      return;
    }

    const firstPriorityWithMask = getWeakestConcerns(analysis.scores).find(
      (concern) =>
        analysis.concernMasks.some(
          (mask) => mask.concern === concern.key && mask.urls.length > 0,
        ),
    );

    setSelectedConcernKey(
      firstPriorityWithMask?.key ?? analysis.concernMasks[0]?.concern ?? null,
    );
  }, [analysis]);

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow="Result"
            title="Your live skin analysis."
            body="Review your main concern overlay, score breakdown, and the provider-generated visual evidence behind your recommendations."
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
                  label="Back to Analysis"
                  variant="secondary"
                  onPress={() => router.replace('/(app)/(tabs)/analysis')}
                />
              </View>
            </GlassCard>
          ) : analysis ? (
            <>
              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    Overview
                  </Text>
                  <View className="flex-row items-end justify-between gap-4">
                    <View className="rounded-[24px] bg-white/70 px-5 py-4">
                      <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                        Overall Grade
                      </Text>
                      <Text className="mt-2 font-extra text-[40px] leading-[42px] text-charcoal">
                        {getOverallGrade(analysis.scores)}
                      </Text>
                    </View>
                    <View className="flex-1 rounded-[24px] bg-white/70 px-5 py-4">
                      <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                        Average Score
                      </Text>
                      <Text className="mt-2 font-extra text-[32px] leading-[36px] text-charcoal">
                        {getAverageScore(analysis.scores)}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-sans text-base leading-7 text-mist">
                    {getScoreNarrative(analysis.scores)}
                  </Text>
                </View>
              </GlassCard>

              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    Visual analysis
                  </Text>
                  <View
                    className="overflow-hidden rounded-[24px] bg-[#f7f1ee]"
                    style={{
                      aspectRatio: 3 / 4,
                      maxHeight: layout.isTablet ? 520 : 420,
                    }}
                  >
                    <ImageBackground
                      source={{ uri: analysis.selfieUrl }}
                      className="h-full w-full"
                      resizeMode="contain"
                      imageStyle={{
                        alignSelf: 'center',
                      }}
                    >
                      {selectedConcernMask?.urls[0] || analysis.faceMapUrl ? (
                        <Image
                          source={{
                            uri:
                              selectedConcernMask?.urls[0] ??
                              analysis.faceMapUrl ??
                              analysis.selfieUrl,
                          }}
                          className="h-full w-full"
                          resizeMode="contain"
                          style={{
                            opacity: 0.88,
                            alignSelf: 'center',
                          }}
                        />
                      ) : null}
                    </ImageBackground>
                  </View>
                  {selectedConcernMask ? (
                    <View className="gap-3 rounded-[22px] bg-white/70 px-4 py-4">
                      <View className="flex-row items-center justify-between gap-3">
                        <View>
                          <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                            Primary visible concern
                          </Text>
                          <Text className="mt-1 font-bold text-lg text-charcoal">
                            {formatConcernName(selectedConcernMask.concern)}
                          </Text>
                        </View>
                        {selectedConcernScore !== null ? (
                          <Text className="font-extra text-[28px] leading-[30px] text-roseDeep">
                            {selectedConcernScore}
                          </Text>
                        ) : null}
                      </View>
                      <Text className="font-sans text-sm leading-6 text-mist">
                        {selectedConcernInsight ??
                          'This overlay highlights where the provider detected the selected skin concern on your face.'}
                      </Text>
                    </View>
                  ) : (
                    <Text className="font-sans text-sm leading-6 text-mist">
                      The provider did not return concern overlays for this analysis, so the original selfie is shown as fallback.
                    </Text>
                  )}
                  <Text className="font-sans text-sm text-mist">
                    Captured {new Date(analysis.capturedAt).toLocaleString()}
                  </Text>
                </View>
              </GlassCard>

              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    Skin scores
                  </Text>
                  <AnalysisScoreGrid scores={analysis.scores} />
                </View>
              </GlassCard>

              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    Priority concerns
                  </Text>
                  {priorityConcerns.map((concern) => (
                    <View
                      key={concern.key}
                      className="flex-row items-center justify-between rounded-[20px] bg-white/70 px-4 py-4"
                    >
                      <Text className="font-medium text-base text-charcoal">
                        {concern.label}
                      </Text>
                      <Text className="font-extra text-[22px] leading-[26px] text-roseDeep">
                        {concern.score}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>

              <GlassCard>
                <View className="gap-4">
                  <Text className="font-bold text-lg text-charcoal">
                    Concern overlays
                  </Text>
                  {visibleConcernMasks.length > 0 ? (
                    <View className="gap-3">
                      <Text className="font-sans text-sm leading-6 text-mist">
                        Tap a concern to switch the highlighted overlay above. This gives users a clearer view of the specific issue areas detected by the analysis provider.
                      </Text>
                      <View className="flex-row flex-wrap gap-3">
                        {visibleConcernMasks.map((mask) => {
                          const active = mask.concern === selectedConcernMask?.concern;

                          return (
                            <Pressable
                              key={`${analysis.analysisId}-${mask.concern}-chip`}
                              onPress={() => setSelectedConcernKey(mask.concern)}
                              className={`rounded-full px-4 py-3 ${
                                active ? 'bg-roseDeep' : 'bg-white/70'
                              }`}
                            >
                              <Text
                                className={`text-xs font-semibold uppercase tracking-[1.4px] ${
                                  active ? 'text-white' : 'text-charcoal'
                                }`}
                              >
                                {formatConcernName(mask.concern)}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>

                      {visibleConcernMasks.map((mask) => (
                        <Pressable
                          key={`${analysis.analysisId}-${mask.concern}`}
                          onPress={() => setSelectedConcernKey(mask.concern)}
                          className={`gap-3 rounded-[22px] p-3 ${
                            mask.concern === selectedConcernMask?.concern
                              ? 'bg-[#ffe6ec]'
                              : 'bg-white/70'
                          }`}
                        >
                          <View className="flex-row items-center justify-between gap-3">
                            <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                              {formatConcernName(mask.concern)}
                            </Text>
                            {mask.concern === selectedConcernMask?.concern ? (
                              <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                                Active
                              </Text>
                            ) : null}
                          </View>
                          <View
                            className="overflow-hidden rounded-[20px] bg-[#f7f1ee]"
                            style={{ height: 180 }}
                          >
                            <Image
                              source={{ uri: analysis.selfieUrl }}
                              className="absolute inset-0 h-full w-full"
                              resizeMode="contain"
                            />
                            <Image
                              source={{ uri: mask.urls[0] }}
                              className="h-full w-full"
                              resizeMode="contain"
                              style={{ opacity: 0.88 }}
                            />
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text className="font-sans text-base leading-7 text-mist">
                      The provider did not return concern-specific overlays for this analysis.
                    </Text>
                  )}
                </View>
              </GlassCard>

              <View className="gap-3 pb-6">
                <Button
                  label="View Recommendations"
                  onPress={() =>
                    router.push({
                      pathname: '/analysis-recommendations/[id]' as never,
                      params: { id: analysis.analysisId } as never,
                    })
                  }
                />
                <Button
                  label="Run Another Analysis"
                  variant="secondary"
                  onPress={() => router.replace('/(app)/(tabs)/analysis')}
                />
                <Button
                  label="Open History"
                  variant="ghost"
                  onPress={() => router.push('/(app)/(tabs)/history')}
                />
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </GradientScreen>
  );
}

function formatConcernName(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getConcernScore(
  scores: AnalysisResult['scores'] | null,
  concern: string,
): number | null {
  if (!scores) {
    return null;
  }

  const concernMap: Record<string, keyof AnalysisResult['scores']> = {
    acne: 'acne',
    age_spot: 'pigmentation',
    radiance: 'skinTone',
    pore: 'pores',
    moisture: 'moisture',
    oiliness: 'oiliness',
    wrinkle: 'wrinkles',
  };

  const mappedKey = concernMap[concern];
  return mappedKey ? scores[mappedKey] : null;
}

function buildConcernInsight(concern: string, score: number | null): string {
  const scoreText =
    score === null ? 'This concern was detected in the returned overlay.' : `This area scored ${score}.`;

  switch (concern) {
    case 'acne':
      return `${scoreText} The highlighted overlay shows where breakout-related activity was detected, helping the user connect the score to visible acne zones.`;
    case 'age_spot':
      return `${scoreText} The overlay marks pigmentation and uneven tone areas so the user can see where discoloration support is needed most.`;
    case 'pore':
      return `${scoreText} The overlay highlights visible pore concentration areas, which supports the pore score with a concrete facial map.`;
    case 'oiliness':
      return `${scoreText} The overlay helps the user understand where excess oil is most likely affecting skin balance and texture.`;
    case 'wrinkle':
      return `${scoreText} The overlay highlights the regions contributing most to the wrinkle score, making the result easier to trust.`;
    case 'moisture':
      return `${scoreText} The overlay helps illustrate where dehydration-related texture or dryness signals are strongest.`;
    case 'radiance':
      return `${scoreText} The overlay points to tone and radiance variation so the user can see where brightness support is most relevant.`;
    default:
      return `${scoreText} This overlay shows the visual region linked to the selected concern.`;
  }
}
