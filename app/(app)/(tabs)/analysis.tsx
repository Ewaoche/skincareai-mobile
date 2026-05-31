import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import { AnalysisScoreGrid } from '@/components/analysis/analysis-score-grid';
import { Button } from '@/components/ui/button';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAnalysisStore } from '@/stores/analysis-store';
import { ResponsiveScrollScreen, useResponsiveLayout } from '@/components/ui/responsive';
import { useI18n } from '@/lib/i18n';

export default function AnalysisScreen() {
  const layout = useResponsiveLayout();
  const { t } = useI18n();
  const latest = useAnalysisStore((state) => state.latest);
  const setPendingAsset = useAnalysisStore((state) => state.setPendingAsset);
  const submitError = useAnalysisStore((state) => state.submitError);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);

  const handleLibraryPick = async () => {
    setScreenError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setScreenError(t('analysis.permissionLibrary'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (!result.canceled) {
      setAsset(result.assets[0] ?? null);
    }
  };

  const handleCameraPick = async () => {
    setScreenError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setScreenError(t('analysis.permissionCamera'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      cameraType: ImagePicker.CameraType.front,
      quality: 0.9,
    });

    if (!result.canceled) {
      setAsset(result.assets[0] ?? null);
    }
  };

  const handleSubmit = async () => {
    if (!asset) {
      setScreenError(t('analysis.chooseBeforeStart'));
      return;
    }

    setPendingAsset({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
    });
    router.push('/analysis-processing' as never);
  };

  return (
    <GradientScreen>
      <ResponsiveScrollScreen topPadding={18} bottomPadding={layout.tabBarHeight + 64} gap={18}>
        <SectionHeading
          eyebrow={t('analysis.eyebrow')}
          title={t('analysis.title')}
          body={t('analysis.body')}
        />

        <GlassCard>
          <View className="gap-4">
            <View
              style={{
                minHeight: layout.isTablet ? 420 : 300,
                borderRadius: layout.isTablet ? 34 : 28,
                padding: layout.isTablet ? 24 : 18,
                backgroundColor: 'rgba(255,255,255,0.38)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.72)',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <View
                style={{
                  flexDirection: layout.isTablet ? 'row' : 'column',
                  justifyContent: 'space-between',
                  alignItems: layout.isTablet ? 'center' : 'flex-start',
                  gap: 12,
                }}
              >
                <View style={{ gap: 6 }}>
                  <Text className="font-bold text-xl text-charcoal">Selfie capture</Text>
                  <Text className="font-sans text-sm leading-6 text-mist">
                    Use a clear front-facing photo in soft light for more reliable analysis.
                  </Text>
                </View>
                <View className="rounded-pill border border-white/80 bg-white/72 px-4 py-2">
                  <Text className="font-medium text-xs uppercase tracking-[1.5px] text-roseDeep">
                    Step 1 of 2
                  </Text>
                </View>
              </View>

              {asset ? (
                <Image
                  source={{ uri: asset.uri }}
                  className="w-full rounded-[28px]"
                  style={{ height: layout.isTablet ? 260 : 220 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="items-center justify-center rounded-[28px] border border-dashed border-white/80 bg-white/52 px-6"
                  style={{ height: layout.isTablet ? 260 : 220 }}
                >
                  <Text className="text-center font-sans text-base leading-7 text-mist">
                    {t('analysis.emptyState')}
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: layout.isTablet ? 'row' : 'column',
                  gap: 12,
                }}
              >
                <ActionTile
                  title={t('analysis.takeSelfie')}
                  body="Open the front camera and capture a fresh selfie."
                  onPress={() => void handleCameraPick()}
                />
                <ActionTile
                  title={t('analysis.chooseLibrary')}
                  body="Pick an existing photo from your device gallery."
                  onPress={() => void handleLibraryPick()}
                />
              </View>

              <Button
                label={t('analysis.start')}
                onPress={() => void handleSubmit()}
              />
            </View>

            {screenError || submitError ? (
              <Text className="font-sans text-sm text-roseDeep">
                {screenError || submitError}
              </Text>
            ) : null}
          </View>
        </GlassCard>

        <GlassCard>
          <View
            style={{
              flexDirection: layout.isTablet ? 'row' : 'column',
              gap: 12,
            }}
          >
            <ChecklistItem label="Face centered and fully visible" />
            <ChecklistItem label="Minimal shadow and glare" />
            <ChecklistItem label="No heavy filter or blur" />
          </View>
        </GlassCard>

        {latest ? (
          <GlassCard>
            <View className="gap-4">
              <View
                style={{
                  flexDirection: layout.isTablet ? 'row' : 'column',
                  justifyContent: 'space-between',
                  alignItems: layout.isTablet ? 'center' : 'flex-start',
                  gap: 10,
                }}
              >
                <View style={{ gap: 6 }}>
                  <Text className="font-bold text-lg text-charcoal">
                    {t('analysis.recentScores')}
                  </Text>
                  <Text className="font-sans text-sm text-mist">
                    Your most recent scan stays visible here while you prepare a new one.
                  </Text>
                </View>
              </View>
              <AnalysisScoreGrid scores={latest.scores} />
              <Button
                label={t('analysis.openLatest')}
                variant="ghost"
                onPress={() =>
                  router.push({
                    pathname: '/analysis-result/[id]' as never,
                    params: { id: latest.analysisId } as never,
                  })
                }
              />
            </View>
          </GlassCard>
        ) : null}
      </ResponsiveScrollScreen>
    </GradientScreen>
  );
}

function ActionTile({
  title,
  body,
  onPress,
}: {
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-[24px] border border-white/80 bg-white/68 px-4 py-4"
    >
      <Text className="font-bold text-base text-charcoal">{title}</Text>
      <Text className="mt-2 font-sans text-sm leading-6 text-mist">{body}</Text>
    </Pressable>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <View className="flex-1 flex-row items-center gap-3 rounded-[22px] border border-white/75 bg-white/62 px-4 py-4">
      <View
        style={{
          height: 12,
          width: 12,
          borderRadius: 999,
          backgroundColor: '#E88CA8',
        }}
      />
      <Text className="flex-1 font-sans text-sm leading-6 text-charcoal">{label}</Text>
    </View>
  );
}
