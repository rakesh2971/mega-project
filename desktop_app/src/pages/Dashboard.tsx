import { BarChart3, Heart, Focus, TrendingUp, Activity, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Metric card ───────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 hover-glow transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-xl", color)}>
          <Icon className="h-4 w-4 text-white" size={16} />
        </div>
        <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-0.5 rounded-full">
          {change}
        </span>
      </div>
      <p className="text-2xl font-heading font-bold text-[hsl(232_45%_16%)]">{value}</p>
      <p className="text-xs text-[hsl(232_20%_50%)] mt-0.5">{label}</p>
    </div>
  );
}

// ── Chart placeholder ─────────────────────────────────────────────────────

function ChartPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">{title}</h3>
          <p className="text-xs text-[hsl(232_20%_55%)]">{subtitle}</p>
        </div>
        <div className="flex gap-1">
          {["7D", "30D", "90D"].map((range) => (
            <button
              key={range}
              className={cn(
                "text-[10px] font-heading font-semibold px-2 py-1 rounded-lg transition-all",
                range === "7D"
                  ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                  : "text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)]"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      {/* Chart area placeholder */}
      <div className="h-40 rounded-xl bg-gradient-hero border border-[hsl(258_20%_92%)] flex items-center justify-center">
        <div className="text-center space-y-2">
          <BarChart3 className="h-10 w-10 text-[hsl(258_100%_83%_/_0.4)] mx-auto" />
          <p className="text-xs text-[hsl(232_20%_60%)]">Charts will load here</p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────

export default function Dashboard() {
  const metrics = [
    { icon: Heart,      label: "Avg Mood Score",   value: "—",   change: "—",   color: "bg-pink-400" },
    { icon: Focus,      label: "Focus Hours",      value: "—",   change: "—",   color: "bg-[hsl(258_100%_65%)]" },
    { icon: TrendingUp, label: "Habit Streak",     value: "—",   change: "—",   color: "bg-[hsl(181_84%_45%)]" },
    { icon: Activity,   label: "Wellness Score",   value: "—",   change: "—",   color: "bg-blue-400" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[hsl(258_20%_90%)] bg-gradient-hero">
        <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">
          Dashboard Analytics
        </h1>
        <p className="text-sm text-[hsl(232_20%_50%)] mt-1">
          Your mental wellness journey, visualized
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          <ChartPlaceholder title="Mood Trend" subtitle="Emotional patterns over time" />
          <ChartPlaceholder title="Focus Sessions" subtitle="Daily focus duration in hours" />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Weekly heatmap placeholder */}
          <div className="glass-card rounded-2xl p-5 col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={15} className="text-[hsl(258_100%_65%)]" />
              <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">
                Activity Heatmap
              </h3>
              <span className="text-xs text-[hsl(232_20%_55%)]">· Last 12 weeks</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 84 }).map((_, i) => (
                <div
                  key={i}
                  className="h-4 rounded-sm skeleton"
                  style={{ opacity: Math.random() * 0.8 + 0.1 }}
                />
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} className="text-[hsl(258_100%_65%)]" />
              <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">
                Recent Sessions
              </h3>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="skeleton h-6 w-6 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-2.5 w-24 rounded" />
                    <div className="skeleton h-2 w-16 rounded" />
                  </div>
                  <div className="skeleton h-4 w-8 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
