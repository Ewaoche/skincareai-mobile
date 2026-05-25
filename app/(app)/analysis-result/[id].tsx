import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import {
  AnalysisResult,
  exportAnalysisPdf,
  getAnalysisById,
  getApiErrorMessage,
} from '@/lib/api/analysis-api';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function AnalysisResultScreen() {
  const layout = useResponsiveLayout();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const visualAnalysisOffsetRef = useRef(0);
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
  const [visualMode, setVisualMode] = useState<'original' | 'overlay' | 'blended'>(
    'blended',
  );
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const priorityConcerns = useMemo(
    () => (analysis ? getWeakestConcerns(analysis.scores) : []),
    [analysis],
  );
  const visibleConcernMasks = useMemo(() => {
    if (!analysis) {
      return [];
    }

    return analysis.concernMasks
      .filter((mask) => isDisplayableConcern(mask.concern))
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
  const activeVisualUri =
    selectedConcernMask?.urls[0] ?? analysis?.faceMapUrl ?? null;

  const handleSelectConcern = (concernKey: string) => {
    setSelectedConcernKey(concernKey);
    scrollViewRef.current?.scrollTo({
      y: Math.max(visualAnalysisOffsetRef.current + 24, 0),
      animated: true,
    });
  };

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

  const handleExportPdf = async () => {
    if (!analysis) {
      return;
    }

    try {
      setExportingPdf(true);
      setExportError(null);
      const result = await exportAnalysisPdf(analysis.analysisId);
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        throw new Error('PDF sharing is not available on this device.');
      }

      if (!result.pdf?.content) {
        throw new Error('The exported PDF file was empty.');
      }

      const fileUri = `${FileSystem.cacheDirectory}${result.pdf.fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, result.pdf.content, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: result.pdf.mimeType,
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Share Skin Analysis Report',
      });
    } catch (exportPdfError) {
      const message =
        exportPdfError instanceof Error
          ? getApiErrorMessage(exportPdfError)
          : 'We could not export this PDF right now.';
      setExportError(message);
      Alert.alert('PDF export unavailable', message);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <GradientScreen>
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow="Result"
            title="Your skin analysis"
            body="Review your main focus areas, score breakdown, and visual highlights from your latest analysis."
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
                <View
                  className="gap-4"
                  onLayout={(event) => {
                    visualAnalysisOffsetRef.current = event.nativeEvent.layout.y;
                  }}
                >
                  <Text className="font-bold text-lg text-charcoal">
                    Visual analysis
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {[
                      { key: 'original', label: 'Original' },
                      { key: 'overlay', label: 'Overlay' },
                      { key: 'blended', label: 'Blended' },
                    ].map((option) => {
                      const active = visualMode === option.key;
                      const disabled =
                        option.key !== 'original' && !activeVisualUri;

                      return (
                        <Pressable
                          key={option.key}
                          onPress={() => {
                            if (!disabled) {
                              setVisualMode(
                                option.key as 'original' | 'overlay' | 'blended',
                              );
                            }
                          }}
                          disabled={disabled}
                          className={`rounded-full px-4 py-3 ${
                            active
                              ? 'bg-roseDeep'
                              : disabled
                                ? 'bg-white/45'
                                : 'bg-white/70'
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold uppercase tracking-[1.4px] ${
                              active
                                ? 'text-white'
                                : disabled
                                  ? 'text-mist'
                                  : 'text-charcoal'
                            }`}
                          >
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View
                    className="overflow-hidden rounded-[24px] bg-[#f7f1ee]"
                    style={{
                      aspectRatio: 3 / 4,
                      maxHeight: layout.isTablet ? 520 : 420,
                    }}
                  >
                    {visualMode === 'overlay' && activeVisualUri ? (
                      <Image
                        source={{ uri: activeVisualUri }}
                        className="h-full w-full"
                        resizeMode="contain"
                        style={{ alignSelf: 'center' }}
                      />
                    ) : visualMode === 'blended' && activeVisualUri ? (
                      <ImageBackground
                        source={{ uri: analysis.selfieUrl }}
                        className="h-full w-full"
                        resizeMode="contain"
                        imageStyle={{
                          alignSelf: 'center',
                        }}
                      >
                        <Image
                          source={{ uri: activeVisualUri }}
                          className="h-full w-full"
                          resizeMode="contain"
                          style={{
                            opacity: 0.88,
                            alignSelf: 'center',
                          }}
                        />
                      </ImageBackground>
                    ) : (
                      <Image
                        source={{ uri: analysis.selfieUrl }}
                        className="h-full w-full"
                        resizeMode="contain"
                        style={{ alignSelf: 'center' }}
                      />
                    )}
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
                          'This overlay highlights the area connected to the selected concern.'}
                      </Text>
                      <Text className="font-sans text-xs leading-5 text-mist">
                        {visualMode === 'original'
                          ? 'Original shows your photo without any visual highlights.'
                          : visualMode === 'overlay'
                            ? 'Overlay shows the highlighted concern area on its own.'
                            : 'Blended combines your photo with the selected concern highlight.'}
                      </Text>
                    </View>
                  ) : (
                    <Text className="font-sans text-sm leading-6 text-mist">
                      Visual concern highlights are not available for this result, so your original photo is shown instead.
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
                    Available overlays
                  </Text>
                  {visibleConcernMasks.length > 0 ? (
                    <View className="gap-3">
                      <Text className="font-sans text-sm leading-6 text-mist">
                        Tap a concern to update the main visual above and focus on that area.
                      </Text>
                      <View className="flex-row flex-wrap gap-3">
                        {visibleConcernMasks.map((mask) => {
                          const active = mask.concern === selectedConcernMask?.concern;

                          return (
                            <Pressable
                              key={`${analysis.analysisId}-${mask.concern}-chip`}
                              onPress={() => handleSelectConcern(mask.concern)}
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
                    </View>
                  ) : (
                    <Text className="font-sans text-base leading-7 text-mist">
                      Visual highlights are not available for this analysis.
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

function isDisplayableConcern(value: string): boolean {
  return value !== 'resize_image';
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
    score === null ? 'This concern was highlighted in your analysis.' : `This area scored ${score}.`;

  switch (concern) {
    case 'acne':
      return `${scoreText} The highlighted area shows where breakout activity is most visible.`;
    case 'age_spot':
      return `${scoreText} The highlighted area shows where discoloration and uneven tone are most visible.`;
    case 'pore':
      return `${scoreText} The highlighted area shows where visible pores are more noticeable.`;
    case 'oiliness':
      return `${scoreText} The highlighted area shows where excess oil may be affecting skin balance and texture.`;
    case 'wrinkle':
      return `${scoreText} The highlighted area shows where fine lines and wrinkles are most visible.`;
    case 'moisture':
      return `${scoreText} The highlighted area shows where dryness or dehydration is most visible.`;
    case 'radiance':
      return `${scoreText} The highlighted area shows where tone and radiance look less even.`;
    default:
      return `${scoreText} This overlay shows the visual region linked to the selected concern.`;
  }
}
