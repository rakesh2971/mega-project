// ── App-level Types ───────────────────────────────────────────────────────────
import type { AvatarMood } from "./avatar";
import type { User } from "./user";

export type WsStatus = "connecting" | "connected" | "disconnected" | "error";
export type Theme = "light" | "dark";

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
  wsStatus: WsStatus;
  setWsStatus: (status: WsStatus) => void;

  // ── Kill Switch ──────────────────────────────────────────────────
  killSwitchActive: boolean;
  setKillSwitchActive: (active: boolean) => void;

  // ── Navigation ───────────────────────────────────────────────────
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // ── Theme ────────────────────────────────────────────────────────
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // ── Voice ────────────────────────────────────────────────────────
  isListening: boolean;
  setListening: (listening: boolean) => void;
  isSpeaking: boolean;
  setSpeaking: (speaking: boolean) => void;
}
