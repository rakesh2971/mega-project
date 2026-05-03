// ── Avatar Types ──────────────────────────────────────────────────────────────
// Single source of truth for all avatar-related types.
// Previously duplicated in useAppStore.ts (5 moods) and expressionMap.ts (7 moods).

export type AvatarMood =
  | "neutral"
  | "happy"
  | "excited"
  | "focused"
  | "concerned"
  | "sad"
  | "nervous";

export interface Live2DAvatarProps {
  mode?: "home" | "float";
  mood?: AvatarMood | string;
}

export interface UseLive2DOptions {
  /** A <div> ref — PIXI will create and append its own <canvas> inside it */
  containerRef: React.RefObject<HTMLDivElement>;
  modelPath: string;
  mood: AvatarMood | string;
  isSpeaking: boolean;
  lipSyncValue?: number;
  width?: number;
  height?: number;
}

export interface UseLive2DReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  playExpression: (name: string) => void;
  playMotion: (group: string, index?: number) => void;
  setParameter: (id: string, value: number) => void;
}
