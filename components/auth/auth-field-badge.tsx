import { Text, View } from 'react-native';

export function AuthFieldBadge({ label }: { label: string }) {
  return (
    <View className="h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/25">
      <Text className="font-medium text-[11px] uppercase text-white">{label}</Text>
    </View>
  );
}
