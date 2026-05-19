import axios from 'axios';
import {
  manipulateAsync,
  SaveFormat,
} from 'expo-image-manipulator';
import { apiClient } from './client';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

type ApiErrorEnvelope = {
  success?: false;
  message?: string;
  error?: {
    message?: string;
  };
};

const MAX_ANALYSIS_LONG_SIDE_PX = 1920;
const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export type AnalysisScores = {
  acne: number;
  pigmentation: number;
  skinTone: number;
  pores: number;
  moisture: number;
  oiliness: number;
  wrinkles: number;
};

export type AnalysisConcernMask = {
  concern: string;
  urls: string[];
};

export type AnalysisResult = {
  analysisId: string;
  selfieUrl: string;
  faceMapUrl: string | null;
  concernMasks: AnalysisConcernMask[];
  scores: AnalysisScores;
  provider: 'PERFECT_CORP';
  capturedAt: string;
  rawAvailable: boolean;
  clientId: string | null;
};

export type AnalysisHistoryResponse = {
  items: AnalysisResult[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AnalysisRecommendationItem = {
  recommendationId: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  targetConcern: string;
  reasoningSummary: string;
  rank: number;
  buyUrl: string;
  source: string;
  category: string | null;
  priceEur: string | null;
};

export type AnalysisRecommendationsResponse = {
  analysisId: string;
  items: AnalysisRecommendationItem[];
};

export async function startAnalysis(payload: {
  asset: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
  };
  clientId?: string;
}): Promise<AnalysisResult> {
  const normalizedAsset = await normalizeAnalysisAsset(payload.asset);
  const formData = new FormData();

  if (payload.clientId) {
    formData.append('clientId', payload.clientId);
  }

  formData.append('selfie', {
    uri: normalizedAsset.uri,
    name: normalizedAsset.fileName ?? `selfie-${Date.now()}.jpg`,
    type: normalizedAsset.mimeType ?? 'image/jpeg',
  } as never);

  const response = await apiClient.post<ApiEnvelope<AnalysisResult>>(
    '/analysis/start',
    formData,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    },
  );

  return response.data.data;
}

async function normalizeAnalysisAsset(asset: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
}): Promise<{
  uri: string;
  fileName: string;
  mimeType: string;
}> {
  const width = asset.width ?? null;
  const height = asset.height ?? null;
  const mimeType = asset.mimeType ?? null;
  const longSide =
    width && height ? Math.max(width, height) : null;
  const needsResize =
    longSide !== null && longSide > MAX_ANALYSIS_LONG_SIDE_PX;
  const needsFormatNormalization =
    !mimeType || !SUPPORTED_IMAGE_MIME_TYPES.has(mimeType);

  if (!needsResize && !needsFormatNormalization) {
    return {
      uri: asset.uri,
      fileName: ensureUploadFileName(asset.fileName, mimeType),
      mimeType,
    };
  }

  const resizeAction =
    width && height && needsResize
      ? width >= height
        ? [{ resize: { width: MAX_ANALYSIS_LONG_SIDE_PX } }]
        : [{ resize: { height: MAX_ANALYSIS_LONG_SIDE_PX } }]
      : [];

  const result = await manipulateAsync(asset.uri, resizeAction, {
    compress: 0.9,
    format: SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    fileName: ensureUploadFileName(asset.fileName, 'image/jpeg'),
    mimeType: 'image/jpeg',
  };
}

function ensureUploadFileName(
  fileName?: string | null,
  mimeType?: string | null,
): string {
  const baseName = fileName?.replace(/\.[^.]+$/, '') || `selfie-${Date.now()}`;
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  return `${baseName}.${extension}`;
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    const payload = error.response?.data;
    const backendMessage = payload?.error?.message ?? payload?.message;

    if (backendMessage) {
      return backendMessage;
    }

    if (error.code === 'ECONNABORTED') {
      return 'The live analysis took too long to respond. Please try again.';
    }

    if (error.message === 'Network Error') {
      return 'The selfie upload could not reach the live API. Please check your connection and try again.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not complete the analysis right now.';
}

export async function getAnalysisHistory(params?: {
  page?: number;
  limit?: number;
}): Promise<AnalysisHistoryResponse> {
  const response = await apiClient.get<ApiEnvelope<AnalysisHistoryResponse>>(
    '/analysis/history',
    {
      params,
    },
  );

  return response.data.data;
}

export async function getAnalysisById(
  analysisId: string,
): Promise<AnalysisResult> {
  const response = await apiClient.get<ApiEnvelope<AnalysisResult>>(
    `/analysis/${analysisId}`,
  );

  return response.data.data;
}

export async function getAnalysisRecommendations(
  analysisId: string,
): Promise<AnalysisRecommendationsResponse> {
  const response = await apiClient.get<ApiEnvelope<AnalysisRecommendationsResponse>>(
    `/analysis/${analysisId}/recommendations`,
  );

  return response.data.data;
}
