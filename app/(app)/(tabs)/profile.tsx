import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
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
  const currentSubscription = useSubscriptionStore((state) => state.current);
  const subscriptionUsage = useSubscriptionStore((state) => state.usage);
  const subscriptionError = useSubscriptionStore((state) => state.error);
  const refreshSubscription = useSubscriptionStore((state) => state.refresh);
  const clearSubscription = useSubscriptionStore((state) => state.clear);
  const clearAnalysis = useAnalysisStore((state) => state.clear);

  useEffect(() => {
    refreshSubscription().catch(() => {
      // The screen renders the subscription error state below.
    });
  }, [refreshSubscription]);

  const initials = useMemo(() => {
    const source =
      user?.firstName?.trim() ||
      user?.fullName?.trim() ||
      user?.email;

    if (!source) {
      return 'S';
    }

    return source.slice(0, 1).toUpperCase();
  }, [user?.email, user?.firstName, user?.fullName]);

  const displayName =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.email;

  const renewalLabel = formatDate(
    currentSubscription?.cancelAtPeriodEnd
      ? currentSubscription.currentPeriodEnd ?? currentSubscription.renewsAt
      : currentSubscription?.renewsAt,
  );
  const statusLabel = formatSubscriptionStatus({
    status: currentSubscription?.status,
    cancelAtPeriodEnd: currentSubscription?.cancelAtPeriodEnd,
  });

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow="Profile"
          title="Your profile"
          body="Manage your account, subscription, and personal details in one place."
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
                  {displayName ?? 'Your account'}
                </Text>
                <Text className="font-sans text-base text-mist">
                  Your signed-in account
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <View style={{ gap: 18 }}>
            <Text className="font-bold text-lg text-charcoal">
              Subscription
            </Text>
            {currentSubscription && subscriptionUsage ? (
              <View
                style={{
                  flexDirection: layout.isTablet ? 'row' : 'column',
                  gap: 12,
                }}
              >
                <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                  <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                    Current plan
                  </Text>
                  <Text className="mt-2 font-bold text-lg text-charcoal">
                    {currentSubscription.plan}
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                    {statusLabel}
                  </Text>
                </View>
                <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                  <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                    Usage
                  </Text>
                  <Text className="mt-2 font-bold text-lg text-charcoal">
                    {subscriptionUsage.remainingAnalyses} remaining
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                    {subscriptionUsage.analysesUsed} of {subscriptionUsage.analysesLimit} used
                  </Text>
                </View>
              </View>
            ) : subscriptionError ? (
              <Text className="font-sans text-sm text-roseDeep">
                {subscriptionError}
              </Text>
            ) : (
              <ActivityIndicator color="#D96B8C" />
            )}

            {renewalLabel ? (
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4">
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  {currentSubscription?.cancelAtPeriodEnd ? 'Access ends' : 'Renewal date'}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {renewalLabel}
                </Text>
                <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                  {currentSubscription?.cancelAtPeriodEnd
                    ? 'Your subscription will stay active until this date.'
                    : 'Your current plan renews on this date.'}
                </Text>
              </View>
            ) : null}

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

        <GlassCard>
          <View style={{ gap: 18 }}>
            <Text className="font-bold text-lg text-charcoal">
              Account
            </Text>
            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                gap: 12,
              }}
            >
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  Contact email
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {user?.email ?? 'Not available'}
                </Text>
              </View>
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  Security
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  Password access
                </Text>
              </View>
            </View>

            <Button
              label="Reset Password"
              variant="secondary"
              onPress={() => router.push('/(auth)/forgot-password')}
            />
            <Button
              label="View Analysis History"
              variant="ghost"
              onPress={() => router.push('/(app)/(tabs)/history')}
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

function formatDate(date?: string | null): string | null {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString();
}

function formatSubscriptionStatus(input: {
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
}): string {
  if (input.cancelAtPeriodEnd) {
    return 'Cancels at period end';
  }

  switch (input.status) {
    case 'ACTIVE':
      return 'Active';
    case 'TRIAL':
      return 'Trial';
    case 'PAST_DUE':
      return 'Payment past due';
    case 'INCOMPLETE':
      return 'Payment incomplete';
    case 'EXPIRED':
      return 'Expired';
    default:
      return input.status ?? 'Unknown';
  }
}
