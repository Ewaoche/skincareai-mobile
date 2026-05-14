import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function AppLayout() {
  const status = useAuthStore((state) => state.status);

  if (status === 'booting') {
    return null;
  }

  if (status !== 'signed_in') {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
