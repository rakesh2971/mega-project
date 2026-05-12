// ── User Types ────────────────────────────────────────────────────────────────

export type UserStatus = "online" | "focusing" | "do not disturb";

export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_seed: string | null;
  created_at: string;
  // Computed helpers
  name: string; // display_name ?? username
}
