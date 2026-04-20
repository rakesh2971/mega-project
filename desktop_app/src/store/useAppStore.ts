import { create } from "zustand";

// ── Types ─────────────────────────────────────────────────────────────────

export type AvatarMood = "neutral" | "happy" | "focused" | "concerned" | "excited";
export type UserStatus = "online" | "focusing" | "do not disturb";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: UserStatus;
}

export interface AppState {
  // ── User ─────────────────────────────────────────────────────────
  user: User | null;
  setUser: (user: User | null) => void;

  // ── Avatar ───────────────────────────────────────────────────────
  avatarMood: AvatarMood;
  setAvatarMood: (mood: AvatarMood) => void;
  isAvatarFloating: boolean;
  setAvatarFloating: (floating: boolean) => void;

  // ── Connection ───────────────────────────────────────────────────
  isConnected: boolean;
  setConnected: (connected: boolean) => void;
  wsStatus: "connecting" | "connected" | "disconnected" | "error";
  setWsStatus: (status: AppState["wsStatus"]) => void;

  // ── Kill Switch ──────────────────────────────────────────────────
  killSwitchActive: boolean;
  setKillSwitchActive: (active: boolean) => void;

  // ── Navigation ───────────────────────────────────────────────────
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // ── Theme (future use) ───────────────────────────────────────────
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  // ── Voice ────────────────────────────────────────────────────────
  isListening: boolean;
  setListening: (listening: boolean) => void;
  isSpeaking: boolean;
  setSpeaking: (speaking: boolean) => void;
}

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
