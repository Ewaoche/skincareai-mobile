import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { toByteArray } from 'base64-js';
import jpeg from 'jpeg-js';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import {
  ResponsiveScrollScreen,
  useResponsiveLayout,
} from '@/components/ui/responsive';
import { SectionHeading } from '@/components/ui/section-heading';
import {
  getShadeApiErrorMessage,
  startShadeMatching,
} from '@/lib/api/shade-matching-api';
import { trackShadeAnalyticsEvent } from '@/lib/api/analytics-api';
import {
  buildFaceValidationResult,
  loadFaceDetectorModule,
  validateShadeSelfieAsset,
  validateShadeSelfieWithFaceDetection,
  type ShadeSelfieValidationResult,
} from '@/lib/shade/selfie-validation';
import { useSubscriptionStore } from '@/stores/subscription-store';

const LIVE_GUIDANCE_FALLBACK: ShadeSelfieValidationResult = {
  isAcceptable: false,
  issues: ['Position your face inside the guide and hold still for a moment.'],
  guidance: [
    'Center your face and keep your head level.',
    'Move closer until your face fills more of the frame.',
    'Use soft daylight and avoid heavy shadows.',
  ],
  detectorUsed: false,
  faceBounds: null,
};

const MIN_EXPOSURE_SCORE = 0.48;
const REQUIRED_STABLE_FRAMES = 2;
const AUTO_CAPTURE_DELAY_MS = 1200;
const MAX_SIDE_IMBALANCE = 34;
const MAX_HIGHLIGHT_RATIO = 0.16;

