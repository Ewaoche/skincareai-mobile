import axios from 'axios';
import { apiClient } from './client';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

type ApiErrorEnvelope = {
  success?: false;
  message?: string;
  error?: {
    message?: string | string[];
    code?: string;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  role: 'CONSUMER' | 'B2B_PHARMACY' | 'B2B_DERMATOLOGIST' | 'ADMIN';
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

function normalizeAuthError(error: unknown): Error {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    const payload = error.response?.data;
    const backendMessage = payload?.error?.message ?? payload?.message;
    const resolvedMessage = Array.isArray(backendMessage)
      ? backendMessage.join(', ')
      : backendMessage;

    if (error.response?.status === 403) {
      return new Error(
        'Your account has been blocked by an administrator. Please contact support if you think this is a mistake.',
      );
    }

    if (resolvedMessage) {
      return new Error(resolvedMessage);
    }

    if (error.message === 'Network Error') {
      return new Error(
        'We could not reach the server. Please check your internet connection and try again.',
      );
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error('We could not complete this request right now.');
}

export async function register(payload: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>(
      '/auth/register',
      payload,
    );

    return response.data.data;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>(
      '/auth/login',
      payload,
    );

    return response.data.data;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function forgotPassword(payload: { email: string }): Promise<{
  message: string;
}> {
  try {
    const response = await apiClient.post<ApiEnvelope<{ message: string }>>(
      '/auth/forgot-password',
      payload,
    );

    return response.data.data;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ message: string }> {
  try {
    const response = await apiClient.post<ApiEnvelope<{ message: string }>>(
      '/auth/reset-password',
      payload,
    );

    return response.data.data;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function me(): Promise<AuthUser> {
  try {
    const response = await apiClient.get<ApiEnvelope<AuthUser>>('/auth/me');
    return response.data.data;
  } catch (error) {
    throw normalizeAuthError(error);
  }
}
