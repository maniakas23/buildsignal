import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User { id: string; email: string; name: string | null; organization: string | null; plan: string | null; }

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      theme: "system",
      setTheme: (theme) => set({ theme }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: "buildsignal-store" }
  )
);
