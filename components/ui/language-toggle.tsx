import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLanguage } from '@/lib/i18n/types';

type LanguageToggleOption = {
  code: AppLanguage;
  label: string;
  shortLabel: string;
};

type LanguageToggleProps = {
  options: LanguageToggleOption[];
  value: AppLanguage;
  onChange: (language: AppLanguage) => void;
};

export function LanguageToggle({
  options,
  value,
  onChange,
}: LanguageToggleProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const activeIndex = useMemo(
    () => Math.max(options.findIndex((option) => option.code === value), 0),
    [options, value],
  );
  const segmentWidth = trackWidth > 0 ? trackWidth / Math.max(options.length, 1) : 0;

  useEffect(() => {
    if (!segmentWidth) {
      return;
    }

    Animated.timing(translateX, {
      toValue: segmentWidth * activeIndex,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, segmentWidth, translateX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      className="overflow-hidden rounded-[28px] border border-white/80 bg-[#fff8f6]/90 p-1.5"
      style={{
        shadowColor: '#d97897',
        shadowOpacity: 0.14,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
      }}
    >
      {segmentWidth ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 6,
            left: 6,
            width: segmentWidth - 6,
            height: 72,
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={[
              'rgba(255,255,255,0.92)',
              'rgba(255,244,248,0.88)',
              'rgba(248,220,230,0.78)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.95)',
              shadowColor: '#c97b95',
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 3,
            }}
          >
            <View
              style={{
                marginHorizontal: 12,
                marginTop: 9,
                height: 1,
                backgroundColor: 'rgba(255,255,255,0.95)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                height: 18,
                width: 18,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.72)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.9)',
              }}
            />
          </LinearGradient>
        </Animated.View>
      ) : null}

      <View className="flex-row">
        {options.map((option, index) => {
          const active = option.code === value;

          return (
            <Pressable
              key={option.code}
              onPress={() => onChange(option.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                flex: 1,
                minHeight: 72,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 12,
              }}
            >
              <View className="items-center">
                <Text
                  className={active ? 'font-extra text-charcoal' : 'font-extra text-charcoal'}
                  style={{
                    fontSize: 18,
                    letterSpacing: 1.2,
                  }}
                >
                  {option.shortLabel}
                </Text>
                <Text
                  className={active ? 'font-medium text-charcoal/72' : 'font-medium text-mist'}
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    letterSpacing: 0.3,
                  }}
                >
                  {option.label}
                </Text>
              </View>

              {active ? (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 9,
                    alignSelf: 'center',
                    height: 4,
                    width: 26,
                    borderRadius: 999,
                    backgroundColor: '#d889a4',
                  }}
                />
              ) : index < options.length - 1 ? (
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 18,
                    bottom: 18,
                    width: 1,
                    backgroundColor: 'rgba(124,104,108,0.12)',
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
