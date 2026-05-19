import { Text, View } from 'react-native';
import { AnalysisScores } from '@/lib/api/analysis-api';
import { useResponsiveLayout } from '@/components/ui/responsive';

const scoreLabels: Array<{
  key: keyof AnalysisScores;
  label: string;
}> = [
  { key: 'acne', label: 'Acne' },
  { key: 'pigmentation', label: 'Pigmentation' },
  { key: 'skinTone', label: 'Skin Tone' },
  { key: 'pores', label: 'Pores' },
  { key: 'moisture', label: 'Moisture' },
  { key: 'oiliness', label: 'Oiliness' },
  { key: 'wrinkles', label: 'Wrinkles' },
];

type AnalysisScoreGridProps = {
  scores: AnalysisScores;
};

export function AnalysisScoreGrid({ scores }: AnalysisScoreGridProps) {
  const layout = useResponsiveLayout();
  const cardBasis = layout.isLargeTablet ? '31%' : layout.isTablet ? '48%' : '47%';

  return (
    <View className="flex-row flex-wrap gap-3">
      {scoreLabels.map((score) => (
        <View
          key={score.key}
          className="flex-1 border border-white/70 bg-white/70"
          style={{
            minWidth: cardBasis,
            borderRadius: layout.isTablet ? 26 : 24,
            paddingHorizontal: layout.isTablet ? 18 : 16,
            paddingVertical: layout.isTablet ? 18 : 16,
          }}
        >
          <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
            {score.label}
          </Text>
          <Text
            className="mt-2 font-extra text-charcoal"
            style={{
              fontSize: layout.isTablet ? 32 : 28,
              lineHeight: layout.isTablet ? 36 : 32,
            }}
          >
            {scores[score.key]}
          </Text>
        </View>
      ))}
    </View>
  );
}
