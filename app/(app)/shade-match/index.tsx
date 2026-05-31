import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { ResponsiveScrollScreen, useResponsiveLayout } from '@/components/ui/responsive';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  getShadeApiErrorMessage,
  startShadeMatching,
} from '@/lib/api/shade-matching-api';
import { trackShadeAnalyticsEvent } from '@/lib/api/analytics-api';
import {
  validateShadeSelfieAsset,
  validateShadeSelfieWithFaceDetection,
} from '@/lib/shade/selfie-validation';
import { useSubscriptionStore } from '@/stores/subscription-store';

export default function ShadeMatchEntryScreen() {
  const layout = useResponsiveLayout();
  const current = useSubscriptionStore((state) => state.current);
  const usage = useSubscriptionStore((state) => state.usage);
  const subscriptionError = useSubscriptionStore((state) => state.error);
  const refreshSubscription = useSubscriptionStore((state) => state.refresh);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedValidation, setDetectedValidation] = useState<Awaited<
    ReturnType<typeof validateShadeSelfieWithFaceDetection>
  > | null>(null);
  const validation = useMemo(() => validateShadeSelfieAsset(asset), [asset]);
  const shadeBlocked = usage ? !usage.canStartShadeMatch : false;

  useEffect(() => {
    void refreshSubscription().catch(() => {
      // The screen renders the subscription error state below.
    });
  }, [refreshSubscription]);

  const handleQuotaBlocked = () => {
    const blockedReason =
      usage?.shadeReason ??
      'Your current plan cannot start another shade match right now.';
    void trackShadeAnalyticsEvent({
      eventType: 'SHADE_CAPTURE_BLOCKED',
      screen: 'SHADE_ENTRY',
      reason: blockedReason,
      metadata: {
        plan: usage?.plan ?? current?.plan ?? null,
        remainingShadeMatches: usage?.remainingShadeMatches ?? null,
      },
    }).catch(() => {
      // Analytics should never block the product flow.
    });
    setError(blockedReason);
    router.push('/subscription' as never);
  };

  const pickFromLibrary = async () => {
    if (shadeBlocked) {
      handleQuotaBlocked();
      return;
    }

    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required to choose a selfie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      const nextAsset = result.assets[0] ?? null;
      setAsset(nextAsset);
      setDetectedValidation(null);
    }
  };

  const handleStart = async () => {
    if (shadeBlocked) {
      handleQuotaBlocked();
      return;
    }

    if (!asset) {
      setError('Choose a clear selfie before starting shade matching.');
      return;
    }

    if (!validation.isAcceptable) {
      const reason =
        validation.issues[0] ??
        'This selfie needs a cleaner capture before matching can start.';
      void trackShadeAnalyticsEvent({
        eventType: 'SHADE_CAPTURE_VALIDATION_FAILED',
        screen: 'SHADE_ENTRY',
        reason,
        metadata: {
          detectorUsed: false,
          issueCount: validation.issues.length,
        },
      }).catch(() => {
        // Analytics should never block the product flow.
      });
      setError(reason);
      return;
    }

    try {
      setValidating(true);
      const faceValidation = await validateShadeSelfieWithFaceDetection(asset);
      setDetectedValidation(faceValidation);

      if (!faceValidation.isAcceptable) {
        const reason =
          faceValidation.issues[0] ??
          'This selfie needs a cleaner capture before matching can start.';
        void trackShadeAnalyticsEvent({
          eventType: 'SHADE_CAPTURE_VALIDATION_FAILED',
          screen: 'SHADE_ENTRY',
          reason,
          metadata: {
            detectorUsed: faceValidation.detectorUsed,
            detectedFaceCount: faceValidation.detectedFaceCount ?? null,
            issueCount: faceValidation.issues.length,
          },
        }).catch(() => {
          // Analytics should never block the product flow.
        });
        setError(reason);
        return;
      }

      setSubmitting(true);
      setError(null);
      const profile = await startShadeMatching({
        asset: {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height,
        },
        faceBounds: faceValidation.faceBounds ?? null,
      });
      void refreshSubscription().catch(() => {
        // Ignore subscription refresh failures after a successful match start.
      });
      void trackShadeAnalyticsEvent({
        eventType: 'SHADE_MATCH_STARTED',
        screen: 'SHADE_ENTRY',
        metadata: {
          detectorUsed: faceValidation.detectorUsed,
          detectedFaceCount: faceValidation.detectedFaceCount ?? null,
        },
      }).catch(() => {
        // Analytics should never block the product flow.
      });

      router.push({
        pathname: '/shade-match/result/[id]' as never,
        params: { id: profile.id } as never,
      });
    } catch (startError) {
      setError(getShadeApiErrorMessage(startError));
    } finally {
      setValidating(false);
      setSubmitting(false);
    }
  };

  const activeValidation = detectedValidation ?? validation;

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 72} gap={18}>
        <SectionHeading
          eyebrow="Shade Match"
          title="Find complexion shades that fit your skin."
          body="This feature set is separate from skincare analysis. Start with one clear, front-facing selfie to get foundation and concealer candidates."
        />

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              Shade match access
            </Text>
            {usage && current ? (
              <>
                <View className="rounded-[22px] bg-white/70 px-4 py-4">
                  <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                    Current plan
                  </Text>
                  <Text className="mt-2 font-bold text-lg text-charcoal">
                    {usage.plan}
                  </Text>
                  <Text className="mt-2 font-sans text-base leading-7 text-mist">
                    {usage.remainingShadeMatches} of {usage.shadeMatchesLimit} shade analyses remaining.
                  </Text>
                  <Text className="mt-2 font-sans text-sm leading-6 text-mist">
                    {usage.canStartShadeMatch
                      ? 'You can start another shade match now.'
                      : usage.shadeReason ??
                        'This feature is currently unavailable for your plan.'}
                  </Text>
                </View>
                <Button
                  label={
                    usage.canStartShadeMatch
                      ? 'Manage Subscription'
                      : 'Upgrade For More Shade Matches'
                  }
                  variant="secondary"
                  onPress={() => router.push('/subscription' as never)}
                />
              </>
            ) : subscriptionError ? (
              <View className="rounded-[22px] bg-white/70 px-4 py-4">
                <Text className="font-sans text-sm leading-6 text-roseDeep">
                  {subscriptionError}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  Loading your shade match access.
                </Text>
              </View>
            )}
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            {asset ? (
              <Image
                source={{ uri: asset.uri }}
                className="w-full rounded-[24px]"
                style={{ height: layout.isTablet ? 420 : 260 }}
                resizeMode="cover"
              />
            ) : (
              <View
                className="items-center justify-center rounded-[24px] border border-dashed border-white/70 bg-white/45 px-6"
                style={{ height: layout.isTablet ? 420 : 260 }}
              >
                <Text className="text-center font-sans text-base leading-7 text-mist">
                  Use daylight if possible, keep your face centered, and avoid heavy filters.
                </Text>
              </View>
            )}

            <View className="gap-3">
              <Button
                label="Open Live Shade Camera"
                variant="secondary"
                onPress={() =>
                  shadeBlocked
                    ? handleQuotaBlocked()
                    : router.push('/shade-match/live-capture' as never)
                }
              />
              <Button
                label="Choose From Library"
                variant="secondary"
                onPress={() => void pickFromLibrary()}
              />
              <Button
                label={
                  validating
                    ? 'Validating Face...'
                    : submitting
                      ? 'Matching Shades...'
                      : 'Start Shade Match'
                }
                onPress={() => void handleStart()}
                disabled={submitting || validating || Boolean(usage && !usage.canStartShadeMatch)}
              />
            </View>

            {submitting || validating ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color="#D96B8C" />
                <Text className="font-sans text-sm text-mist">
                  {validating
                    ? 'Checking face position and framing before matching starts.'
                    : 'Building your complexion profile and top shade candidates.'}
                </Text>
              </View>
            ) : null}

            {error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : null}
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">Selfie quality gate</Text>
            {asset ? (
              activeValidation.isAcceptable ? (
                <View className="rounded-[22px] bg-white/70 px-4 py-4">
                  <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                    Ready for matching
                  </Text>
                  <Text className="mt-2 font-sans text-base leading-7 text-mist">
                    {activeValidation.detectorUsed
                      ? `This selfie passes the current input checks, including face framing${typeof activeValidation.detectedFaceCount === 'number' ? ` with ${activeValidation.detectedFaceCount} face detected` : ''}.`
                      : 'This selfie passes the current input checks and can be used for the first shade-matching pass.'}
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {activeValidation.issues.map((issue) => (
                    <View key={issue} className="rounded-[22px] bg-white/70 px-4 py-4">
                      <Text className="font-sans text-base leading-7 text-mist">
                        {issue}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            ) : (
              <Text className="font-sans text-base leading-7 text-mist">
                Capture or choose a selfie to run the input checks.
              </Text>
            )}

            <View className="gap-3">
              {activeValidation.guidance.map((tip) => (
                <View key={tip} className="rounded-[22px] bg-white/70 px-4 py-4">
                  <Text className="font-sans text-base leading-7 text-mist">{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-3">
            <Text className="font-bold text-lg text-charcoal">Saved Shade Shelf</Text>
            <Text className="font-sans text-base leading-7 text-mist">
              Keep the shades that worked for you in a separate shelf so you can come back to them later.
            </Text>
            <Button
              label="Open Saved Shade Shelf"
              variant="ghost"
              onPress={() => router.push('/shade-shelf' as never)}
            />
          </View>
        </GlassCard>
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}
