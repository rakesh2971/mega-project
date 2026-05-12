import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  User as UserIcon, Edit2, Save, X, LogOut, Calendar,
  Shield, Sparkles, CheckCircle2, Clock, Brain,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import { mapDbUser } from "@/pages/Login";

// ── Avatar from seed ───────────────────────────────────────────────────────

function AvatarCircle({ seed, name, size = "lg" }: { seed?: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    "from-[hsl(258_100%_65%)] to-[hsl(258_80%_55%)]",
    "from-[hsl(181_84%_45%)] to-[hsl(181_60%_35%)]",
    "from-pink-400 to-pink-600",
    "from-orange-400 to-orange-600",
    "from-blue-400 to-blue-600",
  ];
  // pick color deterministically from seed
  const idx = seed ? seed.charCodeAt(0) % colors.length : 0;
  const sizeClass = size === "lg" ? "h-20 w-20 text-2xl" : size === "md" ? "h-12 w-12 text-lg" : "h-8 w-8 text-sm";

  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br flex items-center justify-center font-heading font-bold text-white shadow-lg",
      sizeClass,
      colors[idx]
    )}>
      {initial}
    </div>
  );
}

// ── Stat badge ─────────────────────────────────────────────────────────────

function StatBadge({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="glass-card rounded-xl p-3 flex flex-col gap-1 hover-glow transition-all">
      <div className="flex items-center gap-1.5">
        <Icon size={13} style={{ color }} />
        <span className="text-[10px] text-[hsl(232_20%_55%)] font-medium">{label}</span>
      </div>
      <p className="text-base font-heading font-bold text-[hsl(232_45%_16%)]">{value}</p>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────

export default function Profile() {
  const { user, setUser } = useAppStore();
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(user?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) return null;

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const raw = await invoke("update_profile", {
        displayName: draftName.trim() || null,
        avatarSeed: null,
      });
      const updated = mapDbUser(raw);
      setUser(updated);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      setSaveError(typeof e === "string" ? e : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await invoke("logout_user");
    } catch (_) {}
    setUser(null);
  };

  return (
    <div className="h-full overflow-y-auto smooth-scroll">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[hsl(258_20%_90%)] bg-gradient-hero flex items-center justify-between">
        <div>
          <h1 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)]">My Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>
        <button
          id="btn-logout"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      <div className="p-4 space-y-4 page-enter">

        {/* ── Profile Card ──────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <AvatarCircle seed={user.avatar_seed} name={user.name} size="lg" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    id="input-edit-display-name"
                    autoFocus
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    placeholder={user.username}
                    className="flex-1 h-8 rounded-lg bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-3 text-sm text-[hsl(232_45%_16%)] focus:outline-none focus:border-[hsl(258_100%_65%)] focus:ring-1 focus:ring-[hsl(258_100%_65%)] transition-all font-heading font-bold"
                  />
                  <button
                    id="btn-save-profile"
                    onClick={handleSave}
                    disabled={saving}
                    className="h-8 w-8 rounded-lg bg-gradient-to-r from-[hsl(258_100%_65%)] to-[hsl(258_80%_55%)] flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Save size={13} />
                  </button>
                  <button
                    id="btn-cancel-edit"
                    onClick={() => { setEditing(false); setDraftName(user.display_name ?? ""); }}
                    className="h-8 w-8 rounded-lg bg-[hsl(258_30%_93%)] flex items-center justify-center text-[hsl(232_20%_55%)] hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)] truncate">
                    {user.name}
                  </h2>
                  <button
                    id="btn-edit-profile"
                    onClick={() => { setEditing(true); setDraftName(user.display_name ?? ""); }}
                    className="h-6 w-6 rounded-lg hover:bg-[hsl(258_30%_93%)] flex items-center justify-center text-[hsl(232_20%_55%)] hover:text-[hsl(258_100%_65%)] transition-all"
                  >
                    <Edit2 size={12} />
                  </button>
                </div>
              )}

              {saveError && <p className="text-xs text-red-500 mb-1">{saveError}</p>}
              {saveSuccess && (
                <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                  <CheckCircle2 size={12} /> Profile updated!
                </div>
              )}

              <p className="text-sm text-[hsl(232_20%_55%)]">
                @{user.username}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[10px] text-[hsl(232_20%_55%)] bg-[hsl(258_30%_97%)] px-2 py-0.5 rounded-full">
                  <Calendar size={10} /> Joined {memberSince}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Account Info ──────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: "hsl(258 100% 65%)" }} />
            <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">Account Details</h3>
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Username", value: user.username },
              { label: "User ID", value: user.id.slice(0, 8) + "…" },
              { label: "Member Since", value: memberSince },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-[hsl(258_20%_93%)] last:border-0">
                <span className="text-xs text-[hsl(232_20%_55%)]">{label}</span>
                <span className="text-xs font-semibold text-[hsl(232_45%_16%)] font-heading">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Stats ───────────────────────────────────────── */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} style={{ color: "hsl(258 100% 65%)" }} />
            <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">Your Journey</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatBadge icon={Brain} label="AI Sessions" value="—" color="hsl(258 100% 65%)" />
            <StatBadge icon={CheckCircle2} label="Tasks Done" value="—" color="#22c55e" />
            <StatBadge icon={Clock} label="Focus Time" value="—" color="#fb923c" />
          </div>
          <p className="text-[10px] text-[hsl(232_20%_65%)] mt-2 text-center">
            Visit the Dashboard for detailed analytics
          </p>
        </div>

      </div>
    </div>
  );
}
