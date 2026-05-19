import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useResponsiveLayout } from './responsive';

export function GlassCard({ children }: PropsWithChildren) {
  const layout = useResponsiveLayout();

  return (
    <View
      className="overflow-hidden border border-white/70 shadow-soft"
      style={{
        borderRadius: layout.isTablet ? 34 : 28,
        backgroundColor: 'rgba(255,255,255,0.36)',
      }}
    >
      <BlurView intensity={34} tint="light">
        <View style={{ padding: layout.cardPadding }}>{children}</View>
      </BlurView>
    </View>
  );
}
