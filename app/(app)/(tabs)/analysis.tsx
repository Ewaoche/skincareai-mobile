import { Text, View } from 'react-native';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionHeading } from '@/components/ui/section-heading';

export default function AnalysisScreen() {
  return (
    <GradientScreen>
      <View className="flex-1 gap-6 px-6 pt-6 pb-24">
        <SectionHeading
          eyebrow="Analysis"
          title="Camera capture and selfie flow."
          body="This tab is reserved for the guided premium camera experience, preview, and upload flow."
        />

        <GlassCard>
          <Text className="font-sans text-base leading-7 text-mist">
            Next implementation slice:
            camera permission states, face guide overlay, retake flow, and
            upload into `POST /api/analysis/start`.
          </Text>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}
