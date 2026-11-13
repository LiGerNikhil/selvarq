import { create } from "zustand";

export type ToastTone = "neutral" | "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  /** Milliseconds before auto-dismiss. */
  duration: number;
}

export type ToastInput = Omit<ToastItem, "id" | "tone" | "duration"> &
  Partial<Pick<ToastItem, "tone" | "duration">>;

interface ToastState {
  toasts: ToastItem[];
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
}

let sequence = 0;
const MAX_VISIBLE = 3;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (input) => {
    sequence += 1;
    const id = `toast-${Date.now().toString(36)}-${sequence}`;
    const item: ToastItem = { tone: "neutral", duration: 4500, ...input, id };
    set((state) => ({ toasts: [...state.toasts, item].slice(-MAX_VISIBLE) }));
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

type ToastOptions = Omit<ToastInput, "title" | "tone">;

/** Imperative API for use in event handlers and actions: toast.success("Added to bag"). */
export const toast = {
  show: (title: string, options?: ToastOptions) => useToastStore.getState().push({ title, ...options }),
  success: (title: string, options?: ToastOptions) =>
    useToastStore.getState().push({ title, tone: "success", ...options }),
  error: (title: string, options?: ToastOptions) =>
    useToastStore.getState().push({ title, tone: "error", duration: 7000, ...options }),
  info: (title: string, options?: ToastOptions) =>
    useToastStore.getState().push({ title, tone: "info", ...options }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
