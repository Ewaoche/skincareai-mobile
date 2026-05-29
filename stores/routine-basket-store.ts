import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AnalysisRoutineBasketItem } from '@/lib/api/analysis-api';

type RoutineBasketStore = {
  items: AnalysisRoutineBasketItem[];
  addRoutineItems: (items: AnalysisRoutineBasketItem[]) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useRoutineBasketStore = create<RoutineBasketStore>()(
  persist(
    (set) => ({
      items: [],
      addRoutineItems: (items) =>
        set((state) => {
          const nextItems = [...state.items];

          for (const item of items) {
            if (
              !nextItems.some(
                (existing) => existing.productId === item.productId,
              )
            ) {
              nextItems.push(item);
            }
          }

          return {
            items: nextItems,
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'skincareai-routine-basket',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);
