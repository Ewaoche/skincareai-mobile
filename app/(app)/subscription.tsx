import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getSubscriptionApiErrorMessage,
} from '@/lib/api/subscriptions-api';
import { useI18n } from '@/lib/i18n';
import { AppLanguage, TranslationKey } from '@/lib/i18n/types';
import { useSubscriptionStore } from '@/stores/subscription-store';

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
    case 'CANCELLED':
      return input.t('subscription.status.cancelled');
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

function formatDate(language: AppLanguage, date?: string | null): string | null {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString(language);
}

function buildSubscriptionMessage(input: {
  t: (key: TranslationKey, variables?: Record<string, string | number>) => string;
  language: AppLanguage;
  status?: string | null;
  reason?: string | null;
  renewsAt?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}): string | null {
  if (input.reason) {
    return input.reason;
  }

  if (input.cancelAtPeriodEnd) {
    const accessEndsAt = formatDate(
      input.language,
      input.currentPeriodEnd ?? input.renewsAt,
    );
    if (accessEndsAt) {
      return input.t('subscription.message.cancelWithDate', { date: accessEndsAt });
    }

    return input.t('subscription.message.cancelNoDate');
  }

  if (input.status === 'PAST_DUE') {
    return input.t('subscription.message.pastDue');
  }

  if (input.status === 'INCOMPLETE') {
    return input.t('subscription.message.incomplete');
  }

  if (input.status === 'EXPIRED') {
    return input.t('subscription.message.expired');
  }

  return null;
}

function getStatusToneClassName(status?: string | null): string {
  if (status === 'PAST_DUE' || status === 'INCOMPLETE' || status === 'EXPIRED') {
    return 'font-sans text-sm leading-6 text-roseDeep';
  }

  return 'font-sans text-sm leading-6 text-mist';
}

