import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LayoutState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const useLayout = create<LayoutState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
      setMobileOpen: (open) => set({ mobileOpen: open }),
    }),
    { name: "events-layout", partialize: (s) => ({ collapsed: s.collapsed }) },
  ),
);
