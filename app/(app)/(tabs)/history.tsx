import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AnalysisScoreGrid } from '@/components/analysis/analysis-score-grid';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { useResponsiveLayout } from '@/components/ui/responsive';
import {
  getAverageScore,
  getOverallGrade,
} from '@/lib/analysis/score-insights';
import {
  AnalysisResult,
  getAnalysisHistory,
} from '@/lib/api/analysis-api';

export default function HistoryScreen() {
  const layout = useResponsiveLayout();
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              body="Review your recent analyses and reopen any completed score set from the live backend history endpoint."
            />

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
