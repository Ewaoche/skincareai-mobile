import { create } from 'zustand';
import {
  AnalysisResult,
  getAnalysisHistory,
  getApiErrorMessage,
  startAnalysis,
} from '@/lib/api/analysis-api';

type UploadAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
};

type AnalysisStore = {
  latest: AnalysisResult | null;
  current: AnalysisResult | null;
  pendingAsset: UploadAsset | null;
  latestLoading: boolean;
  submitting: boolean;
  latestError: string | null;
  submitError: string | null;
  refreshLatest: () => Promise<void>;
  submitAnalysis: (payload: {
    asset: UploadAsset;
    clientId?: string;
  }) => Promise<AnalysisResult>;
  setPendingAsset: (asset: UploadAsset | null) => void;
  setCurrent: (analysis: AnalysisResult | null) => void;
  clear: () => void;
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  latest: null,
  current: null,
  pendingAsset: null,
  latestLoading: false,
  submitting: false,
  latestError: null,
  submitError: null,
  refreshLatest: async () => {
    set({ latestLoading: true, latestError: null });

    try {
      const history = await getAnalysisHistory({ page: 1, limit: 1 });
      set({
        latest: history.items[0] ?? null,
        latestLoading: false,
      });
    } catch {
      set({
        latestLoading: false,
        latestError: 'We could not load your latest analysis right now.',
      });
    }
  },
  submitAnalysis: async (payload) => {
    set({ submitting: true, submitError: null });

    try {
      const result = await startAnalysis(payload);
      set({
        current: result,
        latest: result,
        pendingAsset: null,
        submitting: false,
      });
      return result;
    } catch (error) {
      const message = getApiErrorMessage(error);

      set({
        submitting: false,
        submitError: message,
      });
      throw error;
    }
  },
  setPendingAsset: (asset) =>
    set({
      pendingAsset: asset,
      submitError: null,
    }),
  setCurrent: (analysis) => set({ current: analysis }),
  clear: () =>
    set({
      latest: null,
      current: null,
      pendingAsset: null,
      latestLoading: false,
      submitting: false,
      latestError: null,
      submitError: null,
    }),
}));
