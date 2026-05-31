import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  items: ToastItem[];
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

function uid() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
}

export const useToast = create<ToastState>((set) => ({
  items: [],

  success: (message) => {
    const id = uid();
    set((s) => ({ items: [...s.items, { id, type: "success", message }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 4000);
  },

  error: (message) => {
    const id = uid();
    set((s) => ({ items: [...s.items, { id, type: "error", message }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 5000);
  },

  info: (message) => {
    const id = uid();
    set((s) => ({ items: [...s.items, { id, type: "info", message }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((t) => t.id !== id) })), 4000);
  },

  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}));
