"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getPersistStorage } from "./persist-storage";

export interface CartItem {
  productId: string;
  variantId: string;
  merchantId: string;
  name: string;
  imageId: string;
  color: string;
  size: string;
  unitPrice: number;
  mrp: number;
  quantity: number;
  stock?: number;
  priceConfirmed?: boolean;
}

export interface MerchantCart {
  merchantId: string;
  items: CartItem[];
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  updateItem: (variantId: string, patch: Partial<Pick<CartItem, "variantId" | "unitPrice" | "mrp" | "stock" | "priceConfirmed" | "color" | "size">>) => void;
  setCouponCode: (code: string) => void;
  clear: () => void;
}

export function groupCartItems(items: CartItem[]): MerchantCart[] {
  const grouped = new Map<string, CartItem[]>();
  for (const item of items) {
    const merchantItems = grouped.get(item.merchantId) ?? [];
    merchantItems.push(item);
    grouped.set(item.merchantId, merchantItems);
  }
  return [...grouped].map(([merchantId, merchantItems]) => ({
    merchantId,
    items: merchantItems,
    subtotal: merchantItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: "",
      addItem: (item) => set((state) => {
        const existing = state.items.find((line) => line.variantId === item.variantId);
        if (!existing) return { items: [...state.items, { ...item, quantity: Math.max(1, item.quantity) }] };
        return {
          items: state.items.map((line) =>
            line.variantId === item.variantId
              ? { ...line, quantity: line.quantity + Math.max(1, item.quantity) }
              : line,
          ),
        };
      }),
      removeItem: (variantId) => set((state) => ({
        items: state.items.filter((item) => item.variantId !== variantId),
      })),
      setQuantity: (variantId, quantity) => set((state) => ({
        items: quantity <= 0
          ? state.items.filter((item) => item.variantId !== variantId)
          : state.items.map((item) => item.variantId === variantId ? { ...item, quantity: Math.floor(quantity) } : item),
      })),
      updateItem: (variantId, patch) => set((state) => ({
        items: state.items.map((item) => item.variantId === variantId ? { ...item, ...patch } : item),
      })),
      setCouponCode: (couponCode) => set({ couponCode }),
      clear: () => set({ items: [], couponCode: "" }),
    }),
    {
      name: "selvarq-cart",
      storage: createJSONStorage(getPersistStorage),
      version: 1,
      partialize: (state) => ({ items: state.items, couponCode: state.couponCode }),
    },
  ),
);

let cachedItems: CartItem[] | undefined;
let cachedGroups: MerchantCart[] = [];

export function selectCartGroups(state: CartState): MerchantCart[] {
  if (state.items !== cachedItems) {
    cachedItems = state.items;
    cachedGroups = groupCartItems(state.items);
  }
  return cachedGroups;
}

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartSubtotal = (state: CartState): number =>
  state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
