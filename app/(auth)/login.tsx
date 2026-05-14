import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginScreen() {
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
    } catch {
      setError('We could not sign you in with those details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GradientScreen>
      <View className="flex-1 px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="Welcome Back"
            title="Continue your skin journey."
            body="Sign in to view your subscription, start a new analysis, and track your latest results."
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
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry
              />
              {error ? (
                <Text className="font-sans text-sm text-roseDeep">{error}</Text>
              ) : null}
              <Button
                label={submitting ? 'Signing In...' : 'Sign In'}
                onPress={() => void handleLogin()}
                disabled={submitting}
              />
            </View>
          </GlassCard>
        </View>

        <View className="mt-auto gap-4">
          <Link href="/(auth)/forgot-password" asChild>
            <Text className="text-center font-medium text-sm text-charcoal">
              Forgot password?
            </Text>
          </Link>
          <Link href="/(auth)/register" asChild>
            <Text className="text-center font-medium text-sm text-charcoal">
              Create an account
            </Text>
          </Link>
        </View>
      </View>
    </GradientScreen>
  );
}
