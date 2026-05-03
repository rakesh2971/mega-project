import { create } from "zustand";
import type { AppState } from "@/types/app";

// Re-export types for backward compatibility (consumers can still import from here)
export type { AvatarMood } from "@/types/avatar";
export type { UserStatus, User } from "@/types/user";
export type { AppState } from "@/types/app";

// ── Store ─────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // User
  user: null,
  setUser: (user) => set({ user }),

  // Avatar
  avatarMood: "neutral",
  setAvatarMood: (avatarMood) => set({ avatarMood }),
  isAvatarFloating: false,
  setAvatarFloating: (isAvatarFloating) => set({ isAvatarFloating }),

  // Connection
  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),
  wsStatus: "disconnected",
  setWsStatus: (wsStatus) => set({ wsStatus }),

  // Kill Switch
  killSwitchActive: false,
  setKillSwitchActive: (killSwitchActive) => set({ killSwitchActive }),

  // Navigation
  currentPage: "/",
  setCurrentPage: (currentPage) => set({ currentPage }),
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  // Theme
  theme: "light",
  setTheme: (theme) => set({ theme }),

  // Voice
  isListening: false,
  setListening: (isListening) => set({ isListening }),
  isSpeaking: false,
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
}));
