import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';

export default function WelcomeScreen() {
  return (
    <GradientScreen>
      <View className="flex-1 px-6 pt-6 pb-8">
        <View className="flex-1 justify-between">
          <View className="gap-10 pt-8">
            <SectionHeading
              eyebrow="SkincareAI"
              title="Understand your skin like never before."
              body="Premium AI skin analysis, personalized skincare guidance, and a calmer routine built around your real skin profile."
            />

            <GlassCard>
              <View className="gap-4">
                <Text className="font-bold text-lg text-charcoal">
                  Advanced AI skin scanning
                </Text>
                <Text className="font-sans text-base leading-7 text-mist">
                  Detect acne, pores, wrinkles, oiliness, pigmentation, and more
                  in seconds with a luxurious guided experience.
                </Text>
              </View>
            </GlassCard>
          </View>

          <View className="gap-4">
            <Link href="/(auth)/onboarding-1" asChild>
              <Button label="Begin Your Glow Journey" />
            </Link>
            <Link href="/(auth)/login" asChild>
              <Button label="I already have an account" variant="secondary" />
            </Link>
          </View>
        </View>
      </View>
    </GradientScreen>
  );
}
