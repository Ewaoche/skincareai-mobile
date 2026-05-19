import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAnalysisStore } from '@/stores/analysis-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { ResponsiveScrollScreen, useResponsiveLayout } from '@/components/ui/responsive';

export default function ProfileScreen() {
  const layout = useResponsiveLayout();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const clearSubscription = useSubscriptionStore((state) => state.clear);
  const clearAnalysis = useAnalysisStore((state) => state.clear);

  const initials = useMemo(() => {
    if (!user?.email) {
      return 'S';
    }

    return user.email.slice(0, 1).toUpperCase();
  }, [user?.email]);

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow="Profile"
          title="Your account and preferences."
          body="This profile foundation is connected to the live auth session and is ready to expand into account settings."
        />

        <GlassCard>
          <View style={{ gap: 18 }}>
            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                alignItems: layout.isTablet ? 'center' : 'flex-start',
                gap: 18,
              }}
            >
              <View
                className="items-center justify-center rounded-pill bg-blush"
                style={{
                  height: layout.isTablet ? 84 : 56,
                  width: layout.isTablet ? 84 : 56,
                }}
              >
                <Text
                  className="font-bold text-white"
                  style={{ fontSize: layout.isTablet ? 28 : 18 }}
                >
                  {initials}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  className="font-bold text-charcoal"
                  style={{ fontSize: layout.isTablet ? 26 : 18 }}
                >
                  {user?.email}
                </Text>
                <Text className="font-sans text-base text-mist">
                  Role: {user?.role ?? 'Unknown'}
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                gap: 12,
              }}
            >
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  Membership
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  Active session
                </Text>
              </View>
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  Preferences
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  Beauty profile
                </Text>
              </View>
            </View>

            <Button
              label="Manage Subscription"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/subscription' as never,
                })
              }
            />
          </View>
        </GlassCard>

        <Button
          label="Log Out"
          variant="secondary"
          onPress={() => {
            clearAnalysis();
            clearSubscription();
            void signOut();
          }}
        />
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}
