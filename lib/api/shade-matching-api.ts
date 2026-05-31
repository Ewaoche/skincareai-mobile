import axios from 'axios';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
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

const MAX_UPLOAD_LONG_SIDE_PX = 1920;
const SUPPORTED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export type ShadeProductType = 'FOUNDATION' | 'CONCEALER';
export type ShadeUndertone = 'COOL' | 'WARM' | 'NEUTRAL' | 'OLIVE';
export type ShadeDepthBand =
  | 'FAIR'
  | 'LIGHT'
  | 'LIGHT_MEDIUM'
  | 'MEDIUM'
  | 'TAN'
  | 'DEEP'
  | 'RICH_DEEP';

export type ShadeProduct = {
  id: string;
  brand: string;
  productLine: string;
  productType: ShadeProductType;
  shadeName: string;
  shadeCode: string | null;
  undertone: ShadeUndertone;
  depthBand: ShadeDepthBand;
  finish: string | null;
  coverage: string | null;
  priceEur: string | null;
  productUrl: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  region: string | null;
  labL: number | null;
  labA: number | null;
  labB: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShadeMatchProfile = {
  id: string;
  selfieUrl: string;
  status: string;
  undertone: ShadeUndertone | null;
  depthBand: ShadeDepthBand | null;
  confidenceScore: number;
  labL: number | null;
  labA: number | null;
  labB: number | null;
  finishPreference: string | null;
  coveragePreference: string | null;
  requestedProductTypes: ShadeProductType[];
  completedAt: string | null;
  createdAt: string;
};

export type ShadeMatchResultItem = {
  id: string;
  rank: number;
  matchScore: number;
  confidenceScore: number;
  reasonSummary: string;
  shadeProduct: ShadeProduct;
};

export type SavedShadeItem = {
  id: string;
  notes: string | null;
  createdAt: string;
  profileId: string | null;
  shadeProduct: ShadeProduct;
};

export async function startShadeMatching(payload: {
  asset: {
    uri: string;
    fileName?: string | null;
    mimeType?: string | null;
    width?: number | null;
    height?: number | null;
  };
  faceBounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
  productTypes?: ShadeProductType[];
  finishPreference?: string;
  coveragePreference?: string;
}): Promise<ShadeMatchProfile> {
  const normalizedAsset = await normalizeAsset(payload.asset);
  const formData = new FormData();

  payload.productTypes?.forEach((type) => {
    formData.append('productTypes', type);
  });

  if (payload.finishPreference) {
    formData.append('finishPreference', payload.finishPreference);
  }

  if (payload.coveragePreference) {
    formData.append('coveragePreference', payload.coveragePreference);
  }

  if (payload.faceBounds) {
    formData.append('faceLeft', String(payload.faceBounds.left));
    formData.append('faceTop', String(payload.faceBounds.top));
    formData.append('faceWidth', String(payload.faceBounds.width));
    formData.append('faceHeight', String(payload.faceBounds.height));
  }

  formData.append('selfie', {
    uri: normalizedAsset.uri,
    name: normalizedAsset.fileName,
    type: normalizedAsset.mimeType,
  } as never);

  const response = await apiClient.post<ApiEnvelope<ShadeMatchProfile>>(
    '/shade-matching/start',
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

export async function getShadeMatchProfile(
  profileId: string,
): Promise<ShadeMatchProfile> {
  const response = await apiClient.get<ApiEnvelope<ShadeMatchProfile>>(
    `/shade-matching/${profileId}`,
  );

  return response.data.data;
}

export async function getShadeMatchResults(
  profileId: string,
): Promise<{ profileId: string; items: ShadeMatchResultItem[] }> {
  const response = await apiClient.get<
    ApiEnvelope<{ profileId: string; items: ShadeMatchResultItem[] }>
  >(`/shade-matching/${profileId}/results`);

  return response.data.data;
}

export async function getSavedShadeShelf(): Promise<SavedShadeItem[]> {
  const response = await apiClient.get<ApiEnvelope<SavedShadeItem[]>>(
    '/shade-shelf',
  );

  return response.data.data;
}

export async function saveShadeToShelf(payload: {
  shadeProductId: string;
  profileId?: string;
  notes?: string;
}): Promise<SavedShadeItem> {
  const response = await apiClient.post<ApiEnvelope<SavedShadeItem>>(
    '/shade-shelf',
    payload,
  );

  return response.data.data;
}

export async function removeSavedShade(savedShadeId: string): Promise<void> {
  await apiClient.delete(`/shade-shelf/${savedShadeId}`);
}

export function getShadeApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
    const payload = error.response?.data;
    const backendMessage = payload?.error?.message ?? payload?.message;
    if (backendMessage) {
      return backendMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'We could not complete shade matching right now.';
}

async function normalizeAsset(asset: {
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
  const longSide = width && height ? Math.max(width, height) : null;
  const needsResize = longSide !== null && longSide > MAX_UPLOAD_LONG_SIDE_PX;
  const needsFormatNormalization =
    !mimeType || !SUPPORTED_IMAGE_MIME_TYPES.has(mimeType);

  if (!needsResize && !needsFormatNormalization) {
    return {
      uri: asset.uri,
      fileName: ensureFileName(asset.fileName, mimeType),
      mimeType,
    };
  }

  const resizeAction =
    width && height && needsResize
      ? width >= height
        ? [{ resize: { width: MAX_UPLOAD_LONG_SIDE_PX } }]
        : [{ resize: { height: MAX_UPLOAD_LONG_SIDE_PX } }]
      : [];

  const result = await manipulateAsync(asset.uri, resizeAction, {
    compress: 0.9,
    format: SaveFormat.JPEG,
  });

  return {
    uri: result.uri,
    fileName: ensureFileName(asset.fileName, 'image/jpeg'),
    mimeType: 'image/jpeg',
  };
}

function ensureFileName(
  fileName?: string | null,
  mimeType?: string | null,
): string {
  const baseName = fileName?.replace(/\.[^.]+$/, '') || `shade-selfie-${Date.now()}`;
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  return `${baseName}.${extension}`;
}