export default function LiveShadeCaptureScreen() {
  const layout = useResponsiveLayout();
  const usage = useSubscriptionStore((state) => state.usage);
  const refreshSubscription = useSubscriptionStore((state) => state.refresh);
  const cameraRef = useRef<CameraView | null>(null);
  const analysisTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoCaptureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const analyzingRef = useRef(false);
  const submittingRef = useRef(false);
  const autoCaptureTriggeredRef = useRef(false);
  const stableFrameCountRef = useRef(0);
  const lastAcceptedFrameRef = useRef<{
    faceBounds: NonNullable<ShadeSelfieValidationResult['faceBounds']>;
  } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveValidation, setLiveValidation] =
    useState<ShadeSelfieValidationResult>(LIVE_GUIDANCE_FALLBACK);
  const [brightnessStatus, setBrightnessStatus] = useState<{
    isAcceptable: boolean;
    message: string;
    score: number;
    balanceScore: number;
    highlightRatio: number;
  }>({
    isAcceptable: false,
    message: 'Waiting for camera analysis.',
    score: 0,
    balanceScore: 0,
    highlightRatio: 0,
  });
  const [stableFrameCount, setStableFrameCount] = useState(0);
  const [autoCaptureCountdown, setAutoCaptureCountdown] = useState<
    number | null
  >(null);

  const detectorAvailable = useMemo(
    () => Boolean(loadFaceDetectorModule()),
    [],
  );

  useEffect(() => {
    void refreshSubscription().catch(() => {
      // The screen can still render fallback messaging below.
    });
  }, [refreshSubscription]);

  useEffect(() => {
    if (usage && !usage.canStartShadeMatch) {
      void trackShadeAnalyticsEvent({
        eventType: 'SHADE_CAPTURE_BLOCKED',
        screen: 'SHADE_LIVE_CAPTURE',
        reason:
          usage.shadeReason ??
          'Your current plan cannot start another shade match right now.',
        metadata: {
          plan: usage.plan,
          remainingShadeMatches: usage.remainingShadeMatches,
        },
      }).catch(() => {
        // Analytics should never block the product flow.
      });
      setError(
        usage.shadeReason ??
          'Your current plan cannot start another shade match right now.',
      );
    }
  }, [usage]);

  useEffect(() => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      void requestPermission();
    }
  }, [permission, requestPermission]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  useEffect(() => {
    if (!permission?.granted || !cameraReady || submitting || usage?.canStartShadeMatch === false) {
      return;
    }

    let cancelled = false;

    const analyzeFrame = async () => {
      if (
        cancelled ||
        !cameraReady ||
        !cameraRef.current ||
        submitting ||
        analyzingRef.current
      ) {
        return;
      }

      analyzingRef.current = true;

      try {
        const frame = await cameraRef.current.takePictureAsync({
          quality: 0.2,
          base64: true,
          skipProcessing: true,
          shutterSound: false,
        });

        const assetLike = {
          uri: frame.uri,
          width: frame.width,
          height: frame.height,
          mimeType: 'image/jpeg',
        } as ImagePicker.ImagePickerAsset;
        const base = validateShadeSelfieAsset(assetLike);
        const FaceDetector = loadFaceDetectorModule();

        if (!FaceDetector) {
          setLiveValidation(base);
        } else {
          const detection = await FaceDetector.detectFacesAsync(frame.uri, {
            mode: FaceDetector.FaceDetectorMode.fast,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
            runClassifications: FaceDetector.FaceDetectorClassifications.all,
          });

          const nextValidation = buildFaceValidationResult({
            base,
            faces: detection.faces as never[],
            imageWidth: detection.image?.width ?? frame.width,
            imageHeight: detection.image?.height ?? frame.height,
          });
          setLiveValidation(nextValidation);

          const nextBrightnessStatus = evaluateFrameBrightness(frame.base64);
          setBrightnessStatus(nextBrightnessStatus);
          updateStabilityState({
            validation: nextValidation,
            brightnessAcceptable: nextBrightnessStatus.isAcceptable,
            stableFrameCountRef,
            lastAcceptedFrameRef,
            setStableFrameCount,
          });
        }

        await deleteFrame(frame.uri);
      } catch {
        setLiveValidation(LIVE_GUIDANCE_FALLBACK);
        setBrightnessStatus({
          isAcceptable: false,
          message: 'Live brightness analysis is temporarily unavailable.',
          score: 0,
          balanceScore: 0,
          highlightRatio: 0,
        });
        stableFrameCountRef.current = 0;
        lastAcceptedFrameRef.current = null;
        setStableFrameCount(0);
      } finally {
        analyzingRef.current = false;

        if (!cancelled) {
          analysisTimeoutRef.current = setTimeout(() => {
            void analyzeFrame();
          }, 900);
        }
      }
    };

    void analyzeFrame();

    return () => {
      cancelled = true;
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
    };
  }, [cameraReady, permission?.granted, submitting, usage?.canStartShadeMatch]);

  const captureReady =
    liveValidation.isAcceptable &&
    brightnessStatus.isAcceptable &&
    stableFrameCount >= REQUIRED_STABLE_FRAMES;

  const handleCapture = async () => {
    if (!cameraRef.current || submittingRef.current) {
      return;
    }

    if (usage && !usage.canStartShadeMatch) {
      setError(
        usage.shadeReason ??
          'Your current plan cannot start another shade match right now.',
      );
      router.push('/subscription' as never);
      return;
    }

    try {
      if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
        autoCaptureTimeoutRef.current = null;
      }
      autoCaptureTriggeredRef.current = true;
      setAutoCaptureCountdown(null);
      submittingRef.current = true;
      setSubmitting(true);
      setError(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
        shutterSound: false,
      });

      const assetLike = {
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        mimeType: 'image/jpeg',
        fileName: `shade-live-${Date.now()}.jpg`,
      } as ImagePicker.ImagePickerAsset;

      const validation = await validateShadeSelfieWithFaceDetection(assetLike);
      setLiveValidation(validation);

      if (
        !validation.isAcceptable ||
        !brightnessStatus.isAcceptable ||
        stableFrameCount < REQUIRED_STABLE_FRAMES
      ) {
        const reason =
          validation.issues[0] ??
          brightnessStatus.message ??
          'This frame is not ready for shade matching yet.';
        void trackShadeAnalyticsEvent({
          eventType: 'SHADE_CAPTURE_VALIDATION_FAILED',
          screen: 'SHADE_LIVE_CAPTURE',
          reason,
          metadata: {
            detectorUsed: validation.detectorUsed,
            detectedFaceCount: validation.detectedFaceCount ?? null,
            brightnessAcceptable: brightnessStatus.isAcceptable,
            brightnessScore: brightnessStatus.score,
            balanceScore: brightnessStatus.balanceScore,
            highlightRatio: brightnessStatus.highlightRatio,
            stableFrameCount,
          },
        }).catch(() => {
          // Analytics should never block the product flow.
        });
        setError(reason);
        return;
      }

      const profile = await startShadeMatching({
        asset: {
          uri: photo.uri,
          fileName: assetLike.fileName,
          mimeType: assetLike.mimeType,
          width: photo.width,
          height: photo.height,
        },
        faceBounds: validation.faceBounds ?? null,
      });
      void trackShadeAnalyticsEvent({
        eventType: 'SHADE_MATCH_STARTED',
        screen: 'SHADE_LIVE_CAPTURE',
        metadata: {
          detectorUsed: validation.detectorUsed,
          detectedFaceCount: validation.detectedFaceCount ?? null,
          brightnessScore: brightnessStatus.score,
          balanceScore: brightnessStatus.balanceScore,
          highlightRatio: brightnessStatus.highlightRatio,
        },
      }).catch(() => {
        // Analytics should never block the product flow.
      });

      router.replace({
        pathname: '/shade-match/result/[id]' as never,
        params: { id: profile.id } as never,
      });
    } catch (captureError) {
      setError(getShadeApiErrorMessage(captureError));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!captureReady || submitting) {
      if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
        autoCaptureTimeoutRef.current = null;
      }
      autoCaptureTriggeredRef.current = false;
      setAutoCaptureCountdown(null);
      return;
    }

    if (autoCaptureTimeoutRef.current || autoCaptureTriggeredRef.current) {
      return;
    }

    const startedAt = Date.now();
    setAutoCaptureCountdown(AUTO_CAPTURE_DELAY_MS);

    const countdownInterval = setInterval(() => {
      const remaining = AUTO_CAPTURE_DELAY_MS - (Date.now() - startedAt);
      setAutoCaptureCountdown(Math.max(0, remaining));
    }, 100);

    autoCaptureTimeoutRef.current = setTimeout(() => {
      autoCaptureTimeoutRef.current = null;
      clearInterval(countdownInterval);
      setAutoCaptureCountdown(0);
      void handleCapture();
    }, AUTO_CAPTURE_DELAY_MS);

    return () => {
      clearInterval(countdownInterval);
      if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
        autoCaptureTimeoutRef.current = null;
      }
      setAutoCaptureCountdown(null);
    };
  }, [captureReady, submitting]);

  useEffect(
    () => () => {
      if (autoCaptureTimeoutRef.current) {
        clearTimeout(autoCaptureTimeoutRef.current);
      }
    },
    [],
  );

  if (!permission) {
    return (
      <GradientScreen>
        <ResponsiveScrollScreen
          topPadding={18}
          bottomPadding={layout.tabBarHeight + 72}
          gap={18}
        >
          <GlassCard>
            <ActivityIndicator color="#D96B8C" />
          </GlassCard>
        </ResponsiveScrollScreen>
      </GradientScreen>
    );
  }

  if (!permission.granted) {
    return (
      <GradientScreen>
        <ResponsiveScrollScreen
          topPadding={18}
          bottomPadding={layout.tabBarHeight + 72}
          gap={18}
        >
          <SectionHeading
            eyebrow="Shade Match"
            title="Camera permission is required."
            body="Allow camera access so the app can guide your shade selfie before upload."
          />
          <GlassCard>
            <View className="gap-4">
              <Button label="Grant Camera Permission" onPress={() => void requestPermission()} />
              <Button
                label="Back"
                variant="ghost"
                onPress={() => router.back()}
              />
            </View>
          </GlassCard>
        </ResponsiveScrollScreen>
      </GradientScreen>
    );
  }

  const primaryStatus = liveValidation.isAcceptable
    ? brightnessStatus.isAcceptable
      ? stableFrameCount >= REQUIRED_STABLE_FRAMES
        ? autoCaptureCountdown !== null
          ? `Capturing in ${Math.max(1, Math.ceil(autoCaptureCountdown / 1000))}…`
          : 'Ready to capture'
        : 'Hold still for a moment'
      : brightnessStatus.message
    : liveValidation.issues[0] ?? 'Align your face inside the guide.';

  return (
    <GradientScreen>
      <ResponsiveScrollScreen
        topPadding={18}
        bottomPadding={layout.tabBarHeight + 72}
        gap={18}
      >
        <SectionHeading
          eyebrow="Live Shade Camera"
          title="Capture a guided complexion selfie."
          body="The app checks face framing before upload. Hold still once the frame is good and it will capture automatically."
        />

        {usage?.canStartShadeMatch === false ? (
          <GlassCard>
            <View className="gap-4">
              <Text className="font-bold text-lg text-charcoal">
                Shade match unavailable
              </Text>
              <Text className="font-sans text-base leading-7 text-mist">
                {usage.shadeReason ??
                  'Your current plan cannot start another shade match right now.'}
              </Text>
              <Button
                label="Open Subscription"
                onPress={() => router.push('/subscription' as never)}
              />
            </View>
          </GlassCard>
        ) : null}

        <GlassCard>
          <View className="gap-4">
            <View
              className="overflow-hidden rounded-[28px] bg-charcoal"
              style={{ height: layout.isTablet ? 520 : 420 }}
            >
              <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing="front"
                mode="picture"
                mirror
                animateShutter={false}
                onCameraReady={() => setCameraReady(true)}
              />

              <View className="absolute inset-0 items-center justify-center">
                <View
                  className={`rounded-[120px] border-4 ${
                    liveValidation.isAcceptable
                      ? 'border-emerald-400'
                      : 'border-white/80'
                  }`}
                  style={{
                    width: layout.isTablet ? 300 : 230,
                    height: layout.isTablet ? 360 : 290,
                  }}
                />
              </View>

              <View className="absolute left-4 right-4 top-4 rounded-[22px] bg-black/45 px-4 py-3">
                <Text className="font-medium text-xs uppercase tracking-[1.4px] text-white/80">
                  Live guidance
                </Text>
                <Text className="mt-2 font-sans text-sm leading-6 text-white">
                  {primaryStatus}
                </Text>
                <Text className="mt-2 font-sans text-xs text-white/70">
                  {detectorAvailable
                    ? `Face presence, centering, size, head angle, and brightness are checked locally before upload. Stability ${stableFrameCount}/${REQUIRED_STABLE_FRAMES}.`
                    : 'Native face detection is unavailable in this build, so live guidance is limited.'}
                </Text>
                {autoCaptureCountdown !== null ? (
                  <Text className="mt-2 font-sans text-xs text-white/80">
                    Auto-capture is armed. Keep still and stay in the light.
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="gap-3">
              <Button
                label={submitting ? 'Capturing...' : 'Capture And Match'}
                onPress={() => void handleCapture()}
                disabled={!captureReady || submitting}
              />
              <Button
                label="Use Library Instead"
                variant="secondary"
                onPress={() => router.back()}
              />
            </View>

            {error ? (
              <Text className="font-sans text-sm text-roseDeep">{error}</Text>
            ) : null}
          </View>
        </GlassCard>

        <GlassCard>
          <View className="gap-4">
            <Text className="font-bold text-lg text-charcoal">
              Capture guidance
            </Text>
            <View className="rounded-[22px] bg-white/70 px-4 py-4">
              <Text className="font-medium text-xs uppercase tracking-[1.4px] text-roseDeep">
                Brightness
              </Text>
              <Text className="mt-2 font-sans text-base leading-7 text-mist">
                {brightnessStatus.message}
              </Text>
              <View className="mt-2 gap-1">
                <Text className="font-sans text-xs text-mist">
                  Exposure score: {Math.round(brightnessStatus.score * 100)}%
                </Text>
                <Text className="font-sans text-xs text-mist">
                  Lighting balance: {Math.round(brightnessStatus.balanceScore * 100)}%
                </Text>
                <Text className="font-sans text-xs text-mist">
                  Highlight clipping: {Math.round(brightnessStatus.highlightRatio * 100)}%
                </Text>
              </View>
            </View>
            <View className="gap-3">
              {liveValidation.guidance.map((tip) => (
                <View
                  key={tip}
                  className="rounded-[22px] bg-white/70 px-4 py-4"
                >
                  <Text className="font-sans text-base leading-7 text-mist">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}

async function deleteFrame(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Ignore cache cleanup issues; they should not block guidance.
  }
}

function evaluateFrameBrightness(base64?: string): {
  isAcceptable: boolean;
  message: string;
  score: number;
  balanceScore: number;
  highlightRatio: number;
} {
  if (!base64) {
    return {
      isAcceptable: false,
      message: 'Brightness analysis is not available for this frame.',
      score: 0,
      balanceScore: 0,
      highlightRatio: 0,
    };
  }

  try {
    const decoded = jpeg.decode(toByteArray(base64), { useTArray: true });
    let luminanceTotal = 0;
    let sampleCount = 0;
    let leftLuminanceTotal = 0;
    let rightLuminanceTotal = 0;
    let leftSampleCount = 0;
    let rightSampleCount = 0;
    let highlightSamples = 0;
    const sampleWidth = Math.max(1, decoded.width);
    const halfWidth = sampleWidth / 2;

    for (let index = 0; index < decoded.data.length; index += 32) {
      const r = decoded.data[index] ?? 0;
      const g = decoded.data[index + 1] ?? 0;
      const b = decoded.data[index + 2] ?? 0;
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const pixelIndex = Math.floor(index / 4);
      const x = pixelIndex % sampleWidth;

      luminanceTotal += luminance;
      sampleCount += 1;

      if (x < halfWidth) {
        leftLuminanceTotal += luminance;
        leftSampleCount += 1;
      } else {
        rightLuminanceTotal += luminance;
        rightSampleCount += 1;
      }

      if (luminance > 245) {
        highlightSamples += 1;
      }
    }

    const averageLuminance = sampleCount > 0 ? luminanceTotal / sampleCount : 0;
    const score = clamp(1 - Math.abs(averageLuminance - 145) / 120, 0, 1);
    const leftAverage =
      leftSampleCount > 0 ? leftLuminanceTotal / leftSampleCount : averageLuminance;
    const rightAverage =
      rightSampleCount > 0
        ? rightLuminanceTotal / rightSampleCount
        : averageLuminance;
    const sideImbalance = Math.abs(leftAverage - rightAverage);
    const balanceScore = clamp(1 - sideImbalance / 90, 0, 1);
    const highlightRatio =
      sampleCount > 0 ? highlightSamples / sampleCount : 0;

    if (averageLuminance < 78) {
      return {
        isAcceptable: false,
        message: 'Move into brighter light before capturing.',
        score,
        balanceScore,
        highlightRatio,
      };
    }

    if (averageLuminance > 210) {
      return {
        isAcceptable: false,
        message: 'Reduce harsh glare or overexposure before capturing.',
        score,
        balanceScore,
        highlightRatio,
      };
    }

    if (highlightRatio > MAX_HIGHLIGHT_RATIO) {
      return {
        isAcceptable: false,
        message: 'Move out of direct sun or reduce glare on your face.',
        score,
        balanceScore,
        highlightRatio,
      };
    }

    if (sideImbalance > MAX_SIDE_IMBALANCE) {
      const darkerSide = leftAverage < rightAverage ? 'left' : 'right';
      return {
        isAcceptable: false,
        message: `Lighting is uneven. Turn your ${darkerSide} side slightly toward the window.`,
        score,
        balanceScore,
        highlightRatio,
      };
    }

    if (score < MIN_EXPOSURE_SCORE) {
      return {
        isAcceptable: false,
        message: 'Lighting is uneven. Use softer daylight if possible.',
        score,
        balanceScore,
        highlightRatio,
      };
    }

    return {
      isAcceptable: true,
      message: 'Lighting looks balanced enough for shade capture.',
      score,
      balanceScore,
      highlightRatio,
    };
  } catch {
    return {
      isAcceptable: false,
      message: 'Brightness analysis is not available for this frame.',
      score: 0,
      balanceScore: 0,
      highlightRatio: 0,
    };
  }
}

function updateStabilityState(input: {
  validation: ShadeSelfieValidationResult;
  brightnessAcceptable: boolean;
  stableFrameCountRef: React.MutableRefObject<number>;
  lastAcceptedFrameRef: React.MutableRefObject<{
    faceBounds: NonNullable<ShadeSelfieValidationResult['faceBounds']>;
  } | null>;
  setStableFrameCount: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (
    !input.validation.isAcceptable ||
    !input.brightnessAcceptable ||
    !input.validation.faceBounds
  ) {
    input.stableFrameCountRef.current = 0;
    input.lastAcceptedFrameRef.current = null;
    input.setStableFrameCount(0);
    return;
  }

  const previous = input.lastAcceptedFrameRef.current;
  const current = input.validation.faceBounds;

  const isStable =
    !previous ||
    Math.abs(previous.faceBounds.left - current.left) < 0.03 &&
      Math.abs(previous.faceBounds.top - current.top) < 0.03 &&
      Math.abs(previous.faceBounds.width - current.width) < 0.035 &&
      Math.abs(previous.faceBounds.height - current.height) < 0.035;

  input.stableFrameCountRef.current = isStable
    ? input.stableFrameCountRef.current + 1
    : 1;
  input.lastAcceptedFrameRef.current = { faceBounds: current };
  input.setStableFrameCount(input.stableFrameCountRef.current);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
