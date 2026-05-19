import { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { useResponsiveLayout } from '@/components/ui/responsive';

type AuthScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  body: string;
  heroTitle: string;
  heroBody: string;
  footer?: ReactNode;
}>;

export function AuthScreenShell({
  eyebrow,
  title,
  body,
  heroTitle,
  heroBody,
  footer,
  children,
}: AuthScreenShellProps) {
  const { height } = useWindowDimensions();
  const layout = useResponsiveLayout();
  const compact = height < 760;
  const heroHeight = layout.isTablet ? 280 : compact ? 176 : 216;

  return (
    <GradientScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingHorizontal: layout.horizontalPadding,
              paddingTop: compact ? 6 : 10,
              paddingBottom: 24,
            }}
          >
            <View
              style={{
                width: '100%',
                maxWidth: layout.isTablet ? 980 : 680,
                gap: layout.isTablet ? 28 : 24,
              }}
            >
              <View
                style={{ height: heroHeight }}
                className="overflow-hidden rounded-[32px] border border-white/70 bg-white/40"
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.96)', 'rgba(246,209,193,0.82)', 'rgba(248,240,255,0.92)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ flex: 1 }}
                >
                  <View className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blush/20" />
                  <View className="absolute left-5 top-6 h-16 w-16 rounded-full bg-peach/60" />
                  <View
                    className="absolute bottom-4 right-4 rounded-[24px] border border-white/70 bg-charcoal px-4 py-4"
                    style={{ width: layout.isTablet ? 156 : 132 }}
                  >
                    <Text className="font-medium text-[11px] uppercase tracking-[1.5px] text-white/65">
                      Confidence
                    </Text>
                    <Text className="mt-2 font-extra text-[28px] text-white">94%</Text>
                    <Text className="mt-1 font-sans text-xs leading-4 text-white/75">
                      Clearer routine match
                    </Text>
                  </View>
                  <View className="flex-1 justify-between px-5 py-5">
                    <View className="rounded-pill self-start bg-white/80 px-4 py-2">
                      <Text className="font-medium text-[11px] uppercase tracking-[2px] text-roseDeep">
                        {eyebrow}
                      </Text>
                    </View>
                    <View
                      className="gap-2 rounded-[24px] border border-white/80 bg-white/78 p-4"
                      style={{ width: layout.isTablet ? '58%' : '68%' }}
                    >
                      <Text className="font-bold text-lg text-charcoal">{heroTitle}</Text>
                      <Text className="font-sans text-sm leading-5 text-mist">
                        {heroBody}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View className="gap-3">
                <Text className="font-medium text-xs uppercase tracking-[2px] text-roseDeep">
                  {eyebrow}
                </Text>
                <Text
                  className="font-extra text-charcoal"
                  style={{
                    fontSize: layout.isTablet ? 38 : 28,
                    lineHeight: layout.isTablet ? 44 : 34,
                  }}
                >
                  {title}
                </Text>
                <Text
                  className="font-sans text-mist"
                  style={{
                    fontSize: layout.isTablet ? 17 : 15,
                    lineHeight: layout.isTablet ? 30 : 28,
                    maxWidth: layout.isTablet ? 720 : undefined,
                  }}
                >
                  {body}
                </Text>
              </View>

              {children}
            </View>

            {footer ? (
              <View style={{ width: '100%', maxWidth: layout.isTablet ? 980 : 680, paddingTop: 20 }}>
                {footer}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
