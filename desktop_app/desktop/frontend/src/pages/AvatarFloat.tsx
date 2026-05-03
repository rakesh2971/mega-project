import { useState } from "react";
import { Mic, MicOff, Maximize2, X } from "lucide-react";
import { restoreFromFloat, closeWindow } from "@/services/tauri";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";
import Live2DAvatar from "@/components/avatar/Live2DAvatar";

// ── AvatarFloat Page ──────────────────────────────────────────────────────────
// Fully transparent window — only Teto + a floating mic button are visible.

export default function AvatarFloat() {
  const { avatarMood } = useAppStore();
  const [isListening, setIsListening] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const moodColors: Record<string, { from: string; to: string; glow: string }> = {
    neutral:   { from: "hsl(258 100% 75%)", to: "hsl(197 100% 72%)", glow: "hsl(258 100% 75% / 0.55)" },
    happy:     { from: "hsl(47 100% 65%)",  to: "hsl(181 84% 58%)",  glow: "hsl(47 100% 65% / 0.55)"  },
    focused:   { from: "hsl(220 100% 68%)", to: "hsl(258 100% 75%)", glow: "hsl(220 100% 68% / 0.55)" },
    concerned: { from: "hsl(258 60% 68%)",  to: "hsl(290 50% 62%)",  glow: "hsl(258 60% 68% / 0.55)"  },
    excited:   { from: "hsl(320 100% 68%)", to: "hsl(47 100% 65%)",  glow: "hsl(320 100% 68% / 0.55)" },
  };
  const mood = moodColors[avatarMood] ?? moodColors.neutral;

  const handleDrag = () => getCurrentWindow().startDragging();
  const handleTalk = () => setIsListening((p) => !p);

  return (
    // Fully transparent root — Tauri window transparent:true handles the OS side
    <div
      className="w-full h-screen relative overflow-hidden select-none"
      style={{ background: "transparent" }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* ── Avatar — fills entire window, draggable ─────────────────────── */}
      <div
        className="absolute inset-0"
        onMouseDown={handleDrag}
        style={{ cursor: "grab" }}
      >
        <Live2DAvatar mode="float" mood={avatarMood} />
      </div>

      {/* ── Mic button — bottom-center, always visible ──────────────────── */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          id="float-btn-talk"
          onClick={handleTalk}
          title={isListening ? "Stop" : "Talk to NeuroMate"}
          className={cn(
            "relative w-11 h-11 rounded-full flex items-center justify-center",
            "transition-all duration-300 active:scale-90"
          )}
          style={{
            background: isListening
              ? `linear-gradient(135deg, ${mood.from}, ${mood.to})`
              : "hsl(0 0% 100% / 0.18)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1.5px solid ${isListening ? "transparent" : "hsl(0 0% 100% / 0.4)"}`,
            boxShadow: isListening
              ? `0 0 0 5px ${mood.glow}, 0 4px 18px ${mood.glow}`
              : "0 2px 12px hsl(0 0% 0% / 0.15)",
          }}
        >
          {/* Ripple rings when active */}
          {isListening && (
            <>
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-35"
                style={{ background: `linear-gradient(135deg, ${mood.from}, ${mood.to})` }}
              />
              <span
                className="absolute -inset-2 rounded-full animate-ping opacity-20"
                style={{
                  background: `linear-gradient(135deg, ${mood.from}, ${mood.to})`,
                  animationDelay: "0.35s",
                }}
              />
            </>
          )}
          {isListening ? (
            <MicOff className="h-4 w-4 text-white relative z-10" strokeWidth={2.5} />
          ) : (
            <Mic
              className="h-4 w-4 relative z-10"
              strokeWidth={2.5}
              style={{ color: "hsl(0 0% 100% / 0.9)" }}
            />
          )}
        </button>

        {/* Tiny status pill */}
        <span
          className="text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
          style={{
            background: "hsl(0 0% 0% / 0.28)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: isListening ? mood.from : "hsl(0 0% 100% / 0.8)",
          }}
        >
          {isListening ? "Listening…" : "Talk"}
        </span>
      </div>

      {/* ── Window controls — fade in on hover, top-right ───────────────── */}
      <div
        className={cn(
          "absolute top-2 right-2 z-30 flex items-center gap-1",
          "transition-opacity duration-200",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          id="float-btn-restore"
          onClick={restoreFromFloat}
          title="Open full app"
          className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "hsl(0 0% 100% / 0.22)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid hsl(0 0% 100% / 0.35)",
          }}
        >
          <Maximize2 className="h-2.5 w-2.5 text-white" />
        </button>
        <button
          id="float-btn-close"
          onClick={closeWindow}
          title="Close"
          className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{
            background: "hsl(0 80% 60% / 0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid hsl(0 0% 100% / 0.3)",
          }}
        >
          <X className="h-2.5 w-2.5 text-white" />
        </button>
      </div>
    </div>
  );
}
