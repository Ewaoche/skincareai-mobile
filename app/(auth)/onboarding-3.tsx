import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';

export default function OnboardingThree() {
  return (
    <GradientScreen>
      <View className="flex-1 justify-between px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="03"
            title="Personalized care, progress, and glow tracking."
            body="See your latest skin insights, follow recommendations, and track your improvement with a premium skincare-first interface."
          />
          <GlassCard>
            <Text className="font-sans text-base leading-7 text-mist">
              Once the backend recommendation layer is live, this flow will
              expand into richer product guidance and progress tracking.
            </Text>
          </GlassCard>
        </View>

        <Link href="/(auth)/login" asChild>
          <Button label="Continue to Login" />
        </Link>
      </View>
    </GradientScreen>
  );
}
