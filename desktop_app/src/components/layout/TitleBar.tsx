import { Brain, Minus, Maximize2, X } from "lucide-react";
import { minimizeToFloat, toggleMaximize, closeWindow } from "@/hooks/useTauri";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ── TitleBar ──────────────────────────────────────────────────────────────

export default function TitleBar() {
  const { wsStatus, isListening } = useAppStore();

  return (
    <header
      className={cn(
        "titlebar-drag",
        "flex items-center justify-between px-4",
        "glass-card border-b border-[hsl(258_20%_90%)]",
        "h-[var(--titlebar-height)] shrink-0 select-none z-50"
      )}
    >
      {/* ── Left: Logo ─────────────────────────────────────────── */}
      <div className="titlebar-no-drag flex items-center gap-2">
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[hsl(258_100%_83%_/_0.1)] transition-colors">
          <Brain className="h-5 w-5 text-[hsl(258_100%_83%)]" />
          <span
            className="text-sm font-heading font-bold gradient-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            NeuroMate
          </span>
        </div>
      </div>

      {/* ── Center: Status indicators ───────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* WebSocket status dot */}
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              wsStatus === "connected"
                ? "bg-green-400 shadow-[0_0_6px_hsl(142_76%_56%_/_0.6)]"
                : wsStatus === "connecting"
                ? "bg-yellow-400 animate-pulse"
                : "bg-gray-300"
            )}
          />
          <span className="text-xs text-[hsl(232_20%_50%)] font-medium">
            {wsStatus === "connected"
              ? "Connected"
              : wsStatus === "connecting"
              ? "Connecting…"
              : "Offline"}
          </span>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(258_100%_83%_/_0.15)] border border-[hsl(258_100%_83%_/_0.3)]">
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(258_100%_83%)] animate-pulse" />
            <span className="text-xs text-[hsl(258_100%_65%)] font-medium">Listening</span>
          </div>
        )}
      </div>

      {/* ── Right: Window controls ──────────────────────────────── */}
      <div className="titlebar-no-drag flex items-center">
        {/* Minimize to Float */}
        <button
          id="btn-minimize-float"
          onClick={minimizeToFloat}
          title="Minimize to floating avatar"
          className={cn(
            "group flex items-center justify-center w-10 h-[var(--titlebar-height)]",
            "text-[hsl(232_20%_50%)] hover:text-[hsl(258_100%_65%)]",
            "hover:bg-[hsl(258_100%_83%_/_0.15)] transition-colors"
          )}
        >
          <Minus className="h-4 w-4" />
        </button>

        {/* Maximize */}
        <button
          id="btn-maximize"
          onClick={toggleMaximize}
          title="Maximize"
          className={cn(
            "group flex items-center justify-center w-10 h-[var(--titlebar-height)]",
            "text-[hsl(232_20%_50%)] hover:text-[hsl(232_45%_16%)]",
            "hover:bg-[hsl(258_30%_95%)] transition-colors"
          )}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        {/* Close */}
        <button
          id="btn-close"
          onClick={closeWindow}
          title="Close"
          className={cn(
            "group flex items-center justify-center w-10 h-[var(--titlebar-height)]",
            "text-[hsl(232_20%_50%)] hover:text-white",
            "hover:bg-red-500 transition-colors"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
