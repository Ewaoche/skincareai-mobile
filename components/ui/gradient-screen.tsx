import { PropsWithChildren } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export function GradientScreen({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={['#FFF9F7', '#FFF4F0', '#F8F0FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>{children}</SafeAreaView>
    </LinearGradient>
  );
}
