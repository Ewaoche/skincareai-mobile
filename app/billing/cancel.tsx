import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';

export default function BillingCancelScreen() {
  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-16 pt-10">
        <GlassCard>
          <View className="gap-5">
            <SectionHeading
              eyebrow="Purchase Not Completed"
              title="Your subscription was not started"
              body="Your current plan has not changed. You can come back and subscribe whenever you are ready."
            />
            <Text className="font-sans text-sm text-mist">
              No billing changes were made to your account.
            </Text>
            <Button
              label="Return to Subscription"
              onPress={() =>
                router.replace({
                  pathname: '/subscription' as never,
                })
              }
            />
            <Button
              label="Go Home"
              variant="secondary"
              onPress={() => router.replace('/(app)/(tabs)/home')}
            />
          </View>
        </GlassCard>
      </View>
    </GradientScreen>
  );
}
