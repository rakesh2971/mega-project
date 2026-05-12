import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Brain, Eye, EyeOff, Loader2, Sparkles, UserPlus, LogIn } from "lucide-react";
import { cn } from "@/lib/cn";
import type { User } from "@/types/user";

// ── Helper to map DbUser → User ───────────────────────────────────────────

export function mapDbUser(raw: any): User {
  return {
    id: raw.id,
    username: raw.username,
    display_name: raw.display_name ?? null,
    avatar_seed: raw.avatar_seed ?? null,
    created_at: raw.created_at,
    name: raw.display_name ?? raw.username,
  };
}

// ── Props ─────────────────────────────────────────────────────────────────

interface LoginProps {
  onLogin: (user: User) => void;
}

// ── Floating orb component (pure decorative) ──────────────────────────────

function Orb({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none",
        className
      )}
      style={style}
    />
  );
}

// ── Login Page ────────────────────────────────────────────────────────────

export default function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      let raw: any;
      if (mode === "login") {
        raw = await invoke("login_user", {
          username: username.trim(),
          password,
        });
      } else {
        raw = await invoke("register_user", {
          username: username.trim(),
          password,
          displayName: displayName.trim() || null,
        });
      }
      onLogin(mapDbUser(raw));
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-linear-to-br from-[hsl(258_60%_97%)] via-[hsl(240_50%_98%)] to-[hsl(181_40%_96%)]">
      {/* Decorative orbs */}
      <Orb className="w-96 h-96 bg-[hsl(258_100%_65%)] -top-20 -left-20" />
      <Orb className="w-72 h-72 bg-[hsl(181_84%_45%)] -bottom-16 -right-16" style={{ animationDelay: "1s" }} />
      <Orb className="w-48 h-48 bg-[hsl(258_100%_83%)] top-1/3 right-1/4" style={{ animationDelay: "2s" }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(258_100%_65%)] to-[hsl(181_84%_45%)] shadow-lg mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-[hsl(232_45%_16%)]">NeuroMate</h1>
          <p className="text-sm text-[hsl(232_20%_55%)] mt-1">Your AI wellness companion</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-[hsl(258_20%_90%)] rounded-2xl p-6 shadow-xl">
          {/* Mode toggle */}
          <div className="flex gap-1 bg-[hsl(258_30%_97%)] rounded-xl p-1 mb-6">
            <button
              type="button"
              id="btn-mode-login"
              onClick={() => { setMode("login"); setError(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-heading font-semibold transition-all",
                mode === "login"
                  ? "bg-white text-[hsl(232_45%_16%)] shadow-sm"
                  : "text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)]"
              )}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              type="button"
              id="btn-mode-register"
              onClick={() => { setMode("register"); setError(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-heading font-semibold transition-all",
                mode === "register"
                  ? "bg-white text-[hsl(232_45%_16%)] shadow-sm"
                  : "text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)]"
              )}
            >
              <UserPlus size={14} /> Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display name (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[hsl(232_45%_16%)] mb-1.5">
                  Display Name <span className="text-[hsl(232_20%_65%)] font-normal">(optional)</span>
                </label>
                <input
                  id="input-display-name"
                  type="text"
                  placeholder="How should NeuroMate call you?"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-4 text-sm text-[hsl(232_45%_16%)] placeholder:text-[hsl(232_20%_70%)] focus:outline-none focus:border-[hsl(258_100%_65%)] focus:ring-1 focus:ring-[hsl(258_100%_65%)] transition-all"
                />
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(232_45%_16%)] mb-1.5">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                id="input-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full h-10 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-4 text-sm text-[hsl(232_45%_16%)] placeholder:text-[hsl(232_20%_70%)] focus:outline-none focus:border-[hsl(258_100%_65%)] focus:ring-1 focus:ring-[hsl(258_100%_65%)] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(232_45%_16%)] mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  className="w-full h-10 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-4 pr-10 text-sm text-[hsl(232_45%_16%)] placeholder:text-[hsl(232_20%_70%)] focus:outline-none focus:border-[hsl(258_100%_65%)] focus:ring-1 focus:ring-[hsl(258_100%_65%)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(232_20%_55%)] hover:text-[hsl(258_100%_65%)] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm password (register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[hsl(232_45%_16%)] mb-1.5">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  id="input-confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="w-full h-10 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-4 text-sm text-[hsl(232_45%_16%)] placeholder:text-[hsl(232_20%_70%)] focus:outline-none focus:border-[hsl(258_100%_65%)] focus:ring-1 focus:ring-[hsl(258_100%_65%)] transition-all"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-submit-auth"
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[hsl(258_100%_65%)] to-[hsl(258_80%_55%)] text-white font-heading font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Please wait…</>
              ) : mode === "login" ? (
                <><LogIn size={16} /> Sign In</>
              ) : (
                <><Sparkles size={16} /> Create Account</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-[hsl(232_20%_65%)] mt-4">
          NeuroMate AI — Your personal wellness journey
        </p>
      </div>
    </div>
  );
}
