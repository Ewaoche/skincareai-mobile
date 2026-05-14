import { create } from 'zustand';
import { AuthUser, login, logout, me, register } from '@/lib/api/auth-api';
import {
  clearStoredTokens,
  getStoredTokens,
  storeTokens,
} from '@/lib/storage/token-storage';

type AuthStatus = 'booting' | 'signed_out' | 'signed_in';

type AuthStore = {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  bootstrap: () => Promise<void>;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  status: 'booting',
  user: null,
  accessToken: null,
  refreshToken: null,
  bootstrap: async () => {
    const tokens = await getStoredTokens();

    if (!tokens.accessToken || !tokens.refreshToken) {
      set({
        status: 'signed_out',
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      return;
    }

    try {
      const user = await me();
      set({
        status: 'signed_in',
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch {
      await clearStoredTokens();
      set({
        status: 'signed_out',
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },
  signIn: async (payload) => {
    const result = await login(payload);
    await storeTokens(result);
    set({
      status: 'signed_in',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  },
  signUp: async (payload) => {
    const result = await register(payload);
    await storeTokens(result);
    set({
      status: 'signed_in',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  },
  signOut: async () => {
    try {
      if (get().accessToken) {
        await logout();
      }
    } catch {
      // Local sign-out should still complete even if the backend revoke call fails.
    } finally {
      await clearStoredTokens();
      set({
        status: 'signed_out',
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },
}));
