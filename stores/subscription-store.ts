import { create } from 'zustand';
import {
  CurrentSubscription,
  getCurrentSubscription,
  getSubscriptionUsage,
  SubscriptionUsage,
} from '@/lib/api/subscriptions-api';

type SubscriptionStore = {
  current: CurrentSubscription | null;
  usage: SubscriptionUsage | null;
  error: string | null;
  refresh: () => Promise<void>;
  clear: () => void;
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  current: null,
  usage: null,
  error: null,
  refresh: async () => {
    try {
      const [current, usage] = await Promise.all([
        getCurrentSubscription(),
        getSubscriptionUsage(),
      ]);

      set({ current, usage, error: null });
    } catch (error) {
      set({
        current: null,
        usage: null,
        error: 'We could not load your subscription details right now.',
      });
      throw error;
    }
  },
  clear: () => set({ current: null, usage: null, error: null }),
}));
