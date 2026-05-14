import { Link } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { forgotPassword } from '@/lib/api/auth-api';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';

export default function ForgotPasswordScreen() {
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
      setError('We could not send the reset code right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GradientScreen>
      <View className="flex-1 px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="Reset Access"
            title="Request your reset code."
            body="Enter the email tied to your account and we will send your six-digit verification code."
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
              {message ? (
                <Text className="font-sans text-sm text-mint">{message}</Text>
              ) : null}
              {error ? (
                <Text className="font-sans text-sm text-roseDeep">{error}</Text>
              ) : null}
              <Button
                label={submitting ? 'Sending Code...' : 'Send Reset Code'}
                onPress={() => void handleSubmit()}
                disabled={submitting}
              />
            </View>
          </GlassCard>
        </View>

        <View className="mt-auto">
          <Link href="/(auth)/reset-password" asChild>
            <Text className="text-center font-medium text-sm text-charcoal">
              Already have the code? Reset password
            </Text>
          </Link>
        </View>
      </View>
    </GradientScreen>
  );
}
