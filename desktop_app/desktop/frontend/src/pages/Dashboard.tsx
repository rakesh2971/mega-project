import { useState, useMemo, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  CheckCircle2, Clock, Flame, TrendingUp, Brain, Heart, Target,
  Calendar, Sparkles, ListChecks, Activity, Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";
import AddActivityDialog from "@/components/AddActivityDialog";
import { useAppStore } from "@/store/useAppStore";

// ── Color tokens (matches index.css palette) ──────────────────────────────
const PURPLE     = "hsl(258 100% 65%)";
const PURPLE_LIGHT = "hsl(258 100% 83%)";
const CYAN       = "hsl(181 84% 45%)";
const CYAN_LIGHT = "hsl(181 84% 66%)";

// ── Dynamic Data Interfaces ───────────────────────────────────────────────
export interface ProductivityDay {
  day: string;
  completed: number;
  pending: number;
  score: number;
}

export interface MoodDay {
  day: string;
  mood: number;
}

export interface WorkCategory {
  name: string;
  value: number;
  color: string;
}

export interface Insight {
  emoji: string;
  label: string;
  text: string;
  color: string;
}

export interface HabitMetrics {
  task_streak: number;
  weekly_consistency: number;
  focus_sessions_week: number;
  wellness_score: number;
  dynamic_insights: Insight[];
}

// ── Sub-components ────────────────────────────────────────────────────────

function SnapshotCard({
  icon: Icon,
  label,
  value,
  sub,
  accentColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 hover-glow transition-all flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[hsl(232_20%_55%)] flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: accentColor }} />
          {label}
        </span>
      </div>
      <p className="text-2xl font-heading font-bold text-[hsl(232_45%_16%)]">{value}</p>
      <p className="text-[11px] text-[hsl(232_20%_55%)]">{sub}</p>
      <div
        className="h-1 rounded-full mt-1"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="h-4 w-4" style={{ color: PURPLE }} />
      <h2 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">{title}</h2>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  range,
  onRangeChange,
  activeRange,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  range?: boolean;
  onRangeChange?: (r: string) => void;
  activeRange?: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)]">{title}</h3>
          <p className="text-[11px] text-[hsl(232_20%_55%)]">{subtitle}</p>
        </div>
        {range && (
          <div className="flex gap-1">
            {["7D", "30D", "90D"].map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange?.(r)}
                className={cn(
                  "text-[10px] font-heading font-semibold px-2 py-1 rounded-lg transition-all",
                  activeRange === r
                    ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                    : "text-[hsl(232_20%_55%)] hover:bg-muted"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// Custom tooltip for recharts (styled on-brand)
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl p-3 text-[11px] shadow-lg border border-[hsl(258_20%_90%)]">
      <p className="font-heading font-semibold text-[hsl(232_45%_16%)] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ── Contribution Heatmap (live data from DB + fallback) ──────────────────
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function generateHeatmapData(year: number, liveData?: { date: string; count: number }[]) {
  const start = new Date(year, 0, 1);
  const today = new Date();
  const end = today.getFullYear() === year ? today : new Date(year, 11, 31);

  // How many padding cells (Mon-aligned) before Jan 1
  const dow = start.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const daysBack = dow === 0 ? 6 : dow - 1; // days to go back to reach Monday

  // Padded array: first `daysBack` slots are null (empty cells before Jan 1)
  const days: ({ date: Date; level: 0|1|2|3|4 } | null)[] = Array(daysBack).fill(null);

  // Live data map by date string
  const liveMap = new Map<string, number>();
  if (liveData) {
    for (const d of liveData) liveMap.set(d.date, d.count);
  }

  const monthMap = new Map<number, number>();
  let dayCount = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const m = cur.getMonth();
    // Week index accounts for the leading padding
    const weekIdx = Math.floor((dayCount + daysBack) / 7);
    if (!monthMap.has(m)) monthMap.set(m, weekIdx);

    const dateStr = cur.toISOString().slice(0, 10);
    let lvl: 0|1|2|3|4;
    if (liveData) {
      // Real data: map count to level
      const count = liveMap.get(dateStr) ?? 0;
      lvl = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
    } else {
      // Fallback: pseudo-random
      const seed = cur.getDate() * 7 + cur.getMonth() * 31;
      lvl = [0,0,0,1,1,2,2,3,4][seed % 9] as 0|1|2|3|4;
    }
    days.push({ date: new Date(cur), level: lvl });
    cur.setDate(cur.getDate() + 1);
    dayCount++;
  }

  const weeks = Math.ceil(days.length / 7);
  const monthLabels: { label: string; weekIndex: number }[] = [];
  monthMap.forEach((wi, mi) => monthLabels.push({ label: MONTH_NAMES[mi], weekIndex: wi }));
  // Ensure labels are sorted chronologically (Map iteration order is insertion order, but be safe)
  monthLabels.sort((a, b) => a.weekIndex - b.weekIndex);

  return { days, weeks, monthLabels };

}

function ContributionHeatmap({ liveData }: { liveData?: { date: string; count: number }[] }) {
  const year = new Date().getFullYear();
  const { days, weeks, monthLabels } = useMemo(() => generateHeatmapData(year, liveData), [year, liveData]);
  const [hovered, setHovered] = useState<{ date: Date; level: number } | null>(null);

  const levelClass = (level: number) => {
    switch (level) {
      case 0: return "bg-[hsl(258_30%_93%)] hover:bg-[hsl(258_30%_85%)]";
      case 1: return "bg-[hsl(258_100%_83%_/_0.25)] hover:bg-[hsl(258_100%_83%_/_0.4)]";
      case 2: return "bg-[hsl(258_100%_83%_/_0.5)] hover:bg-[hsl(258_100%_83%_/_0.65)]";
      case 3: return "bg-[hsl(258_100%_65%_/_0.7)] hover:bg-[hsl(258_100%_65%_/_0.85)]";
      case 4: return "bg-[hsl(258_100%_65%)] hover:bg-[hsl(258_80%_55%)]";
      default: return "bg-transparent";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <SectionHeader icon={Calendar} title={`Activity in ${year}`} />

      {/* Month labels */}
      <div className="flex gap-[3px] pl-10 mb-1">
        {monthLabels.map((m, i) => {
          const prev = i > 0 ? monthLabels[i - 1].weekIndex : 0;
          const gap = (m.weekIndex - prev) * 12;
          return (
            <span
              key={m.label}
              className="text-[9px] text-[hsl(232_20%_55%)] whitespace-nowrap"
              style={{ marginLeft: i === 0 ? 0 : `${gap}px` }}
            >
              {m.label}
            </span>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-[9px] text-[hsl(232_20%_55%)] pr-1 pt-0.5 shrink-0">
          {WEEK_DAYS.map((d, i) => (
            <div key={d} className="h-[10px] flex items-center">{i % 2 === 0 ? d : ""}</div>
          ))}
        </div>

        {Array.from({ length: weeks }).map((_, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] shrink-0">
            {Array.from({ length: 7 }).map((_, di) => {
              const d = days[wi * 7 + di];
              if (!d) return <div key={di} className="w-[10px] h-[10px]" />;
              return (
                <div
                  key={di}
                  className={cn("w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-all duration-150", levelClass(d.level))}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  title={`${d.date.toLocaleDateString()} · Level ${d.level}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-[10px] text-[hsl(232_20%_55%)]">
          {hovered ? hovered.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Hover a day"}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-[hsl(232_20%_55%)]">
          <span>Less</span>
          {[0,1,2,3,4].map((l) => (
            <div key={l} className={cn("w-[10px] h-[10px] rounded-[2px]", levelClass(l))} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ── Progress bar helper ───────────────────────────────────────────────────
function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-[hsl(258_30%_93%)] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────

export interface DashboardStats {
  tasks_today: number;
  tasks_total_today: number;
  latest_mood_level: number | null;
  latest_mood_type: string | null;
  focus_minutes_today: number;
  streak_days: number;
}

interface ActivityItem {
  activity_type: string;
  title: string;
  time: string;
  date: string;
  dot_color: string;
}

interface HeatmapDay {
  date: string;
  count: number;
}

export default function Dashboard() {
  const { user } = useAppStore();
  const userId = user?.id ?? "00000000-0000-0000-0000-000000000001";
  const [activeRange, setActiveRange] = useState("7D");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveActivities, setLiveActivities] = useState<ActivityItem[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[] | undefined>(undefined);
  
  const [taskData, setTaskData] = useState<ProductivityDay[]>([]);
  const [moodData, setMoodData] = useState<MoodDay[]>([]);
  const [pieData, setPieData] = useState<WorkCategory[]>([]);
  const [habitMetrics, setHabitMetrics] = useState<HabitMetrics | null>(null);
  
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchData = useCallback(async () => {
    setLoadingStats(true);
    try {
      const rangeDays = activeRange === "90D" ? 90 : activeRange === "30D" ? 30 : 7;
      const [s, acts, heat, prod, mood, work, metrics] = await Promise.all([
        invoke<DashboardStats>("get_dashboard_stats", { userId }),
        invoke<ActivityItem[]>("get_recent_activities", { userId, limit: 10 }),
        invoke<HeatmapDay[]>("get_heatmap", { userId, year: new Date().getFullYear() }),
        invoke<ProductivityDay[]>("get_productivity_analytics", { userId, rangeDays }),
        invoke<MoodDay[]>("get_mood_analytics", { userId, rangeDays }),
        invoke<WorkCategory[]>("get_work_distribution", { userId }),
        invoke<HabitMetrics>("get_habit_metrics", { userId }),
      ]);
      setStats(s);
      setLiveActivities(acts);
      setHeatmapData(heat);
      setTaskData(prod);
      setMoodData(mood);
      setPieData(work);
      setHabitMetrics(metrics);
    } catch (e) {
      console.error("Dashboard data fetch failed:", e);
    } finally {
      setLoadingStats(false);
    }
  }, [activeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const moodEmoji = (level: number | null) => {
    if (!level) return "😐";
    return ["😢", "😕", "😐", "😊", "😄"][Math.round(level) - 1] ?? "😐";
  };
  const focusDisplay = stats ? (() => {
    const h = Math.floor(stats.focus_minutes_today / 60);
    const m = stats.focus_minutes_today % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  })() : "0m";

  const snapshots = [
    { icon: CheckCircle2, label: "Tasks Today",     value: stats ? `${stats.tasks_today}/${stats.tasks_total_today}` : "0/0",   sub: stats ? `${stats.tasks_total_today > 0 ? Math.round((stats.tasks_today / stats.tasks_total_today) * 100) : 0}% completed` : "Log a task",     accentColor: "#22c55e" },
    { icon: Heart,        label: "Mood Status",     value: moodEmoji(stats?.latest_mood_level ?? null),     sub: stats?.latest_mood_type?.replace("_", " ") ?? "No check-in yet",   accentColor: "#f472b6" },
    { icon: Brain,        label: "Productivity",    value: stats ? `${Math.min(100, stats.tasks_today * 10 + Math.floor(stats.focus_minutes_today / 60) * 20)}` : "—",     sub: "Calculated score",     accentColor: PURPLE },
    { icon: Clock,        label: "Focus Time",      value: focusDisplay, sub: "Today's sessions",  accentColor: "#fb923c" },
    { icon: Flame,        label: "Current Streak",  value: stats ? `${stats.streak_days} day${stats.streak_days !== 1 ? "s" : ""}` : "0 days", sub: stats && stats.streak_days > 0 ? "Keep it up!" : "Log to start streak",       accentColor: "#ef4444" },
  ];

  const habits = [
    { icon: Flame,       label: "Task Streak",         badge: habitMetrics ? `${habitMetrics.task_streak} days` : "0 days", value: habitMetrics ? Math.min(100, habitMetrics.task_streak * 10) : 0, color: "#fb923c" },
    { icon: CheckCircle2,label: "Weekly Consistency",  badge: habitMetrics ? `${habitMetrics.weekly_consistency}%` : "0%",    value: habitMetrics?.weekly_consistency ?? 0, color: "#22c55e" },
    { icon: Brain,       label: "Focus Sessions",      badge: habitMetrics ? `${habitMetrics.focus_sessions_week} this week` : "0 this week", value: habitMetrics ? Math.min(100, habitMetrics.focus_sessions_week * 5) : 0, color: PURPLE },
    { icon: Zap,         label: "Wellness Score",      badge: habitMetrics ? `${habitMetrics.wellness_score}/100` : "0/100", value: habitMetrics?.wellness_score ?? 0, color: CYAN },
  ];

  // Helper variables for chart summaries
  const avgCompletionRate = taskData.length > 0 ? Math.round(taskData.reduce((acc, curr) => acc + (curr.completed + curr.pending > 0 ? curr.completed / (curr.completed + curr.pending) : 0), 0) / taskData.length * 100) : 0;
  const filteredMoods = moodData.filter(d => d.mood > 0);
  const avgMoodValue = filteredMoods.length > 0 ? (filteredMoods.reduce((acc, curr) => acc + curr.mood, 0) / filteredMoods.length) : 0;

  return (
    <div className="h-full overflow-y-auto smooth-scroll">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[hsl(258_20%_90%)] bg-gradient-hero flex items-center justify-between">
        <div>
          <h1 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)]">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your wellness journey, visualized</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[hsl(232_20%_55%)] bg-muted px-2 py-1 rounded-full">
            {loadingStats ? "Updating..." : "Last updated: Just now"}
          </span>
          <AddActivityDialog onSuccess={fetchData} />
        </div>
      </div>

      <div className="p-4 space-y-5 page-enter">

        {/* ── 1️⃣ Today's Snapshot ───────────────────────────────────── */}
        <section>
          <SectionHeader icon={TrendingUp} title="Today's Snapshot" />
          <div className="grid grid-cols-5 gap-3">
            {snapshots.map((s) => (
              <SnapshotCard key={s.label} {...s} />
            ))}
          </div>
        </section>

        {/* ── 2️⃣ Analytics & Insights ───────────────────────────────── */}
        <section>
          <SectionHeader icon={Target} title="Analytics & Insights" />
          <div className="grid grid-cols-3 gap-3">

            {/* Productivity Bar Chart */}
            <ChartCard
              title="Productivity Analytics"
              subtitle="Task completion trends"
              range
              activeRange={activeRange}
              onRangeChange={setActiveRange}
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={taskData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(258 20% 92%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(232 20% 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(232 20% 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="completed" name="Completed" fill={PURPLE_LIGHT} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending"   name="Pending"   fill="hsl(258 30% 93%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[hsl(232_20%_55%)]">Avg Completion Rate</span>
                  <span className="font-semibold text-[hsl(232_45%_16%)]">{avgCompletionRate}%</span>
                </div>
                <ProgressBar value={avgCompletionRate} color={`linear-gradient(90deg, ${PURPLE_LIGHT}, ${CYAN_LIGHT})`} />
              </div>
            </ChartCard>

            {/* Mood Line Chart */}
            <ChartCard
              title="Mood & Wellbeing"
              subtitle="Emotional patterns over time"
              range
              activeRange={activeRange}
              onRangeChange={setActiveRange}
            >
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={moodData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(258 20% 92%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(232 20% 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "hsl(232 20% 55%)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood Score"
                    stroke={PURPLE}
                    strokeWidth={2.5}
                    dot={{ fill: PURPLE, r: 4, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: CYAN }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 flex gap-4 text-[11px]">
                <div>
                  <p className="text-[hsl(232_20%_55%)]">Avg Mood</p>
                  <p className="font-bold text-[hsl(232_45%_16%)] text-base">{avgMoodValue.toFixed(1)}/5</p>
                </div>
                <div>
                  <p className="text-[hsl(232_20%_55%)]">Most Common</p>
                  <p className="text-xl">{moodEmoji(avgMoodValue)}</p>
                </div>
              </div>
            </ChartCard>

            {/* Work Distribution Pie */}
            <ChartCard title="Work Distribution" subtitle="Time spent by category">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={72}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                    fontSize={9}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 justify-center">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1 text-[10px] text-[hsl(232_20%_55%)]">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </section>

        {/* ── 3️⃣ Habit Metrics + AI Insights ────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">

          {/* Habit & Routine Metrics */}
          <div className="glass-card rounded-2xl p-4">
            <SectionHeader icon={Activity} title="Habit & Routine Metrics" />
            <div className="space-y-3">
              {habits.map((h) => (
                <div key={h.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-[hsl(232_45%_16%)]">
                      <h.icon className="h-3 w-3" style={{ color: h.color }} />
                      <span>{h.label}</span>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${h.color}20`, color: h.color }}
                    >
                      {h.badge}
                    </span>
                  </div>
                  <ProgressBar value={h.value} color={h.color} />
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-card rounded-2xl p-4 flex flex-col">
            <SectionHeader icon={Sparkles} title="AI Insights" />
            <div className="flex-1 space-y-2 mt-1">
              {!habitMetrics?.dynamic_insights?.length ? (
                <p className="text-xs text-[hsl(232_20%_55%)] mt-4">Loading insights...</p>
              ) : (
                habitMetrics.dynamic_insights.map((insight, i) => (
                  <div key={i} className={cn("p-2.5 rounded-lg border-l-2 text-xs", insight.color)}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">{insight.emoji}</span>
                      <span className="font-semibold text-[hsl(232_45%_16%)]">{insight.label}</span>
                    </div>
                    <p className="text-[10px] text-[hsl(232_20%_55%)] leading-relaxed">{insight.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 🌟 4️⃣ Contribution Heatmap 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 */}
        <section>
          <ContributionHeatmap liveData={heatmapData} />
        </section>

        {/* 🌟 5️⃣ Recent Activity 🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 */}
        <section>
          <SectionHeader icon={Clock} title="Recent Activity" />
          <div className="glass-card rounded-2xl p-4">
            {loadingStats && <p className="text-center text-xs text-[hsl(232_20%_55%)] py-4">Loading...</p>}
            {!loadingStats && liveActivities.length === 0 && (
              <div className="text-center py-6 space-y-1">
                <p className="text-xs text-[hsl(232_20%_55%)]">No activities logged yet.</p>
                <p className="text-[10px] text-[hsl(232_20%_65%)]">Click "Log Activity" above to get started!</p>
              </div>
            )}
            <div className="space-y-2.5">
              {liveActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[hsl(258_20%_93%)] last:border-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.dot_color }} />
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-medium text-[hsl(232_45%_16%)] truncate">{a.title}</p>
                    <p className="text-[10px] text-[hsl(232_20%_55%)]">{a.time}</p>
                  </div>
                  <span className="text-[10px] font-medium capitalize text-[hsl(232_20%_60%)] bg-muted px-2 py-0.5 rounded-full">
                    {a.activity_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
