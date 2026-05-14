import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { GradientScreen } from '@/components/ui/gradient-screen';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterScreen() {
  const signUp = useAuthStore((state) => state.signUp);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signUp({ firstName, lastName, email, password });
      router.replace('/(app)/(tabs)/home');
    } catch {
      setError('We could not create your account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GradientScreen>
      <View className="flex-1 px-6 pt-6 pb-8">
        <View className="gap-8 pt-8">
          <SectionHeading
            eyebrow="Create Account"
            title="Start your personalized skincare experience."
            body="Create your account to unlock AI skin analysis and premium skin tracking."
          />

          <GlassCard>
            <View className="gap-5">
              <Input
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ada"
                autoCapitalize="words"
              />
              <Input
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Lovelace"
                autoCapitalize="words"
              />
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
                placeholder="At least 8 characters"
                secureTextEntry
              />
              {error ? (
                <Text className="font-sans text-sm text-roseDeep">{error}</Text>
              ) : null}
              <Button
                label={submitting ? 'Creating Account...' : 'Create Account'}
                onPress={() => void handleRegister()}
                disabled={submitting}
              />
            </View>
          </GlassCard>
        </View>

        <View className="mt-auto">
          <Link href="/(auth)/login" asChild>
            <Text className="text-center font-medium text-sm text-charcoal">
              Already have an account? Sign in
            </Text>
          </Link>
        </View>
      </View>
    </GradientScreen>
  );
}
