"use client";

import { create } from "zustand";

interface UIState {
  mobileMenuOpen: boolean;
  searchOpen: boolean;
  cartOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setCartOpen: (open: boolean) => void;
  closeOverlays: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  searchOpen: false,
  cartOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  closeOverlays: () => set({ mobileMenuOpen: false, searchOpen: false, cartOpen: false }),
}));
