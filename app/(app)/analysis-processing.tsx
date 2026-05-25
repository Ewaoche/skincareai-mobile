import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAnalysisStore } from '@/stores/analysis-store';

const processingMessages = [
  'Uploading your photo securely.',
  'Reviewing your skin profile.',
  'Preparing your results.',
] as const;

export default function AnalysisProcessingScreen() {
  const pendingAsset = useAnalysisStore((state) => state.pendingAsset);
  const submitAnalysis = useAnalysisStore((state) => state.submitAnalysis);
  const setPendingAsset = useAnalysisStore((state) => state.setPendingAsset);
  const submitting = useAnalysisStore((state) => state.submitting);
  const submitError = useAnalysisStore((state) => state.submitError);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [didStart, setDidStart] = useState(false);

  useEffect(() => {
    if (!submitting) {
      return undefined;
    }

    const interval = setInterval(() => {
      setPhaseIndex((current) =>
        current >= processingMessages.length - 1 ? current : current + 1,
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [submitting]);

  useEffect(() => {
    if (!pendingAsset || didStart) {
      return;
    }

    setDidStart(true);

    const run = async () => {
      try {
        const result = await submitAnalysis({ asset: pendingAsset });
        router.replace({
          pathname: '/analysis-result/[id]' as never,
          params: { id: result.analysisId } as never,
        });
      } catch {
        // The store exposes the failure message for the screen to render.
      }
    };

    void run();
  }, [didStart, pendingAsset, submitAnalysis]);

  const body = useMemo(() => {
    if (!pendingAsset) {
      return 'No photo is ready yet. Go back and choose a photo to continue.';
    }

    if (submitError) {
      return submitError;
    }

    return processingMessages[phaseIndex];
  }, [pendingAsset, phaseIndex, submitError]);

  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-10">
        <View className="gap-6">
          <SectionHeading
            eyebrow="Processing"
            title="Analyzing your photo"
            body="This usually takes a short moment while we prepare your results."
          />

          <GlassCard>
            <View className="items-center gap-5 py-4">
              {!submitError && pendingAsset ? (
                <ActivityIndicator color="#D96B8C" size="large" />
              ) : null}

              <Text className="text-center font-sans text-base leading-7 text-mist">
                {body}
              </Text>
            </View>
          </GlassCard>

          {submitError || !pendingAsset ? (
            <View className="gap-3">
              <Button
                label="Back to Analysis"
                variant="secondary"
                onPress={() => {
                  setPendingAsset(null);
                  router.replace('/(app)/(tabs)/analysis');
                }}
              />
              {pendingAsset ? (
                <Button
                  label="Try Again"
                  onPress={() => {
                    setDidStart(false);
                    setPhaseIndex(0);
                  }}
                  disabled={submitting}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </GradientScreen>
  );
}
