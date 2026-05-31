import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  apply: () => void;
}

function setDom(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      toggle: () => {
        const next = get().theme === "light" ? "dark" : "light";
        setDom(next);
        set({ theme: next });
      },
      apply: () => setDom(get().theme),
    }),
    { name: "events-theme" },
  ),
);
