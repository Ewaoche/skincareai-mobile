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
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterScreen() {
  const layout = useResponsiveLayout();
  const signUp = useAuthStore((state) => state.signUp);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await signUp({ fullName, email, password });
      router.replace('/(app)/(tabs)/home');
    } catch {
      setError('We could not create your account right now.');
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
                eyebrow="Create Account"
                title="Create your account"
                body="Save your results, follow your progress, and get a more personalized experience."
              />

              <GlassCard>
                <View className="gap-5">
                  <Input
                    label="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Ada Lovelace"
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
                    showPasswordToggle
                  />
                  {error ? (
                    <Text className="font-sans text-sm text-roseDeep">{error}</Text>
                  ) : null}
                  <Button
                    label={submitting ? 'Creating Account...' : 'Create Account'}
                    onPress={() => void handleRegister()}
                    disabled={submitting}
                    style={{ borderRadius: 999 }}
                  />
                </View>
              </GlassCard>
            </View>

            <View style={{ width: '100%', maxWidth: layout.isTablet ? 760 : 640, marginTop: 28 }}>
              <Link href="/(auth)/login" asChild>
                <Text className="text-center font-medium text-sm text-charcoal">
                  Already have an account? <Text className="text-roseDeep">Sign in</Text>
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientScreen>
  );
}
