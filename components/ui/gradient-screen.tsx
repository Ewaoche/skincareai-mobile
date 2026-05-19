import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from './responsive';

export function GradientScreen({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();

  return (
    <LinearGradient
      colors={['#FFF8F4', '#FFF3EC', '#F6EFFD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: -layout.width * 0.12,
          top: insets.top + 24,
          height: layout.isTablet ? 280 : 210,
          width: layout.isTablet ? 280 : 210,
          borderRadius: 999,
          backgroundColor: 'rgba(232,140,168,0.12)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -layout.width * 0.16,
          top: layout.height * 0.22,
          height: layout.isTablet ? 360 : 280,
          width: layout.isTablet ? 360 : 280,
          borderRadius: 999,
          backgroundColor: 'rgba(201,182,255,0.18)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: layout.width * 0.12,
          bottom: -100,
          height: layout.isTablet ? 260 : 190,
          width: layout.isTablet ? 260 : 190,
          borderRadius: 999,
          backgroundColor: 'rgba(246,209,193,0.20)',
        }}
      />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        {children}
      </View>
    </LinearGradient>
  );
}
