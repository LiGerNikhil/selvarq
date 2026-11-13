"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPersistStorage } from "./persist-storage";

interface RecentlyViewedState {
  productIds: string[];
  add: (productId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      add: (productId) => set((state) => ({
        productIds: [productId, ...state.productIds.filter((id) => id !== productId)].slice(0, 8),
      })),
    }),
    {
      name: "selvarq-recently-viewed",
      storage: createJSONStorage(getPersistStorage),
      version: 1,
      partialize: (state) => ({ productIds: state.productIds }),
    },
  ),
);
