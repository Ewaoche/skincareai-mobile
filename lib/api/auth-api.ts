import { apiClient } from './client';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export type AuthUser = {
  id: string;
  email: string;
  role: 'CONSUMER' | 'B2B_PHARMACY' | 'B2B_DERMATOLOGIST' | 'ADMIN';
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export async function register(payload: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post<ApiEnvelope<AuthResponse>>(
    '/auth/register',
    payload,
  );

  return response.data.data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiClient.post<ApiEnvelope<AuthResponse>>(
    '/auth/login',
    payload,
  );

  return response.data.data;
}

export async function forgotPassword(payload: { email: string }): Promise<{
  message: string;
}> {
  const response = await apiClient.post<ApiEnvelope<{ message: string }>>(
    '/auth/forgot-password',
    payload,
  );

  return response.data.data;
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ message: string }> {
  const response = await apiClient.post<ApiEnvelope<{ message: string }>>(
    '/auth/reset-password',
    payload,
  );

  return response.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function me(): Promise<AuthUser> {
  const response = await apiClient.get<ApiEnvelope<AuthUser>>('/auth/me');
  return response.data.data;
}
