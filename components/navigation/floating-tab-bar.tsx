import { BlurView } from 'expo-blur';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '@/components/ui/responsive';

const labels: Record<string, string> = {
  home: 'Home',
  analysis: 'Scan',
  history: 'History',
  profile: 'Profile',
};

function TabIcon({
  routeName,
  focused,
}: {
  routeName: string;
  focused: boolean;
}) {
  const color = focused ? '#FFFFFF' : '#8F7885';
  const strokeWidth = focused ? 2.1 : 1.9;

  if (routeName === 'home') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 11.5L12 5L20 11.5V20H14.5V14.5H9.5V20H4V11.5Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  if (routeName === 'analysis') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4.5C8.4 4.5 5.5 7.4 5.5 11C5.5 14.6 8.4 17.5 12 17.5C15.6 17.5 18.5 14.6 18.5 11C18.5 7.4 15.6 4.5 12 4.5Z"
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <Path
          d="M17 16L20 19"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M12 8.7V13.3"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M9.7 11H14.3"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  if (routeName === 'history') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 4.8V19.2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M12 9V19.2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M18 13.2V19.2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12.5C14.3472 12.5 16.25 10.5972 16.25 8.25C16.25 5.90279 14.3472 4 12 4C9.65279 4 7.75 5.90279 7.75 8.25C7.75 10.5972 9.65279 12.5 12 12.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M5 19.5C6.7 16.9 9.1 15.6 12 15.6C14.9 15.6 17.3 16.9 19 19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FloatingTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const layout = useResponsiveLayout();
  const frameWidth = layout.isLargeTablet
    ? 760
    : layout.isTablet
      ? Math.min(layout.width - layout.horizontalPadding * 2, 640)
      : Math.min(layout.width - layout.horizontalPadding * 2, 420);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.outer,
        {
          paddingHorizontal: layout.horizontalPadding,
          bottom: insets.bottom + layout.tabBarInset,
        },
      ]}
    >
      <View style={[styles.frame, { width: frameWidth }]}>
        <BlurView intensity={42} tint="light" style={styles.blur}>
          <View
            style={[
              styles.inner,
              {
                minHeight: layout.tabBarHeight,
                borderRadius: layout.isTablet ? 34 : 30,
                paddingHorizontal: layout.isTablet ? 12 : 8,
                paddingVertical: layout.isTablet ? 10 : 8,
                justifyContent: 'center',
              },
            ]}
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
                  style={({ pressed }) => [
                    styles.tab,
                    {
                      opacity: pressed ? 0.88 : 1,
                      borderRadius: layout.isTablet ? 28 : 24,
                      paddingVertical: layout.isTablet ? 12 : 10,
                      paddingHorizontal: layout.isTablet ? 16 : 12,
                      backgroundColor: 'transparent',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      isFocused && styles.activeIconWrap,
                    ]}
                  >
                    <TabIcon routeName={route.name} focused={isFocused} />
                  </View>
                  <Text
                    style={[
                      styles.label,
                      {
                        color: isFocused ? '#FFFFFF' : '#8F7885',
                        fontSize: layout.isTablet ? 13 : 12,
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.74)',
    shadowColor: '#8E596B',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 18 },
    shadowRadius: 32,
    elevation: 12,
  },
  blur: {
    backgroundColor: 'rgba(255,250,248,0.80)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconWrap: {
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  activeIconWrap: {
    backgroundColor: 'transparent',
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});
