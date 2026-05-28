import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { SectionHeading } from '@/components/ui/section-heading';
import { useI18n } from '@/lib/i18n';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function AnalysisProcessingScreen() {
  const { t } = useI18n();
  const pendingAsset = useAnalysisStore((state) => state.pendingAsset);
  const submitAnalysis = useAnalysisStore((state) => state.submitAnalysis);
  const setPendingAsset = useAnalysisStore((state) => state.setPendingAsset);
  const submitting = useAnalysisStore((state) => state.submitting);
  const submitError = useAnalysisStore((state) => state.submitError);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [didStart, setDidStart] = useState(false);
  const processingMessages = [
    t('processing.step.upload'),
    t('processing.step.review'),
    t('processing.step.prepare'),
  ] as const;

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
      return t('processing.noPhoto');
    }

    if (submitError) {
      return submitError;
    }

    return processingMessages[phaseIndex];
  }, [pendingAsset, phaseIndex, processingMessages, submitError, t]);

  return (
    <GradientScreen>
      <View className="flex-1 justify-center px-6 pb-10">
        <View className="gap-6">
          <SectionHeading
            eyebrow={t('processing.eyebrow')}
            title={t('processing.title')}
            body={t('processing.body')}
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
                label={t('processing.backAnalysis')}
                variant="secondary"
                onPress={() => {
                  setPendingAsset(null);
                  router.replace('/(app)/(tabs)/analysis');
                }}
              />
              {pendingAsset ? (
                <Button
                  label={t('processing.tryAgain')}
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
