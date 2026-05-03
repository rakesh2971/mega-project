import { useState } from "react";
import { Brain, Minus, Maximize2, Minimize2, X } from "lucide-react";
import { minimizeToFloat, toggleMaximize, closeWindow } from "@/services/tauri";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";

// ── TitleBar ──────────────────────────────────────────────────────────────

export default function TitleBar() {
  const { wsStatus, isListening } = useAppStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleMinimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await minimizeToFloat();
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMaximized((prev) => !prev);
    await toggleMaximize();
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setClosing(true);
    await closeWindow();
  };

  return (
    <header
      className={cn(
        "flex items-center justify-between",
        "glass-card border-b border-[hsl(258_20%_90%)]",
        "h-(--titlebar-height) shrink-0 select-none z-50"
      )}
    >
      {/* ── Left: Logo (no-drag) ────────────────────────────────── */}
      <div
        className="titlebar-no-drag flex items-center gap-2 px-4 h-full"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[hsl(258_100%_83%/0.1)] transition-colors cursor-default">
          <Brain className="h-5 w-5 text-[hsl(258_100%_83%)]" />
          <span
            className="text-sm font-bold gradient-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            NeuroMate
          </span>
        </div>
      </div>

      {/* ── Center: Drag region + Status ───────────────────────── */}
      <div
        className="titlebar-drag flex-1 flex items-center justify-center gap-3 h-full cursor-grab active:cursor-grabbing"
        data-tauri-drag-region
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        {/* WebSocket status dot */}
        <div className="flex items-center gap-1.5 pointer-events-none">
          <div
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              wsStatus === "connected"
                ? "bg-green-400 shadow-[0_0_6px_hsl(142_76%_56%/0.6)]"
                : wsStatus === "connecting"
                ? "bg-yellow-400 animate-pulse"
                : "bg-gray-300"
            )}
          />
          <span className="text-xs text-muted-foreground font-medium">
            {wsStatus === "connected"
              ? "Connected"
              : wsStatus === "connecting"
              ? "Connecting…"
              : "Offline"}
          </span>
        </div>

        {isListening && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(258_100%_83%/0.15)] border border-[hsl(258_100%_83%/0.3)] pointer-events-none">
            <div className="h-1.5 w-1.5 rounded-full bg-[hsl(258_100%_83%)] animate-pulse" />
            <span className="text-xs text-[hsl(258_100%_65%)] font-medium">Listening</span>
          </div>
        )}
      </div>

      {/* ── Right: Window controls (no-drag) ───────────────────── */}
      <div
        className="titlebar-no-drag flex items-center h-full"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          id="btn-minimize-float"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleMinimize}
          title="Minimize to floating avatar"
          className={cn(
            "flex items-center justify-center w-11 h-full",
            "text-[hsl(232_20%_60%)]",
            "hover:text-[hsl(258_100%_65%)] hover:bg-[hsl(258_100%_83%/0.12)]",
            "active:scale-90 active:bg-[hsl(258_100%_83%/0.2)]",
            "transition-all duration-150 cursor-default"
          )}
        >
          <Minus className="h-[14px] w-[14px]" strokeWidth={2.5} />
        </button>

        {/* Maximize / Restore */}
        <button
          id="btn-maximize"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
          className={cn(
            "flex items-center justify-center w-11 h-full",
            "text-[hsl(232_20%_60%)]",
            "hover:text-[hsl(232_45%_25%)] hover:bg-[hsl(258_30%_93%)]",
            "active:scale-90 active:bg-[hsl(258_30%_87%)]",
            "transition-all duration-150 cursor-default"
          )}
        >
          {isMaximized ? (
            <Minimize2 className="h-[13px] w-[13px]" strokeWidth={2.5} />
          ) : (
            <Maximize2 className="h-[13px] w-[13px]" strokeWidth={2.5} />
          )}
        </button>

        {/* Close */}
        <button
          id="btn-close"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleClose}
          title="Close"
          disabled={closing}
          className={cn(
            "flex items-center justify-center w-11 h-full",
            "text-[hsl(232_20%_60%)]",
            "hover:text-white hover:bg-red-500",
            "active:scale-90 active:bg-red-600",
            "transition-all duration-150 cursor-default",
            closing && "opacity-50 pointer-events-none"
          )}
        >
          <X className="h-[14px] w-[14px]" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
