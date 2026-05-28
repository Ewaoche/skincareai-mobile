import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAnalysisStore } from '@/stores/analysis-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { ResponsiveScrollScreen, useResponsiveLayout } from '@/components/ui/responsive';
import { useI18n } from '@/lib/i18n';
import { AppLanguage, TranslationKey } from '@/lib/i18n/types';

export default function ProfileScreen() {
  const layout = useResponsiveLayout();
  const { language, setLanguage, t } = useI18n();
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
    language,
    currentSubscription?.cancelAtPeriodEnd
      ? currentSubscription.currentPeriodEnd ?? currentSubscription.renewsAt
      : currentSubscription?.renewsAt,
  );
  const statusLabel = formatSubscriptionStatus({
    t,
    status: currentSubscription?.status,
    cancelAtPeriodEnd: currentSubscription?.cancelAtPeriodEnd,
  });
  const languageOptions = [
    {
      code: 'en' as const,
      label: t('profile.language.english'),
      shortLabel: 'EN',
    },
    {
      code: 'el' as const,
      label: t('profile.language.greek'),
      shortLabel: 'EL',
    },
  ];

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow={t('profile.eyebrow')}
          title={t('profile.title')}
          body={t('profile.body')}
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
                  {t('profile.account.signedIn')}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <View style={{ gap: 18 }}>
            <Text className="font-bold text-lg text-charcoal">
              {t('profile.subscription.title')}
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
                    {t('profile.subscription.currentPlan')}
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
                    {t('profile.subscription.usage')}
                  </Text>
                  <Text className="mt-2 font-bold text-lg text-charcoal">
                    {t('profile.subscription.remaining', {
                      count: subscriptionUsage.remainingAnalyses,
                    })}
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                    {t('profile.subscription.used', {
                      used: subscriptionUsage.analysesUsed,
                      limit: subscriptionUsage.analysesLimit,
                    })}
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
                  {currentSubscription?.cancelAtPeriodEnd
                    ? t('profile.subscription.accessEnds')
                    : t('profile.subscription.renewalDate')}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {renewalLabel}
                </Text>
                <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                  {currentSubscription?.cancelAtPeriodEnd
                    ? t('profile.subscription.accessEndsBody')
                    : t('profile.subscription.renewalBody')}
                </Text>
              </View>
            ) : null}

            <Button
              label={t('profile.subscription.manageButton')}
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
              {t('profile.account.title')}
            </Text>
            <View
              style={{
                flexDirection: layout.isTablet ? 'row' : 'column',
                gap: 12,
              }}
            >
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  {t('profile.account.contactEmail')}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {user?.email ?? t('profile.account.notAvailable')}
                </Text>
              </View>
              <View className="rounded-[24px] border border-white/70 bg-white/60 px-4 py-4" style={{ flex: 1 }}>
                <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                  {t('profile.account.security')}
                </Text>
                <Text className="mt-2 font-bold text-lg text-charcoal">
                  {t('profile.account.passwordAccess')}
                </Text>
              </View>
            </View>

            <Button
              label={t('profile.account.resetPassword')}
              variant="secondary"
              onPress={() => router.push('/(auth)/forgot-password')}
            />
            <Button
              label={t('profile.account.viewHistory')}
              variant="ghost"
              onPress={() => router.push('/(app)/(tabs)/history')}
            />
          </View>
        </GlassCard>

        <GlassCard>
          <View style={{ gap: 18 }}>
            <Text className="font-bold text-lg text-charcoal">
              {t('profile.language.title')}
            </Text>
            <Text className="font-sans text-sm leading-6 text-mist">
              {t('profile.language.body')}
            </Text>
            <LanguageToggle
              options={languageOptions}
              value={language}
              onChange={setLanguage}
            />
          </View>
        </GlassCard>

        <Button
          label={t('profile.actions.logout')}
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

function formatDate(language: AppLanguage, date?: string | null): string | null {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString(language);
}

function formatSubscriptionStatus(input: {
  t: (key: TranslationKey) => string;
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
}): string {
  if (input.cancelAtPeriodEnd) {
    return input.t('subscription.status.cancelAtPeriodEnd');
  }

  switch (input.status) {
    case 'ACTIVE':
      return input.t('subscription.status.active');
    case 'TRIAL':
      return input.t('subscription.status.trial');
    case 'PAST_DUE':
      return input.t('subscription.status.pastDue');
    case 'INCOMPLETE':
      return input.t('subscription.status.incomplete');
    case 'EXPIRED':
      return input.t('subscription.status.expired');
    default:
      return input.status ?? input.t('subscription.status.unknown');
  }
}