export default function SubscriptionScreen() {
  const { language, t } = useI18n();
  const current = useSubscriptionStore((state) => state.current);
  const usage = useSubscriptionStore((state) => state.usage);
  const error = useSubscriptionStore((state) => state.error);
  const refresh = useSubscriptionStore((state) => state.refresh);
  const [startingCheckout, setStartingCheckout] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    refresh().catch(() => {
      // The screen already renders the store error state.
    });
  }, [refresh]);

  const isFreePlan = current?.plan === 'FREE';
  const isPremiumPlan = current?.plan === 'PREMIUM';
  const isPastDue = current?.status === 'PAST_DUE';
  const isIncomplete = current?.status === 'INCOMPLETE';
  const isExpired = current?.status === 'EXPIRED';
  const isActivePremium =
    isPremiumPlan &&
    !isPastDue &&
    !isIncomplete &&
    !isExpired;
  const isExhaustedPremium =
    isActivePremium && (usage?.remainingAnalyses ?? 1) <= 0;
  const canManageBilling = Boolean(current?.stripeCustomerId);
  const premiumPrice = useMemo(() => 'EUR 19.99 / month', []);
  const showCheckoutCta =
    isFreePlan || isPastDue || isIncomplete || isExpired;
  const statusToneClassName = getStatusToneClassName(current?.status);
  const subscriptionMessage = buildSubscriptionMessage({
    t,
    language,
    status: current?.status,
    reason: usage?.reason ?? null,
    renewsAt: current?.renewsAt ?? null,
    currentPeriodEnd: current?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: current?.cancelAtPeriodEnd,
  });
  const renewalDate = formatDate(language, current?.renewsAt);
  const periodEndDate = formatDate(language, current?.currentPeriodEnd);

  const handleUpgrade = async () => {
    try {
      setStartingCheckout(true);
      const session = await createCheckoutSession({ plan: 'PREMIUM' });
      await Linking.openURL(session.checkoutUrl);
    } catch (checkoutError) {
      const message = getSubscriptionApiErrorMessage(checkoutError);
      Alert.alert(t('subscription.checkoutUnavailable'), message);
    } finally {
      setStartingCheckout(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setOpeningPortal(true);
      const portal = await createBillingPortalSession();
      await Linking.openURL(portal.url);
    } catch (portalError) {
      const message = getSubscriptionApiErrorMessage(portalError);
      Alert.alert(t('subscription.billingUnavailable'), message);
    } finally {
      setOpeningPortal(false);
    }
  };

  const checkoutButtonLabel = startingCheckout
    ? t('subscription.openingCheckout')
    : isPastDue
      ? t('subscription.retryPayment')
      : isIncomplete
        ? t('subscription.completeCheckout')
        : isExpired
          ? t('subscription.restorePremium')
          : t('subscription.upgradePremium');

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow={t('subscription.eyebrow')}
            title={t('subscription.title')}
            body={t('subscription.body')}
          />

          <GlassCard>
            <View className="gap-3">
              <Text className="font-medium text-sm uppercase tracking-[2px] text-roseDeep">
                {t('subscription.currentPlan')}
              </Text>
              {current && usage ? (
                <>
                  <Text className="font-bold text-2xl text-charcoal">
                    {current.plan}
                  </Text>
                  <Text className="font-sans text-base text-mist">
                    {t('subscription.remaining', { count: usage.remainingAnalyses })}
                  </Text>
                  <Text className={statusToneClassName}>
                    {t('subscription.statusLabel', {
                      status: formatSubscriptionStatus({
                        t,
                        status: current.status,
                        cancelAtPeriodEnd: current.cancelAtPeriodEnd,
                      }),
                    })}
                  </Text>
                  {renewalDate ? (
                    <Text className="font-sans text-sm leading-6 text-mist">
                      {t('subscription.renewalDate', { date: renewalDate })}
                    </Text>
                  ) : null}
                  {periodEndDate && current?.cancelAtPeriodEnd ? (
                    <Text className="font-sans text-sm leading-6 text-mist">
                      {t('subscription.accessEnds', { date: periodEndDate })}
                    </Text>
                  ) : null}
                  {subscriptionMessage ? (
                    <Text className={statusToneClassName}>
                      {subscriptionMessage}
                    </Text>
                  ) : null}
                </>
              ) : error ? (
                <Text className="font-sans text-sm text-roseDeep">{error}</Text>
              ) : (
                <ActivityIndicator color="#D96B8C" />
              )}
            </View>
          </GlassCard>

          <GlassCard>
            <View className="gap-4">
              <Text className="font-bold text-xl text-charcoal">
                {t('subscription.premiumTitle')}
              </Text>
              <Text className="font-sans text-base leading-7 text-mist">
                {t('subscription.premiumBody')}
              </Text>
              <Text className="font-bold text-lg text-charcoal">
                {premiumPrice}
              </Text>
              <View className="gap-2">
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.included')}
                </Text>
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.included.analysis')}
                </Text>
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.included.billing')}
                </Text>
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.included.updates')}
                </Text>
              </View>
              {showCheckoutCta ? (
                <Button
                  label={checkoutButtonLabel}
                  onPress={() => void handleUpgrade()}
                  disabled={startingCheckout}
                />
              ) : null}
              <Button
                label={openingPortal ? t('subscription.openingBilling') : t('subscription.manageBilling')}
                variant="secondary"
                onPress={() => void handleManageBilling()}
                disabled={openingPortal || !canManageBilling}
              />
              {isActivePremium && !isExhaustedPremium ? (
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.activeBody')}
                </Text>
              ) : null}
              {isExhaustedPremium ? (
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.exhaustedBody')}
                </Text>
              ) : null}
              {!canManageBilling ? (
                <Text className="font-sans text-sm leading-6 text-mist">
                  {t('subscription.noBillingBody')}
                </Text>
              ) : null}
            </View>
          </GlassCard>

          <Button
            label={t('subscription.backHome')}
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </GradientScreen>
  );
}
