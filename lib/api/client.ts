import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { getStoredTokens, storeTokens, clearStoredTokens } from '@/lib/storage/token-storage';

function getFallbackApiBaseUrl() {
  const expoConfig = Constants.expoConfig as
    | ({ extra?: { apiBaseUrl?: string }; hostUri?: string } & Record<string, unknown>)
    | null;

  const explicitBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ?? expoConfig?.extra?.apiBaseUrl;

  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  const hostUri = expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];

  if (host) {
    return `http://${host}:3000/api`;
  }

  return 'http://localhost:3000/api';
}

const apiBaseUrl = getFallbackApiBaseUrl();

type RefreshResponse = {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const { accessToken } = await getStoredTokens();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const { refreshToken } = await getStoredTokens();

    if (!refreshToken) {
      await clearStoredTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post<RefreshResponse>(
        `${apiBaseUrl}/auth/refresh`,
        { refreshToken },
        { timeout: 15000 },
      );

      await storeTokens(refreshResponse.data.data);
      originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      await clearStoredTokens();
      return Promise.reject(refreshError);
    }
  },
);
