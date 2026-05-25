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
import { useSubscriptionStore } from '@/stores/subscription-store';

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
    case 'CANCELLED':
      return 'Cancels at period end';
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

function formatDate(date?: string | null): string | null {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString();
}

function buildSubscriptionMessage(input: {
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
    const accessEndsAt = formatDate(input.currentPeriodEnd ?? input.renewsAt);
    if (accessEndsAt) {
      return `Your subscription will end on ${accessEndsAt}. You will continue to have access until then. No further renewal will be charged.`;
    }

    return 'Your subscription is scheduled to end at the close of the current billing period. You will continue to have access until then. No further renewal will be charged.';
  }

  if (input.status === 'PAST_DUE') {
    return 'We could not process your latest payment. Update your billing details to keep Premium access active.';
  }

  if (input.status === 'INCOMPLETE') {
    return 'Your subscription setup is not complete yet. Continue to billing to finish setting up Premium.';
  }

  if (input.status === 'EXPIRED') {
    return 'Your Premium access has ended. Start a new subscription to continue using Premium features.';
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
    status: current?.status,
    reason: usage?.reason ?? null,
    renewsAt: current?.renewsAt ?? null,
    currentPeriodEnd: current?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: current?.cancelAtPeriodEnd,
  });
  const renewalDate = formatDate(current?.renewsAt);
  const periodEndDate = formatDate(current?.currentPeriodEnd);

  const handleUpgrade = async () => {
    try {
      setStartingCheckout(true);
      const session = await createCheckoutSession({ plan: 'PREMIUM' });
      await Linking.openURL(session.checkoutUrl);
    } catch (checkoutError) {
      const message = getSubscriptionApiErrorMessage(checkoutError);
      Alert.alert('Checkout unavailable', message);
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
      Alert.alert('Billing unavailable', message);
    } finally {
      setOpeningPortal(false);
    }
  };

  const checkoutButtonLabel = startingCheckout
    ? 'Opening Checkout...'
    : isPastDue
      ? 'Retry Payment'
      : isIncomplete
        ? 'Complete Checkout'
        : isExpired
          ? 'Restore Premium'
          : 'Upgrade to Premium';

  return (
    <GradientScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-6 px-6 pt-6">
          <SectionHeading
            eyebrow="Subscription"
            title="Manage your plan"
            body="Review your plan, billing, and access in one place."
          />

          <GlassCard>
            <View className="gap-3">
              <Text className="font-medium text-sm uppercase tracking-[2px] text-roseDeep">
                Current Plan
              </Text>
              {current && usage ? (
                <>
                  <Text className="font-bold text-2xl text-charcoal">
                    {current.plan}
                  </Text>
                  <Text className="font-sans text-base text-mist">
                    {usage.remainingAnalyses} analyses remaining
                  </Text>
                  <Text className={statusToneClassName}>
                    Status: {formatSubscriptionStatus({
                      status: current.status,
                      cancelAtPeriodEnd: current.cancelAtPeriodEnd,
                    })}
                  </Text>
                  {renewalDate ? (
                    <Text className="font-sans text-sm leading-6 text-mist">
                      Renewal date: {renewalDate}
                    </Text>
                  ) : null}
                  {periodEndDate && current?.cancelAtPeriodEnd ? (
                    <Text className="font-sans text-sm leading-6 text-mist">
                      Access ends: {periodEndDate}
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
                Premium consumer plan
              </Text>
              <Text className="font-sans text-base leading-7 text-mist">
                Premium gives you up to 4 analyses each month, with secure billing and easy subscription management.
              </Text>
              <Text className="font-bold text-lg text-charcoal">
                {premiumPrice}
              </Text>
              <View className="gap-2">
                <Text className="font-sans text-sm leading-6 text-mist">
                  Included:
                </Text>
                <Text className="font-sans text-sm leading-6 text-mist">
                  - 4 analyses per month
                </Text>
                <Text className="font-sans text-sm leading-6 text-mist">
                  - secure billing management
                </Text>
                <Text className="font-sans text-sm leading-6 text-mist">
                  - simple subscription updates in the app
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
                label={openingPortal ? 'Opening Billing...' : 'Manage Billing'}
                variant="secondary"
                onPress={() => void handleManageBilling()}
                disabled={openingPortal || !canManageBilling}
              />
              {isActivePremium && !isExhaustedPremium ? (
                <Text className="font-sans text-sm leading-6 text-mist">
                  Your Premium plan is active. You can update your payment method or manage cancellation at any time.
                </Text>
              ) : null}
              {isExhaustedPremium ? (
                <Text className="font-sans text-sm leading-6 text-mist">
                  You have used all analyses included in your current billing period. More analyses will be available on your renewal date.
                </Text>
              ) : null}
              {!canManageBilling ? (
                <Text className="font-sans text-sm leading-6 text-mist">
                  Billing management will be available after your first successful subscription purchase.
                </Text>
              ) : null}
            </View>
          </GlassCard>

          <Button
            label="Back to Home"
            variant="ghost"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </GradientScreen>
  );
}
