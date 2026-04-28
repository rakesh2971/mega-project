import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import {
  CheckCircle2, Clock, Flame, TrendingUp, Brain, Heart, Target,
  Calendar, Sparkles, ListChecks, Activity, Focus, Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ── Colour tokens (matches index.css palette) ─────────────────────────────
const PURPLE     = "hsl(258 100% 65%)";
const PURPLE_LIGHT = "hsl(258 100% 83%)";
const CYAN       = "hsl(181 84% 45%)";
const CYAN_LIGHT = "hsl(181 84% 66%)";

// ── Mock data ─────────────────────────────────────────────────────────────
const taskData = [
  { day: "Mon", completed: 8, pending: 2 },
  { day: "Tue", completed: 6, pending: 4 },
  { day: "Wed", completed: 9, pending: 1 },
  { day: "Thu", completed: 7, pending: 3 },
  { day: "Fri", completed: 10, pending: 2 },
  { day: "Sat", completed: 5, pending: 1 },
  { day: "Sun", completed: 4, pending: 2 },
];

const moodData = [
  { day: "Mon", mood: 7 },
  { day: "Tue", mood: 6 },
  { day: "Wed", mood: 8 },
  { day: "Thu", mood: 5 },
  { day: "Fri", mood: 9 },
  { day: "Sat", mood: 8 },
  { day: "Sun", mood: 7 },
];

const pieData = [
  { name: "Study",    value: 35, color: PURPLE_LIGHT },
  { name: "Coding",   value: 30, color: PURPLE },
  { name: "Fitness",  value: 20, color: CYAN_LIGHT },
  { name: "Personal", value: 15, color: CYAN },
];

const aiInsights = [
  {
    emoji: "💡",
    label: "Peak Performance",
    text: "Your productivity is 40% higher in the morning. Try scheduling complex tasks before noon.",
    color: "border-l-[hsl(258_100%_65%)] bg-[hsl(258_100%_65%_/_0.05)]",
  },
  {
    emoji: "😌",
    label: "Wellbeing Tip",
    text: "Your mood dips on Thursdays. Consider scheduling lighter tasks or breaks mid-week.",
    color: "border-l-[hsl(181_84%_45%)] bg-[hsl(181_84%_45%_/_0.05)]",
  },
  {
    emoji: "🎯",
    label: "Consistency Win",
    text: "You've maintained a 7-day streak! Keep this momentum to build lasting habits.",
    color: "border-l-pink-400 bg-pink-50",
  },
  {
    emoji: "📊",
    label: "Tomorrow's Forecast",
    text: "Based on patterns, tomorrow's productivity score: 85. Great conditions for important work!",
    color: "border-l-blue-400 bg-blue-50",
  },
];

const recentActivities = [
  { type: "task",      title: "Completed math assignment",      time: "2 hours ago",   dot: "bg-green-500" },
  { type: "focus",     title: "Focus session — Deep Work",      time: "4 hours ago",   dot: "bg-blue-500" },
  { type: "mood",      title: "Mood check-in recorded",         time: "5 hours ago",   dot: "bg-pink-500" },
  { type: "journal",   title: "Journal entry written",          time: "Yesterday 9pm", dot: "bg-purple-500" },
  { type: "routine",   title: "Morning routine completed",      time: "Yesterday 8am", dot: "bg-orange-500" },
];

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
                    : "text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)]"
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

// ── Contribution Heatmap (self-contained, no backend) ─────────────────────
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function generateHeatmapData(year: number) {
  const start = new Date(year, 0, 1);
  const today = new Date();
  const end = today.getFullYear() === year ? today : new Date(year, 11, 31);

  // How many padding cells (Mon-aligned) before Jan 1
  const dow = start.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const daysBack = dow === 0 ? 6 : dow - 1; // days to go back to reach Monday

  // Padded array: first `daysBack` slots are null (empty cells before Jan 1)
  const days: ({ date: Date; level: 0|1|2|3|4 } | null)[] = Array(daysBack).fill(null);

  const monthMap = new Map<number, number>();
  let dayCount = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const m = cur.getMonth();
    // Week index accounts for the leading padding
    const weekIdx = Math.floor((dayCount + daysBack) / 7);
    if (!monthMap.has(m)) monthMap.set(m, weekIdx);

    // Deterministic pseudo-random level based on date
    const seed = cur.getDate() * 7 + cur.getMonth() * 31;
    const lvl = [0,0,0,1,1,2,2,3,4][seed % 9] as 0|1|2|3|4;
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

function ContributionHeatmap() {
  const year = new Date().getFullYear();
  const { days, weeks, monthLabels } = useMemo(() => generateHeatmapData(year), [year]);
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
        <div className="flex flex-col gap-[3px] text-[9px] text-[hsl(232_20%_55%)] pr-1 pt-0.5 flex-shrink-0">
          {WEEK_DAYS.map((d, i) => (
            <div key={d} className="h-[10px] flex items-center">{i % 2 === 0 ? d : ""}</div>
          ))}
        </div>

        {Array.from({ length: weeks }).map((_, wi) => (
          <div key={wi} className="flex flex-col gap-[3px] flex-shrink-0">
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
export default function Dashboard() {
  const [activeRange, setActiveRange] = useState("7D");

  const snapshots = [
    { icon: CheckCircle2, label: "Tasks Today",     value: "8/10",   sub: "80% completed",     accentColor: "#22c55e" },
    { icon: Heart,        label: "Mood Status",     value: "😊",     sub: "Happy & Focused",   accentColor: "#f472b6" },
    { icon: Brain,        label: "Productivity",    value: "82",     sub: "Above average",     accentColor: PURPLE },
    { icon: Clock,        label: "Focus Time",      value: "3h 20m", sub: "12 interruptions",  accentColor: "#fb923c" },
    { icon: Flame,        label: "Current Streak",  value: "7 days", sub: "Keep it up!",       accentColor: "#ef4444" },
  ];

  const habits = [
    { icon: Flame,       label: "Task Streak",         badge: "7 days", value: 70, color: "#fb923c" },
    { icon: CheckCircle2,label: "Weekly Consistency",  badge: "85%",    value: 85, color: "#22c55e" },
    { icon: Brain,       label: "Focus Sessions",      badge: "24 this week", value: 60, color: PURPLE },
    { icon: Zap,         label: "Wellness Score",      badge: "92/100", value: 92, color: CYAN },
  ];

  return (
    <div className="h-full overflow-y-auto smooth-scroll">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[hsl(258_20%_90%)] bg-gradient-hero flex items-center justify-between">
        <div>
          <h1 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)]">Dashboard</h1>
          <p className="text-xs text-[hsl(232_20%_50%)] mt-0.5">Your wellness journey, visualized</p>
        </div>
        <span className="text-[10px] font-medium text-[hsl(232_20%_55%)] bg-[hsl(258_30%_95%)] px-2 py-1 rounded-full">
          Last updated: Just now
        </span>
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
              subtitle="Task completion this week"
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
                  <span className="text-[hsl(232_20%_55%)]">Weekly Completion Rate</span>
                  <span className="font-semibold text-[hsl(232_45%_16%)]">78%</span>
                </div>
                <ProgressBar value={78} color={`linear-gradient(90deg, ${PURPLE_LIGHT}, ${CYAN_LIGHT})`} />
              </div>
            </ChartCard>

            {/* Mood Line Chart */}
            <ChartCard
              title="Mood & Wellbeing"
              subtitle="Emotional patterns this week"
              range
              activeRange={activeRange}
              onRangeChange={setActiveRange}
            >
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={moodData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(258 20% 92%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(232 20% 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(232 20% 55%)" }} axisLine={false} tickLine={false} />
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
                  <p className="font-bold text-[hsl(232_45%_16%)] text-base">7.1/10</p>
                </div>
                <div>
                  <p className="text-[hsl(232_20%_55%)]">Most Common</p>
                  <p className="text-xl">😊</p>
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
          <div className="glass-card rounded-2xl p-4">
            <SectionHeader icon={Sparkles} title="AI Insights & Recommendations" />
            <div className="space-y-2">
              {aiInsights.map((ins) => (
                <div
                  key={ins.label}
                  className={cn(
                    "p-2.5 rounded-xl border-l-2 text-[11px] leading-relaxed",
                    ins.color
                  )}
                >
                  <span className="font-semibold text-[hsl(232_45%_16%)]">
                    {ins.emoji} {ins.label}:
                  </span>{" "}
                  <span className="text-[hsl(232_20%_45%)]">{ins.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4️⃣ Contribution Heatmap ────────────────────────────────── */}
        <ContributionHeatmap />

        {/* ── 5️⃣ Recent Activity ─────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Clock} title="Recent Activity" />
          <div className="glass-card rounded-2xl p-4">
            <div className="space-y-2.5">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-[hsl(258_20%_93%)] last:border-0">
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", a.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[hsl(232_45%_16%)] truncate">{a.title}</p>
                    <p className="text-[10px] text-[hsl(232_20%_55%)]">{a.time}</p>
                  </div>
                  <span className="text-[10px] font-medium capitalize text-[hsl(232_20%_60%)] bg-[hsl(258_30%_95%)] px-2 py-0.5 rounded-full">
                    {a.type}
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
