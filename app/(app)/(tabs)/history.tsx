import { Text, View } from 'react-native';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionHeading } from '@/components/ui/section-heading';

export default function HistoryScreen() {
  return (
    <GradientScreen>
      <View className="flex-1 gap-6 px-6 pt-6 pb-24">
        <SectionHeading
          eyebrow="History"
          title="Your skin timeline."
          body="Analysis history will connect to the backend history endpoint and expand into compare views once live results are confirmed."
        />

        <GlassCard>
          <Text className="font-sans text-base leading-7 text-mist">
            Current backend endpoint available:
            `GET /api/analysis/history`.
          </Text>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}
