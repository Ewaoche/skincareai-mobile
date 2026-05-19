import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AnalysisScoreGrid } from '@/components/analysis/analysis-score-grid';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
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
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
  const current = useAnalysisStore((state) => state.current);
  const setCurrent = useAnalysisStore((state) => state.setCurrent);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    current && current.analysisId === analysisId ? current : null,
  );
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState<string | null>(null);
  const visibleConcernMasks = analysis?.concernMasks.slice(0, 4) ?? [];

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
            body="Review the uploaded selfie, returned score set, and any provider-generated visual artifacts from the backend."
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
                    Uploaded selfie
                  </Text>
                  <Image
                    source={{ uri: analysis.selfieUrl }}
                    className="h-[320px] w-full rounded-[24px]"
                    resizeMode="cover"
                  />
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
                  {getWeakestConcerns(analysis.scores).map((concern) => (
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
                    Provider overlays
                  </Text>
                  {analysis.faceMapUrl ? (
                    <View className="gap-3">
                      <Image
                        source={{ uri: analysis.faceMapUrl }}
                        className="h-[320px] w-full rounded-[24px]"
                        resizeMode="cover"
                      />
                      <Text className="font-sans text-sm leading-6 text-mist">
                        This primary overlay comes from the live Perfect Corp response. Additional concern-specific masks are listed below when available.
                      </Text>
                    </View>
                  ) : (
                    <Text className="font-sans text-base leading-7 text-mist">
                      The provider did not return a single combined face map for this analysis, but concern-specific overlays may still be available below.
                    </Text>
                  )}

                  {visibleConcernMasks.length > 0 ? (
                    <View className="gap-3">
                      {visibleConcernMasks.map((mask) => (
                        <View
                          key={`${analysis.analysisId}-${mask.concern}`}
                          className="gap-3 rounded-[22px] bg-white/70 p-3"
                        >
                          <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                            {mask.concern.replace(/_/g, ' ')}
                          </Text>
                          <Image
                            source={{ uri: mask.urls[0] }}
                            className="h-[180px] w-full rounded-[20px]"
                            resizeMode="cover"
                          />
                        </View>
                      ))}
                    </View>
                  ) : null}
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
