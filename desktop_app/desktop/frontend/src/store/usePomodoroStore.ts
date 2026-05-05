import { create } from "zustand";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number;
  isRunning: boolean;
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  sessionsCompleted: number;
  
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  switchMode: (mode: PomodoroMode) => void;
  setSettings: (focus: number, short: number, long: number) => void;
  completeSession: () => void;
}

const DEFAULT_FOCUS = 25 * 60;
const DEFAULT_SHORT_BREAK = 5 * 60;
const DEFAULT_LONG_BREAK = 15 * 60;

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: "focus",
  timeLeft: DEFAULT_FOCUS,
  isRunning: false,
  focusTime: DEFAULT_FOCUS,
  shortBreakTime: DEFAULT_SHORT_BREAK,
  longBreakTime: DEFAULT_LONG_BREAK,
  sessionsCompleted: 0,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => {
    const { mode, focusTime, shortBreakTime, longBreakTime } = get();
    let newTimeLeft = focusTime;
    if (mode === "shortBreak") newTimeLeft = shortBreakTime;
    if (mode === "longBreak") newTimeLeft = longBreakTime;
    set({ isRunning: false, timeLeft: newTimeLeft });
  },
  tick: () => {
    const { timeLeft, isRunning } = get();
    if (isRunning && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    }
  },
  switchMode: (mode: PomodoroMode) => {
    const { focusTime, shortBreakTime, longBreakTime } = get();
    let newTimeLeft = focusTime;
    if (mode === "shortBreak") newTimeLeft = shortBreakTime;
    if (mode === "longBreak") newTimeLeft = longBreakTime;
    set({ mode, timeLeft: newTimeLeft, isRunning: false });
  },
  setSettings: (focus: number, short: number, long: number) => {
    const { mode, isRunning } = get();
    set({ focusTime: focus, shortBreakTime: short, longBreakTime: long });
    if (!isRunning) {
      let newTimeLeft = focus;
      if (mode === "shortBreak") newTimeLeft = short;
      if (mode === "longBreak") newTimeLeft = long;
      set({ timeLeft: newTimeLeft });
    }
  },
  completeSession: () => set((state) => ({ sessionsCompleted: state.sessionsCompleted + 1 }))
}));
