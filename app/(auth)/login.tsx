import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { useResponsiveLayout } from '@/components/ui/responsive';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginScreen() {
  const layout = useResponsiveLayout();
  const { t } = useI18n();
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signIn({ email, password });
      router.replace('/(app)/(tabs)/home');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('auth.login.errorDefault'));
      }
    } finally {
      setSubmitting(false);
    }
  };

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
              paddingTop: 24,
              paddingBottom: 24,
            }}
          >
            <View style={{ width: '100%', maxWidth: layout.isTablet ? 760 : 640, gap: 28 }}>
              <SectionHeading
                eyebrow={t('auth.login.eyebrow')}
                title={t('auth.login.title')}
                body={t('auth.login.body')}
              />

              <GlassCard>
                <View className="gap-5">
                  <Input
                    label={t('auth.login.email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.login.emailPlaceholder')}
                    keyboardType="email-address"
                  />
                  <Input
                    label={t('auth.login.password')}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    secureTextEntry
                    showPasswordToggle
                  />
                  {error ? (
                    <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                  ) : null}
                  <Button
                    label={submitting ? t('auth.login.submitting') : t('auth.login.submit')}
                    onPress={() => void handleLogin()}
                    disabled={submitting}
                    style={{ borderRadius: 999 }}
                  />
                </View>
              </GlassCard>
            </View>

            <View style={{ width: '100%', maxWidth: layout.isTablet ? 760 : 640, marginTop: 28, gap: 16 }}>
              <Link href="/(auth)/forgot-password" asChild>
                <Text className="text-center font-medium text-sm text-charcoal">
                  {t('auth.login.forgotPassword')}
                </Text>
              </Link>
              <Link href="/(auth)/register" asChild>
                <Text className="text-center font-medium text-sm text-charcoal">
                  {t('auth.login.noAccount')}{' '}
                  <Text className="text-roseDeep">{t('auth.login.createOne')}</Text>
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
