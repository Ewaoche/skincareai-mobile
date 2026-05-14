import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';

export default function OnboardingTwo() {
  return (
    <GradientScreen>
      <View className="flex-1 justify-between px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="02"
            title="Advanced AI scanning in seconds."
            body="Analyze acne, pores, wrinkles, oiliness, pigmentation, and more with a guided camera flow built for confidence."
          />
          <GlassCard>
            <Text className="font-sans text-base leading-7 text-mist">
              The experience is designed to feel cinematic, warm, and
              reassuring rather than cold or medical.
            </Text>
          </GlassCard>
        </View>

        <Link href="/(auth)/onboarding-3" asChild>
          <Button label="Next" />
        </Link>
      </View>
    </GradientScreen>
  );
}
