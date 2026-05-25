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

export default function ResetPasswordScreen() {
  const layout = useResponsiveLayout();
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
      setError('We could not reset your password with those details.');
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
                eyebrow="New Password"
                title="Choose a new password"
                body="Enter your email, verification code, and new password to regain access to your account."
              />

              <GlassCard>
                <View className="gap-5">
                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                  />
                  <Input
                    label="Verification code"
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="123456"
                    keyboardType="numeric"
                  />
                  <Input
                    label="New password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
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
                    label={submitting ? 'Resetting Password...' : 'Reset Password'}
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
                  Back to <Text className="text-roseDeep">login</Text>
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
