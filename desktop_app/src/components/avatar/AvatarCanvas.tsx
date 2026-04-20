import { Brain, Sparkles } from "lucide-react";
import { restoreFromFloat } from "@/hooks/useTauri";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ── AvatarCanvas (Home + Float) ───────────────────────────────────────────

interface AvatarCanvasProps {
  /** "home" = embedded in Home page, "float" = standalone floating window */
  mode?: "home" | "float";
  mood?: string;
}

export default function AvatarCanvas({ mode = "home", mood = "neutral" }: AvatarCanvasProps) {
  const isFloat = mode === "float";

  const moodColors: Record<string, string> = {
    neutral:   "from-[hsl(258_100%_83%)] to-[hsl(197_100%_84%)]",
    happy:     "from-[hsl(47_100%_78%)] to-[hsl(181_84%_66%)]",
    focused:   "from-[hsl(220_100%_75%)] to-[hsl(258_100%_83%)]",
    concerned: "from-[hsl(258_60%_75%)] to-[hsl(290_50%_70%)]",
    excited:   "from-[hsl(320_100%_75%)] to-[hsl(47_100%_78%)]",
  };

  const gradientClass = moodColors[mood] ?? moodColors.neutral;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        isFloat
          ? "w-full h-full bg-transparent cursor-grab active:cursor-grabbing"
          : "w-full max-w-[280px] mx-auto"
      )}
    >
      {/* Glow ring */}
      <div
        className={cn(
          "absolute rounded-full opacity-30 animate-pulse",
          isFloat ? "w-48 h-48" : "w-56 h-56",
          `bg-gradient-to-br ${gradientClass}`
        )}
      />

      {/* Avatar circle placeholder */}
      <div
        className={cn(
          "relative z-10 rounded-full flex items-center justify-center shadow-[var(--shadow-glow)]",
          "bg-gradient-to-br",
          gradientClass,
          isFloat ? "w-32 h-32" : "w-44 h-44",
          "animate-[float_6s_ease-in-out_infinite]"
        )}
      >
        <Brain
          className="text-white/90 drop-shadow-lg"
          size={isFloat ? 52 : 72}
          strokeWidth={1.5}
        />
      </div>

      {/* Mood label */}
      <div className="mt-4 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-[hsl(258_100%_65%)]" />
        <span className="text-xs font-heading font-medium text-[hsl(232_20%_50%)] capitalize">
          {mood} mood
        </span>
      </div>

      {/* Float mode: tap to restore */}
      {isFloat && (
        <button
          id="btn-restore-main"
          onClick={restoreFromFloat}
          className={cn(
            "mt-3 px-4 py-1.5 rounded-full text-xs font-heading font-semibold",
            "bg-gradient-primary text-[hsl(232_45%_16%)]",
            "shadow-[var(--shadow-card)] hover-glow transition-all"
          )}
        >
          Open NeuroMate
        </button>
      )}
    </div>
  );
}
