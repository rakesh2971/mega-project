// ── User Types ────────────────────────────────────────────────────────────────

export type UserStatus = "online" | "focusing" | "do not disturb";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: UserStatus;
}
