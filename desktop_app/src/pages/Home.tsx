import { useState, useEffect } from "react";
import { Heart, Focus, BookOpen, TrendingUp, Activity, Mic, MicOff, MessageSquare } from "lucide-react";
import AvatarCanvas from "@/components/avatar/AvatarCanvas";
import { useAppStore } from "@/store/useAppStore";
import { getGreeting, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ── Quick stat card ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-glow transition-all">
      <div className={cn("p-2 rounded-xl", color)}>
        <Icon className="h-4 w-4 text-white" size={16} />
      </div>
      <div>
        <p className="text-xs text-[hsl(232_20%_50%)] font-medium">{label}</p>
        <p className="text-base font-heading font-bold text-[hsl(232_45%_16%)]">{value}</p>
      </div>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────

export default function Home() {
  const { avatarMood, isListening, setListening } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const quickStats = [
    { icon: Heart,     label: "Mood Score",     value: "—",   color: "bg-pink-400" },
    { icon: Focus,     label: "Focus Streak",   value: "—",   color: "bg-[hsl(258_100%_65%)]" },
    { icon: TrendingUp,label: "Tasks Done",     value: "—",   color: "bg-[hsl(181_84%_45%)]" },
    { icon: Activity,  label: "Wellness",       value: "—",   color: "bg-blue-400" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Avatar + Chat ──────────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-72 shrink-0 border-r border-[hsl(258_20%_90%)] p-6 gap-6 bg-gradient-hero">
        {/* Greeting */}
        <div className="text-center">
          <p className="text-xs text-[hsl(232_20%_50%)] font-medium">
            {formatDate(currentTime)}
          </p>
          <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)] mt-1">
            {getGreeting()},{" "}
            <span className="gradient-text">User</span> 👋
          </h1>
        </div>

        {/* Avatar */}
        <AvatarCanvas mode="home" mood={avatarMood} />

        {/* Voice toggle */}
        <button
          id="btn-voice-toggle"
          onClick={() => setListening(!isListening)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full",
            "font-heading font-semibold text-sm transition-all",
            isListening
              ? "bg-gradient-primary text-[hsl(232_45%_16%)] shadow-[var(--shadow-glow)] animate-pulse"
              : "glass-card text-[hsl(232_20%_50%)] hover:text-[hsl(232_45%_16%)] hover-glow"
          )}
        >
          {isListening ? (
            <><MicOff size={16} /> Stop Listening</>
          ) : (
            <><Mic size={16} /> Talk to NeuroMate</>
          )}
        </button>
      </div>

      {/* ── Right: Dashboard overview ────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Quick stats */}
        <section>
          <h2 className="text-sm font-heading font-semibold text-[hsl(232_20%_50%)] uppercase tracking-wider mb-3">
            Today's Overview
          </h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {quickStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        {/* Chat history placeholder */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-heading font-semibold text-[hsl(232_20%_50%)] uppercase tracking-wider">
              Recent Conversations
            </h2>
            <button className="text-xs text-[hsl(258_100%_65%)] hover:underline font-medium">
              View All
            </button>
          </div>

          {/* Chat area placeholder */}
          <div className="glass-card rounded-2xl p-4 min-h-[200px] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-gradient-primary shrink-0" />
              <div className="skeleton h-8 flex-1 rounded-xl" />
            </div>
            <div className="flex items-start gap-3 flex-row-reverse">
              <div className="h-7 w-7 rounded-full bg-[hsl(258_30%_90%)] shrink-0" />
              <div className="skeleton h-8 w-3/4 rounded-xl" />
            </div>
            <div className="mt-auto pt-2 border-t border-[hsl(258_20%_90%)] flex items-center gap-2">
              <div className="flex-1 h-9 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-3 flex items-center">
                <span className="text-xs text-[hsl(232_20%_70%)]">
                  Ask NeuroMate something…
                </span>
              </div>
              <button
                id="btn-send-message"
                className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center hover-glow"
              >
                <MessageSquare size={14} className="text-[hsl(232_45%_16%)]" />
              </button>
            </div>
          </div>
        </section>

        {/* Module shortcuts */}
        <section>
          <h2 className="text-sm font-heading font-semibold text-[hsl(232_20%_50%)] uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Heart,    label: "Mood Check",      color: "from-pink-200 to-pink-100" },
              { icon: Focus,    label: "Focus Session",   color: "from-purple-200 to-purple-100" },
              { icon: BookOpen, label: "Daily Journal",   color: "from-blue-200 to-blue-100" },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                className={cn(
                  "glass-card rounded-2xl p-4 flex flex-col items-center gap-2",
                  "hover-glow cursor-pointer transition-all group"
                )}
              >
                <div className={cn("p-3 rounded-xl bg-gradient-to-br", color)}>
                  <Icon className="h-5 w-5 text-[hsl(232_45%_25%)]" />
                </div>
                <span className="text-xs font-heading font-semibold text-[hsl(232_45%_16%)] group-hover:gradient-text">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
