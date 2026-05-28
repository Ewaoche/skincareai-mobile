import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { resetPassword } from '@/lib/api/auth-api';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { useResponsiveLayout } from '@/components/ui/responsive';
import { useI18n } from '@/lib/i18n';

export default function ResetPasswordScreen() {
  const layout = useResponsiveLayout();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await resetPassword({ email, otp, password });
      setMessage(response.message);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 900);
    } catch {
      setError(t('auth.reset.errorDefault'));
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
                eyebrow={t('auth.reset.eyebrow')}
                title={t('auth.reset.title')}
                body={t('auth.reset.body')}
              />

              <GlassCard>
                <View className="gap-5">
                  <Input
                    label={t('auth.reset.email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.reset.emailPlaceholder')}
                    keyboardType="email-address"
                  />
                  <Input
                    label={t('auth.reset.code')}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder={t('auth.reset.codePlaceholder')}
                    keyboardType="numeric"
                  />
                  <Input
                    label={t('auth.reset.password')}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.reset.passwordPlaceholder')}
                    secureTextEntry
                    showPasswordToggle
                  />
                  {message ? (
                    <Text className="font-sans text-sm text-mint">{message}</Text>
                  ) : null}
                  {error ? (
                    <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                  ) : null}
                  <Button
                    label={submitting ? t('auth.reset.submitting') : t('auth.reset.submit')}
                    onPress={() => void handleSubmit()}
                    disabled={submitting}
                    style={{ borderRadius: 999 }}
                  />
                </View>
              </GlassCard>
            </View>

            <View style={{ width: '100%', maxWidth: layout.isTablet ? 760 : 640, marginTop: 28 }}>
              <Link href="/(auth)/login" asChild>
                <Text className="text-center font-medium text-sm text-charcoal">
                  {t('auth.reset.backTo')}{' '}
                  <Text className="text-roseDeep">{t('auth.reset.login')}</Text>
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
