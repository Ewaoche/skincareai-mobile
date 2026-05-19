import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function IndexScreen() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  if (status === 'booting') {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (status === 'signed_in') {
    return user?.role === 'CONSUMER'
      ? <Redirect href="/(app)/(tabs)/home" />
      : <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
