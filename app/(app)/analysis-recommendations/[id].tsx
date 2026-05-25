import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  AnalysisRecommendationItem,
  getAnalysisRecommendations,
} from '@/lib/api/analysis-api';

export default function AnalysisRecommendationsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [items, setItems] = useState<AnalysisRecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) {
      setError('The analysis identifier is missing.');
      setLoading(false);
      return;
    }

    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAnalysisRecommendations(analysisId);
        setItems(response.items);
      } catch {
        setError('We could not load recommendations for this analysis right now.');
      } finally {
        setLoading(false);
      }
    };

    void loadRecommendations();
  }, [analysisId]);

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow="Recommendations"
            title="Products matched to your results"
            body="These recommendations are selected to support the areas highlighted in your latest analysis."
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
                  label="Back to Result"
                  variant="secondary"
                  onPress={() => router.back()}
                />
              </View>
            </GlassCard>
          ) : items.length === 0 ? (
            <GlassCard>
              <Text className="font-sans text-base leading-7 text-mist">
                We do not have matching product recommendations for this result yet. Please check back again after your next analysis.
              </Text>
            </GlassCard>
          ) : (
            items.map((item) => (
              <GlassCard key={item.recommendationId}>
                <View className="gap-4">
                  <View className="flex-row items-start justify-between gap-4">
                    <View className="flex-1 gap-1">
                      <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                        {`Rank ${item.rank} - ${item.targetConcern}`}
                      </Text>
                      <Text className="font-bold text-xl text-charcoal">
                        {item.name}
                      </Text>
                      <Text className="font-sans text-sm text-mist">
                        {item.brand}
                      </Text>
                    </View>
                    {item.priceEur ? (
                      <Text className="font-extra text-lg text-charcoal">
                        {`€${item.priceEur}`}
                      </Text>
                    ) : null}
                  </View>

                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      className="h-[220px] w-full rounded-[24px]"
                      resizeMode="cover"
                    />
                  ) : null}

                  <View className="gap-2 rounded-[22px] bg-white/70 px-4 py-4">
                    <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                      Why it was selected
                    </Text>
                    <Text className="font-sans text-base leading-7 text-mist">
                      {item.reasoningSummary}
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap items-center gap-2">
                    {item.category ? (
                      <View className="rounded-pill bg-white/70 px-3 py-2">
                        <Text className="font-medium text-xs text-charcoal">
                          {item.category}
                        </Text>
                      </View>
                    ) : null}
                    <View className="rounded-pill bg-white/70 px-3 py-2">
                      <Text className="font-medium text-xs text-charcoal">
                        {item.source}
                      </Text>
                    </View>
                  </View>

                  <Button
                    label="Buy Now"
                    onPress={() => {
                      void Linking.openURL(item.buyUrl);
                    }}
                  />
                </View>
              </GlassCard>
            ))
          )}
        </View>
      </ScrollView>
    </GradientScreen>
  );
}
