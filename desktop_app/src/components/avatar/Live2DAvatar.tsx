import { useRef } from "react";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useLive2D } from "@/hooks/useLive2D";
import { useAppStore } from "@/store/useAppStore";
import { restoreFromFloat } from "@/services/tauri";
import { cn } from "@/lib/cn";
import type { AvatarMood } from "@/types/avatar";

import { MODEL_PATH, CANVAS_W, CANVAS_H, MOOD_GLOW, FLOAT_CANVAS_W } from "@/constants/avatar";



interface Live2DAvatarProps {
  mode?: "home" | "float";
  mood?: string;
}

export default function Live2DAvatar({ mode = "home", mood = "neutral" }: Live2DAvatarProps) {
  // PIXI appends its own <canvas> inside this div — no React canvas needed
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSpeaking } = useAppStore();
  const isFloat = mode === "float";

  const { isReady, isLoading, error } = useLive2D({
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    modelPath: MODEL_PATH,
    mood: mood as AvatarMood,
    isSpeaking,
    width:  CANVAS_W,
    height: CANVAS_H,
  });

  const glowClass = MOOD_GLOW[mood] ?? MOOD_GLOW.neutral;

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center select-none",
        isFloat ? "w-full h-full bg-transparent" : "w-full mx-auto"
      )}
      style={isFloat ? {} : { maxWidth: FLOAT_CANVAS_W, height: CANVAS_H + 28 }}
    >
      {/* Glow ring */}
      <div className={cn(
        "absolute rounded-full opacity-25 animate-pulse pointer-events-none transition-colors duration-700",
        isFloat ? "w-40 h-40" : "w-64 h-64",
        glowClass
      )} />

      {/* PIXI container — canvas injected here by hook */}
      <div
        ref={containerRef}
        className="relative z-10"
        style={{
          width:    isFloat ? "100%" : `${CANVAS_W}px`,
          height:   isFloat ? "100%"  : `${CANVAS_H}px`,
          opacity:  isReady ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}
      />

      {/* Loading spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
          <div className="glass-card rounded-2xl px-6 py-4 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(258_100%_65%)]" />
            <p className="text-xs font-heading font-medium text-[hsl(232_20%_50%)]">Loading avatar…</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[hsl(258_100%_65%)] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6">
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 max-w-[260px] text-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-xs font-heading font-semibold text-[hsl(232_45%_16%)]">Avatar failed to load</p>
            <p className="text-[10px] text-[hsl(232_20%_50%)] break-words">{error}</p>
          </div>
        </div>
      )}

      {/* Mood label */}
      {isReady && !isFloat && (
        <div className="mt-2 flex items-center gap-1.5 z-10">
          <Sparkles className="h-3 w-3 text-[hsl(258_100%_65%)]" />
          <span className="text-xs font-heading font-medium text-[hsl(232_20%_50%)] capitalize">
            {mood} mood
          </span>
        </div>
      )}


    </div>
  );
}
