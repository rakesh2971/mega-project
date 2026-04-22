import { Users, MessageCircle, Trophy, TrendingUp, Bookmark, Settings2, Search } from "lucide-react";
import { cn } from "@/lib/cn";

// ── Tab definition ────────────────────────────────────────────────────────

const TABS = [
  { id: "feed",       label: "Feed",       icon: MessageCircle },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "qa",         label: "Q&A",        icon: Users },
  { id: "trending",   label: "Trending",   icon: TrendingUp },
  { id: "saved",      label: "Saved",      icon: Bookmark },
  { id: "settings",   label: "Settings",   icon: Settings2 },
] as const;

// ── Skeleton post card ────────────────────────────────────────────────────

function PostCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 hover-glow transition-all">
      <div className="flex items-center gap-3">
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="skeleton h-3 w-32 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="skeleton h-3 w-4/6 rounded" />
      </div>
      <div className="flex items-center gap-4 pt-1 border-t border-[hsl(258_20%_92%)]">
        <div className="skeleton h-5 w-12 rounded" />
        <div className="skeleton h-5 w-12 rounded" />
        <div className="skeleton h-5 w-12 rounded ml-auto" />
      </div>
    </div>
  );
}

// ── Community Page ────────────────────────────────────────────────────────

export default function Community() {
  const activeTab = "feed"; // will be state later

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main feed ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(258_20%_90%)] bg-white/60 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)]">
              Community
            </h1>
            <p className="text-xs text-[hsl(232_20%_50%)]">Connect, share, and grow together</p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] w-64">
            <Search size={14} className="text-[hsl(232_20%_60%)]" />
            <span className="text-xs text-[hsl(232_20%_65%)]">Search community…</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-[hsl(258_20%_90%)] overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-community-${id}`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold whitespace-nowrap transition-all",
                activeTab === id
                  ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                  : "text-[hsl(232_20%_50%)] hover:bg-[hsl(258_30%_95%)]"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Post cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </div>

      {/* ── Right sidebar ─────────────────────────────────────── */}
      <div className="w-64 shrink-0 border-l border-[hsl(258_20%_90%)] p-4 space-y-4 overflow-y-auto bg-[hsl(258_30%_98%)]">
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-heading font-semibold text-[hsl(232_20%_50%)] uppercase tracking-wider">
            Community Stats
          </h3>
          {["Members", "Posts Today", "Active Now"].map((label) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-[hsl(232_20%_50%)]">{label}</span>
              <div className="skeleton h-4 w-12 rounded" />
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-heading font-semibold text-[hsl(232_20%_50%)] uppercase tracking-wider">
            Trending Tags
          </h3>
          {["#mindfulness", "#productivity", "#focusmode", "#wellness"].map((tag) => (
            <div key={tag} className="flex items-center gap-2 cursor-pointer hover:text-[hsl(258_100%_65%)] transition-colors">
              <span className="text-xs text-[hsl(258_100%_65%)] font-medium">{tag}</span>
            </div>
          ))}
        </div>

        <button
          id="btn-new-post"
          className="w-full py-2.5 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-heading font-semibold hover-glow transition-all"
        >
          + New Post
        </button>
      </div>
    </div>
  );
}
