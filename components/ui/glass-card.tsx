import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';

export function GlassCard({ children }: PropsWithChildren) {
  return (
    <View
      className="overflow-hidden rounded-card border border-white/60 shadow-soft"
      style={{ backgroundColor: 'rgba(255,255,255,0.28)' }}
    >
      <BlurView intensity={28} tint="light">
        <View className="p-5">{children}</View>
      </BlurView>
    </View>
  );
}
