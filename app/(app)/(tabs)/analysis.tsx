import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
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

export default function AnalysisScreen() {
  const layout = useResponsiveLayout();
  const latest = useAnalysisStore((state) => state.latest);
  const setPendingAsset = useAnalysisStore((state) => state.setPendingAsset);
  const submitError = useAnalysisStore((state) => state.submitError);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);

  const handleLibraryPick = async () => {
    setScreenError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setScreenError('Photo library permission is required to choose a selfie.');
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
      setScreenError('Camera permission is required to take a live selfie.');
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
      setScreenError('Choose or capture a selfie before starting analysis.');
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
            eyebrow="Analysis"
            title="Upload a clean selfie for live scoring."
            body="Use the camera or your photo library, then send the image to the live skin analysis endpoint."
          />

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
                    Choose a centered, well-lit selfie with one face visible.
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: layout.isTablet ? 'row' : 'column',
                  flexWrap: layout.isTablet ? 'wrap' : 'nowrap',
                  gap: 12,
                }}
              >
                <View style={{ flex: layout.isTablet ? 1 : undefined, minWidth: layout.isTablet ? 220 : undefined }}>
                <Button
                  label="Take Selfie"
                  variant="secondary"
                  onPress={() => void handleCameraPick()}
                />
                </View>
                <View style={{ flex: layout.isTablet ? 1 : undefined, minWidth: layout.isTablet ? 220 : undefined }}>
                <Button
                  label="Choose From Library"
                  variant="secondary"
                  onPress={() => void handleLibraryPick()}
                />
                </View>
                <View style={{ width: '100%' }}>
                <Button
                  label="Start Analysis"
                  onPress={() => void handleSubmit()}
                />
                </View>
              </View>

              {screenError || submitError ? (
                <Text className="font-sans text-sm text-roseDeep">
                  {screenError || submitError}
                </Text>
              ) : null}
            </View>
          </GlassCard>

          {latest ? (
            <GlassCard>
              <View className="gap-4">
                <Text className="font-bold text-lg text-charcoal">
                  Most recent scores
                </Text>
                <AnalysisScoreGrid scores={latest.scores} />
                <Button
                  label="Open Latest Result"
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
