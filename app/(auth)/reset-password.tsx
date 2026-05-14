import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { resetPassword } from '@/lib/api/auth-api';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';

export default function ResetPasswordScreen() {
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
      <View className="flex-1 px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="New Password"
            title="Secure your account again."
            body="Enter your email, six-digit code, and a new password to continue your skincare journey."
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
              />
            </View>
          </GlassCard>
        </View>

        <View className="mt-auto">
          <Link href="/(auth)/login" asChild>
            <Text className="text-center font-medium text-sm text-charcoal">
              Back to login
            </Text>
          </Link>
        </View>
      </View>
    </GradientScreen>
  );
}
