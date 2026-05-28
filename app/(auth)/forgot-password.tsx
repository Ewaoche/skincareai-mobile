import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { forgotPassword } from '@/lib/api/auth-api';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { useResponsiveLayout } from '@/components/ui/responsive';
import { useI18n } from '@/lib/i18n';

export default function ForgotPasswordScreen() {
  const layout = useResponsiveLayout();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const response = await forgotPassword({ email });
      setMessage(response.message);
    } catch {
      setError(t('auth.forgot.errorDefault'));
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
                eyebrow={t('auth.forgot.eyebrow')}
                title={t('auth.forgot.title')}
                body={t('auth.forgot.body')}
              />

              <GlassCard>
                <View className="gap-5">
                  <Input
                    label={t('auth.forgot.email')}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('auth.forgot.emailPlaceholder')}
                    keyboardType="email-address"
                  />
                  {message ? (
                    <Text className="font-sans text-sm text-mint">{message}</Text>
                  ) : null}
                  {error ? (
                    <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                  ) : null}
                  <Button
                    label={submitting ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
                    onPress={() => void handleSubmit()}
                    disabled={submitting}
                    style={{ borderRadius: 999 }}
                  />
                </View>
              </GlassCard>
            </View>

            <View style={{ width: '100%', maxWidth: layout.isTablet ? 760 : 640, marginTop: 28 }}>
              <Link href="/(auth)/reset-password" asChild>
                <Text className="text-center font-medium text-sm text-charcoal">
                  {t('auth.forgot.haveCode')}{' '}
                  <Text className="text-roseDeep">{t('auth.forgot.resetPassword')}</Text>
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
