import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, Text, View } from 'react-native';

const labels: Record<string, string> = {
  home: 'Home',
  analysis: 'Analysis',
  history: 'History',
  profile: 'Profile',
};

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View className="absolute bottom-6 left-5 right-5 overflow-hidden rounded-[28px] border border-white/70">
      <BlurView intensity={28} tint="light">
        <View
          className="flex-row items-center justify-between px-3 py-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.78)' }}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const label = labels[route.name] ?? route.name;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                className="flex-1 items-center justify-center"
              >
                <View
                  className={`rounded-pill px-4 py-3 ${
                    isFocused ? 'bg-blush' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`font-medium text-sm ${
                      isFocused ? 'text-white' : 'text-mist'
                    }`}
                  >
                    {label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}
