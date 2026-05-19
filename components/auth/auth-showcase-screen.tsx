import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveLayout } from '@/components/ui/responsive';

type AuthShowcaseScreenProps = PropsWithChildren<{
  title: string;
  body: string;
  footer: ReactNode;
}>;

export function AuthShowcaseScreen({
  title,
  body,
  footer,
  children,
}: AuthShowcaseScreenProps) {
  const { height } = useWindowDimensions();
  const layout = useResponsiveLayout();
  const compact = height < 760;

  return (
    <GradientScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingHorizontal: layout.horizontalPadding,
              paddingTop: 18,
              paddingBottom: 28,
            }}
          >
            <View style={{ width: '100%', maxWidth: layout.isTablet ? 960 : 680 }}>
            <View className="items-center">
              <View className="h-24 w-24 rounded-full bg-lavender/20" />
              <View className="-mt-10 ml-28 h-20 w-20 rounded-full bg-peach/50" />
              <View className="-mt-6 self-start h-16 w-16 rounded-full bg-blush/15" />
            </View>

            <View className={`items-center ${compact ? 'mt-2' : 'mt-6'}`}>
              <Text
                className={`text-center font-extra text-charcoal ${
                  layout.isTablet
                    ? 'text-[56px] leading-[58px]'
                    : compact
                      ? 'text-[40px] leading-[42px]'
                      : 'text-[48px] leading-[50px]'
                }`}
              >
                {title}
              </Text>
              <Text
                className="mt-4 text-center font-sans text-charcoal/85"
                style={{
                  maxWidth: layout.isTablet ? 520 : 290,
                  fontSize: layout.isTablet ? 20 : 18,
                  lineHeight: layout.isTablet ? 34 : 28,
                }}
              >
                {body}
              </Text>
            </View>

            <View className={`mt-8 rounded-[30px] border border-white/75 bg-white/35 p-4 shadow-soft ${compact ? '' : 'mx-1'}`}>
              <View className="overflow-hidden rounded-[28px] border border-white/60">
                <LinearGradient
                  colors={['rgba(196,192,192,0.72)', 'rgba(171,168,168,0.78)', 'rgba(150,147,147,0.82)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingHorizontal: 16, paddingVertical: 20 }}
                >
                  {children}
                </LinearGradient>
              </View>
            </View>

            <View className="mt-8 items-center">{footer}</View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
