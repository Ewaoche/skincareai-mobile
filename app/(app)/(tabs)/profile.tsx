import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscriptionStore } from '@/stores/subscription-store';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const clearSubscription = useSubscriptionStore((state) => state.clear);

  const initials = useMemo(() => {
    if (!user?.email) {
      return 'S';
    }

    return user.email.slice(0, 1).toUpperCase();
  }, [user?.email]);

  return (
    <GradientScreen>
      <View className="flex-1 gap-6 px-6 pt-6 pb-24">
        <SectionHeading
          eyebrow="Profile"
          title="Your account and preferences."
          body="This profile foundation is connected to the live auth session and is ready to expand into account settings."
        />

        <GlassCard>
          <View className="gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-pill bg-blush">
              <Text className="font-bold text-lg text-white">{initials}</Text>
            </View>
            <Text className="font-bold text-lg text-charcoal">{user?.email}</Text>
            <Text className="font-sans text-base text-mist">
              Role: {user?.role ?? 'Unknown'}
            </Text>
          </View>
        </GlassCard>

        <Button
          label="Log Out"
          variant="secondary"
          onPress={() => {
            clearSubscription();
            void signOut();
          }}
        />
      </View>
    </GradientScreen>
  );
}
