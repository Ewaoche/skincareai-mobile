import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';

export default function OnboardingOne() {
  return (
    <GradientScreen>
      <View className="flex-1 justify-between px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="01"
            title="Your beauty journey, understood by AI."
            body="Start with elegant skin intelligence designed to feel calm, personal, and premium from the first scan."
          />
          <GlassCard>
            <Text className="font-sans text-base leading-7 text-mist">
              Expect soft guidance, beautiful visuals, and a flow that feels
              more like a luxury skincare ritual than a technical scan.
            </Text>
          </GlassCard>
        </View>

        <Link href="/(auth)/onboarding-2" asChild>
          <Button label="Next" />
        </Link>
      </View>
    </GradientScreen>
  );
}
