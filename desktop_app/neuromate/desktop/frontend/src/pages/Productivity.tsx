import {
  Timer, Focus, CheckSquare, BookOpen, RefreshCw,
  Wind, Music, Brain, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/cn";

// ── Tool card definition ──────────────────────────────────────────────────

const TOOLS = [
  {
    id: "pomodoro",
    icon: Timer,
    title: "Pomodoro Timer",
    description: "Focus sessions with timed breaks to maximize productivity",
    tag: "Focus",
    tagColor: "bg-purple-100 text-purple-700",
    gradient: "from-purple-200 to-purple-100",
    ready: false,
  },
  {
    id: "focus-mode",
    icon: Focus,
    title: "Deep Focus Mode",
    description: "Block distractions and enter a distraction-free flow state",
    tag: "Flow",
    tagColor: "bg-blue-100 text-blue-700",
    gradient: "from-blue-200 to-blue-100",
    ready: false,
  },
  {
    id: "task-manager",
    icon: CheckSquare,
    title: "Task Manager",
    description: "AI-prioritized task lists aligned with your energy levels",
    tag: "Tasks",
    tagColor: "bg-green-100 text-green-700",
    gradient: "from-green-200 to-green-100",
    ready: false,
  },
  {
    id: "journal",
    icon: BookOpen,
    title: "Growth Journal",
    description: "Daily AI-guided prompts for reflection and self-awareness",
    tag: "Mindfulness",
    tagColor: "bg-amber-100 text-amber-700",
    gradient: "from-amber-200 to-amber-100",
    ready: false,
  },
  {
    id: "habit-tracker",
    icon: RefreshCw,
    title: "Habit Tracker",
    description: "Build streaks and track consistency for lasting habits",
    tag: "Habits",
    tagColor: "bg-pink-100 text-pink-700",
    gradient: "from-pink-200 to-pink-100",
    ready: false,
  },
  {
    id: "breathing",
    icon: Wind,
    title: "Breathing Exercise",
    description: "Guided box breathing and 4-7-8 techniques for calm",
    tag: "Wellness",
    tagColor: "bg-teal-100 text-teal-700",
    gradient: "from-teal-200 to-teal-100",
    ready: false,
  },
  {
    id: "soundscapes",
    icon: Music,
    title: "Focus Soundscapes",
    description: "Ambient sounds and binaural beats for deep concentration",
    tag: "Audio",
    tagColor: "bg-indigo-100 text-indigo-700",
    gradient: "from-indigo-200 to-indigo-100",
    ready: false,
  },
  {
    id: "cognitive",
    icon: Brain,
    title: "Cognitive Training",
    description: "Memory and attention exercises to sharpen mental agility",
    tag: "Training",
    tagColor: "bg-[hsl(258_100%_93%)] text-[hsl(258_100%_50%)]",
    gradient: "from-[hsl(258_100%_93%)] to-[hsl(197_100%_93%)]",
    ready: false,
  },
] as const;

// ── Productivity Page ─────────────────────────────────────────────────────

export default function Productivity() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[hsl(258_20%_90%)] bg-gradient-hero">
        <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">
          Productivity Tools
        </h1>
        <p className="text-sm text-[hsl(232_20%_50%)] mt-1">
          Eight AI-powered tools to unlock your peak performance
        </p>
      </div>

      {/* Tools grid */}
      <div className="p-6 grid grid-cols-2 xl:grid-cols-4 gap-4">
        {TOOLS.map(({ id, icon: Icon, title, description, tag, tagColor, gradient, ready }) => (
          <div
            key={id}
            id={`tool-${id}`}
            className={cn(
              "glass-card rounded-2xl p-5 flex flex-col gap-3",
              "hover-glow transition-all cursor-pointer group",
              !ready && "opacity-90"
            )}
          >
            {/* Icon */}
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br", gradient)}>
              <Icon className="text-[hsl(232_45%_25%)]" size={20} />
            </div>

            {/* Tag */}
            <span className={cn("self-start text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full", tagColor)}>
              {tag}
            </span>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)] leading-tight">
                {title}
              </h3>
              <p className="text-xs text-[hsl(232_20%_55%)] mt-1 leading-relaxed line-clamp-2">
                {description}
              </p>
            </div>

            {/* CTA */}
            <button
              id={`btn-open-${id}`}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-heading font-semibold",
                "bg-gradient-hero border border-[hsl(258_20%_90%)]",
                "text-[hsl(258_100%_60%)] group-hover:bg-gradient-primary group-hover:text-[hsl(232_45%_16%)]",
                "transition-all"
              )}
            >
              <span>{ready ? "Open" : "Coming Soon"}</span>
              <ChevronRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
