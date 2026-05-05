import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Play, Pause, RotateCcw, Settings } from "lucide-react";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { usePomodoroStore, PomodoroMode } from "@/store/usePomodoroStore";
import { cn } from "@/lib/cn";

export default function Pomodoro() {
  const {
    mode,
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    tick,
    switchMode,
    focusTime,
    shortBreakTime,
    longBreakTime,
    sessionsCompleted,
    completeSession
  } = usePomodoroStore();

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  useEffect(() => {
    async function handleTimerComplete() {
      if (timeLeft === 0 && isRunning) {
        pause();
        
        // Setup Desktop Notification
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
          const permission = await requestPermission();
          permissionGranted = permission === "granted";
        }
        
        if (permissionGranted) {
          sendNotification({
            title: mode === "focus" ? "Focus Session Complete!" : "Break Time Over!",
            body: mode === "focus" ? "Time to take a well-deserved break." : "Time to get back to work.",
          });
        }
        
        // Auto-switch mode logic
        if (mode === "focus") {
          completeSession();
          // We get the latest state after completeSession
          const currentSessions = usePomodoroStore.getState().sessionsCompleted;
          if (currentSessions % 4 === 0) {
            switchMode("longBreak");
          } else {
            switchMode("shortBreak");
          }
        } else {
          switchMode("focus");
        }

        // Auto-start the next phase
        start();
      }
    }
    handleTimerComplete();
  }, [timeLeft, isRunning, mode, pause, switchMode, completeSession, start]);

  // Formatting time
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Theme based on mode
  let primaryColor = "text-purple-600";
  let ringColor = "stroke-purple-500";
  let bgGlow = "from-purple-500/20";
  let modeTitle = "Focus Session";
  
  // Calculate percentage for circular progress
  let totalTime = focusTime;
  
  if (mode === "shortBreak") {
    primaryColor = "text-teal-600";
    ringColor = "stroke-teal-500";
    bgGlow = "from-teal-500/20";
    modeTitle = "Short Break";
    totalTime = shortBreakTime;
  } else if (mode === "longBreak") {
    primaryColor = "text-blue-600";
    ringColor = "stroke-blue-500";
    bgGlow = "from-blue-500/20";
    modeTitle = "Long Break";
    totalTime = longBreakTime;
  }

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / totalTime) * circumference;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[hsl(258_30%_98%)] relative">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-[hsl(258_20%_90%)] bg-white/50 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-4">
          <Link to="/productivity" className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors">
            <ChevronLeft className="text-[hsl(232_45%_25%)]" size={20} />
          </Link>
          <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)]">
            Pomodoro Timer
          </h1>
        </div>
        <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-[hsl(258_20%_90%)] rounded-xl transition-colors">
          <Settings className="text-[hsl(232_20%_55%)]" size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="absolute inset-0 bg-[hsl(232_45%_16%)/0.3] backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm border border-[hsl(258_20%_90%)]">
            <h2 className="text-lg font-heading font-bold text-[hsl(232_45%_16%)] mb-4">Timer Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[hsl(232_20%_55%)] mb-1">Focus Time (minutes)</label>
                <input type="number" defaultValue={focusTime / 60} id="setting-focus" className="w-full px-3 py-2 rounded-xl bg-[hsl(258_30%_98%)] border border-[hsl(258_20%_90%)] outline-none focus:border-[hsl(258_100%_65%/0.4)] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(232_20%_55%)] mb-1">Short Break (minutes)</label>
                <input type="number" defaultValue={shortBreakTime / 60} id="setting-short" className="w-full px-3 py-2 rounded-xl bg-[hsl(258_30%_98%)] border border-[hsl(258_20%_90%)] outline-none focus:border-teal-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[hsl(232_20%_55%)] mb-1">Long Break (minutes)</label>
                <input type="number" defaultValue={longBreakTime / 60} id="setting-long" className="w-full px-3 py-2 rounded-xl bg-[hsl(258_30%_98%)] border border-[hsl(258_20%_90%)] outline-none focus:border-blue-400 transition-all" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[hsl(232_20%_55%)] hover:bg-[hsl(258_20%_90%)] transition-all">Cancel</button>
              <button onClick={() => {
                const f = parseInt((document.getElementById('setting-focus') as HTMLInputElement).value) || 25;
                const s = parseInt((document.getElementById('setting-short') as HTMLInputElement).value) || 5;
                const l = parseInt((document.getElementById('setting-long') as HTMLInputElement).value) || 15;
                usePomodoroStore.getState().setSettings(f * 60, s * 60, l * 60);
                setShowSettings(false);
              }} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[hsl(258_100%_60%)] hover:bg-[hsl(258_100%_50%)] transition-all">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Glow background */}
        <div className={cn("absolute inset-0 bg-gradient-to-b to-transparent opacity-50 pointer-events-none", bgGlow)} />

        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-[hsl(258_20%_90%)] shadow-sm z-10 mb-12">
          {(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-heading font-semibold transition-all",
                mode === m 
                  ? cn("bg-white shadow-sm border border-[hsl(258_20%_90%)]", primaryColor)
                  : "text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)]"
              )}
            >
              {m === "focus" ? "Focus" : m === "shortBreak" ? "Short Break" : "Long Break"}
            </button>
          ))}
        </div>

        {/* Timer Circular Display */}
        <div className="relative flex items-center justify-center z-10">
          <svg width="300" height="300" viewBox="0 0 300 300" className="-rotate-90">
            {/* Background ring */}
            <circle
              cx="150" cy="150" r={radius}
              fill="transparent"
              strokeWidth="8"
              className="stroke-[hsl(258_20%_90%)]"
            />
            {/* Progress ring */}
            <circle
              cx="150" cy="150" r={radius}
              fill="transparent"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn("transition-all duration-1000 ease-linear", ringColor)}
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span className={cn("text-sm font-heading font-bold mb-2 uppercase tracking-widest", primaryColor)}>
              {modeTitle}
            </span>
            <span className="text-6xl font-heading font-bold text-[hsl(232_45%_16%)] tracking-tight">
              {formattedTime}
            </span>
            <span className="text-xs font-semibold text-[hsl(232_20%_55%)] mt-2 bg-white/50 px-2 py-0.5 rounded-full border border-[hsl(258_20%_90%)]">
              Sessions: {sessionsCompleted}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-12 z-10">
          <button
            onClick={reset}
            className="p-4 rounded-full bg-white border border-[hsl(258_20%_90%)] shadow-sm text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)] hover:bg-[hsl(258_20%_96%)] transition-all"
          >
            <RotateCcw size={24} />
          </button>
          
          <button
            onClick={isRunning ? pause : start}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95",
              isRunning 
                ? "bg-white border-2 border-[hsl(258_20%_90%)] text-[hsl(232_45%_16%)]" 
                : cn("text-white bg-linear-to-br", mode === "focus" ? "from-purple-500 to-indigo-600" : mode === "shortBreak" ? "from-teal-400 to-emerald-500" : "from-blue-400 to-indigo-500")
            )}
          >
            {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
}
