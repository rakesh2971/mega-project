import { useState } from "react";
import { PowerOff, AlertTriangle, Wifi, Mic, Brain, CheckCircle, XCircle } from "lucide-react";
import { triggerKillSwitch } from "@/hooks/useTauri";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ── System status row ─────────────────────────────────────────────────────

function StatusRow({
  icon: Icon,
  label,
  status,
  active,
}: {
  icon: React.ElementType;
  label: string;
  status: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-red-100 last:border-0">
      <div className={cn("p-2 rounded-lg", active ? "bg-red-100" : "bg-gray-100")}>
        <Icon size={15} className={active ? "text-red-500" : "text-gray-400"} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)]">{label}</p>
        <p className="text-xs text-[hsl(232_20%_55%)]">{status}</p>
      </div>
      {active ? (
        <XCircle size={16} className="text-red-400" />
      ) : (
        <CheckCircle size={16} className="text-gray-300" />
      )}
    </div>
  );
}

// ── KillSwitch Page ───────────────────────────────────────────────────────

export default function KillSwitch() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const { wsStatus, isListening, isSpeaking, killSwitchActive, setKillSwitchActive } =
    useAppStore();

  const systemProcesses = [
    { icon: Wifi,  label: "WebSocket Connection", status: wsStatus === "connected" ? "Connected to FastAPI backend" : "Disconnected", active: wsStatus === "connected" },
    { icon: Mic,   label: "Voice Recognition",   status: isListening ? "Actively listening" : "Idle",                               active: isListening },
    { icon: Brain, label: "AI Processing",        status: "NLP engine status: idle",                                                 active: false },
    { icon: Brain, label: "TTS Engine",           status: isSpeaking ? "Currently speaking" : "Idle",                               active: isSpeaking },
  ];

  const handleKillSwitch = async () => {
    setIsShuttingDown(true);
    setKillSwitchActive(true);
    setShowConfirm(false);
    // Give a brief visual moment before shutting down
    await new Promise((r) => setTimeout(r, 1000));
    await triggerKillSwitch();
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-red-50/30 to-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-red-100 bg-red-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100">
            <PowerOff className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">
              Kill Switch
            </h1>
            <p className="text-sm text-[hsl(232_20%_50%)] mt-0.5">
              Emergency stop for all NeuroMate AI processes
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Warning panel */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-heading font-bold text-red-800">
                What this does
              </h2>
              <ul className="mt-2 space-y-1 text-xs text-red-700 list-disc list-inside">
                <li>Immediately stops all AI inference and NLP processing</li>
                <li>Disconnects the WebSocket connection to the backend</li>
                <li>Stops voice recognition and text-to-speech</li>
                <li>Terminates the FastAPI Python backend process</li>
                <li>Closes the application completely</li>
              </ul>
            </div>
          </div>
        </div>

        {/* System process status */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)] mb-1">
            Active Processes
          </h3>
          <p className="text-xs text-[hsl(232_20%_55%)] mb-3">
            The kill switch will terminate all of the following:
          </p>
          {systemProcesses.map((p) => (
            <StatusRow key={p.label} {...p} />
          ))}
        </div>

        {/* Kill switch button */}
        {!showConfirm ? (
          <button
            id="btn-kill-switch-trigger"
            onClick={() => setShowConfirm(true)}
            disabled={isShuttingDown || killSwitchActive}
            className={cn(
              "w-full py-4 rounded-2xl font-heading font-bold text-base",
              "flex items-center justify-center gap-3",
              "border-2 border-red-400 text-red-600",
              "hover:bg-red-500 hover:text-white hover:border-red-500",
              "transition-all duration-200 hover-glow",
              (isShuttingDown || killSwitchActive) && "opacity-50 cursor-not-allowed"
            )}
          >
            <PowerOff size={20} />
            {isShuttingDown ? "Shutting Down…" : "Activate Kill Switch"}
          </button>
        ) : (
          /* Confirmation modal inline */
          <div className="rounded-2xl border-2 border-red-400 bg-white p-5 space-y-4 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-heading font-bold text-red-700">Are you sure?</h3>
            </div>
            <p className="text-sm text-[hsl(232_20%_45%)]">
              This will immediately terminate all AI processes and close NeuroMate.
              Any unsaved data may be lost.
            </p>
            <div className="flex gap-3">
              <button
                id="btn-kill-switch-confirm"
                onClick={handleKillSwitch}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-heading font-bold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <PowerOff size={15} />
                Yes, shut everything down
              </button>
              <button
                id="btn-kill-switch-cancel"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[hsl(258_20%_88%)] text-[hsl(232_20%_55%)] font-heading font-semibold text-sm hover:bg-[hsl(258_30%_97%)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Safety note */}
        <p className="text-xs text-center text-[hsl(232_20%_60%)] mt-2">
          You can relaunch NeuroMate from the Start Menu at any time.
        </p>
      </div>
    </div>
  );
}
