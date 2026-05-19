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
              eyebrow="Billing Cancelled"
              title="Checkout was not completed."
              body="Your current plan is unchanged. You can review premium access again when you are ready."
            />
            <Text className="font-sans text-sm text-mist">
              No entitlement changes were applied from this cancelled checkout flow.
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
