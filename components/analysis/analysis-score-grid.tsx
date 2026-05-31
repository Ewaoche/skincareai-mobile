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
          className="flex-1 border border-white/70 bg-white/78"
          style={{
            minWidth: cardBasis,
            borderRadius: layout.isTablet ? 28 : 24,
            paddingHorizontal: layout.isTablet ? 18 : 16,
            paddingVertical: layout.isTablet ? 18 : 16,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View style={{ flex: 1, paddingRight: 10 }}>
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
            <View
              style={{
                height: layout.isTablet ? 42 : 38,
                width: layout.isTablet ? 42 : 38,
                borderRadius: 999,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(232,140,168,0.14)',
                borderWidth: 1,
                borderColor: 'rgba(217,107,140,0.16)',
              }}
            >
              <Text className="font-bold text-[11px] text-roseDeep">
                {getScoreBand(scores[score.key])}
              </Text>
            </View>
          </View>
          <View
            className="mt-4 overflow-hidden rounded-pill"
            style={{
              height: 7,
              backgroundColor: 'rgba(232,140,168,0.14)',
            }}
          >
            <View
              className="rounded-pill"
              style={{
                width: `${Math.max(6, Math.min(scores[score.key], 100))}%`,
                height: '100%',
                backgroundColor: getScoreColor(scores[score.key]),
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function getScoreBand(score: number): string {
  if (score >= 85) {
    return 'A';
  }
  if (score >= 70) {
    return 'B';
  }
  if (score >= 55) {
    return 'C';
  }
  if (score >= 40) {
    return 'D';
  }

  return 'E';
}

function getScoreColor(score: number): string {
  if (score >= 85) {
    return '#76C9A2';
  }
  if (score >= 70) {
    return '#E88CA8';
  }
  if (score >= 55) {
    return '#F2B278';
  }
  if (score >= 40) {
    return '#C9B6FF';
  }

  return '#D96B8C';
}
