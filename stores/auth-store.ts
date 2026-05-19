import { create } from 'zustand';
import { AuthUser, login, logout, me, register } from '@/lib/api/auth-api';
import {
  clearStoredTokens,
  getStoredTokens,
  storeTokens,
} from '@/lib/storage/token-storage';

type AuthStatus = 'booting' | 'signed_out' | 'signed_in';

function isMobileAllowedRole(role: AuthUser['role']): boolean {
  return role === 'CONSUMER';
}

function buildMobileRoleError(role: AuthUser['role']): Error {
  switch (role) {
    case 'ADMIN':
      return new Error(
        'Admin accounts are only supported in the admin web dashboard.',
      );
    case 'B2B_PHARMACY':
      return new Error(
        'Pharmacy accounts will be available after the B2B mobile dashboard is released.',
      );
    case 'B2B_DERMATOLOGIST':
      return new Error(
        'Dermatologist accounts will be available after the B2B mobile dashboard is released.',
      );
    default:
      return new Error('This account is not supported in the mobile app.');
  }
}

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
    fullName?: string;
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

      if (!isMobileAllowedRole(user.role)) {
        await clearStoredTokens();
        set({
          status: 'signed_out',
          user: null,
          accessToken: null,
          refreshToken: null,
        });
        return;
      }

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

    if (!isMobileAllowedRole(result.user.role)) {
      throw buildMobileRoleError(result.user.role);
    }

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

    if (!isMobileAllowedRole(result.user.role)) {
      throw buildMobileRoleError(result.user.role);
    }

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
