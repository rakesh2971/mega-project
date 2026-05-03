import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, X, CheckCircle2, Heart, Focus, BookOpen, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

// ── Dummy user for now (same as community) ────────────────────────────────
const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001";

// ── Types ─────────────────────────────────────────────────────────────────
type Tab = "task" | "mood" | "focus" | "journal" | "routine" | "meditation";

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "task",       label: "Task",       icon: CheckCircle2, color: "text-green-500" },
  { id: "mood",       label: "Mood",       icon: Heart,        color: "text-pink-500" },
  { id: "focus",      label: "Focus",      icon: Focus,        color: "text-blue-500" },
  { id: "journal",    label: "Journal",    icon: BookOpen,     color: "text-purple-500" },
  { id: "routine",    label: "Routine",    icon: RotateCcw,    color: "text-orange-500" },
  { id: "meditation", label: "Meditation", icon: Sparkles,     color: "text-teal-500" },
];

// ── Shared input/textarea styles ──────────────────────────────────────────
const inputCls = "w-full text-xs px-4 py-3 rounded-2xl bg-white/60 border border-white/40 shadow-sm outline-none focus:bg-white focus:border-[hsl(258_100%_83%)] focus:ring-4 focus:ring-[hsl(258_100%_83%_/_0.2)] text-[hsl(232_45%_16%)] placeholder:text-[hsl(232_20%_55%)] transition-all";
const labelCls = "block text-[11px] font-bold tracking-wide text-[hsl(232_45%_16%)] uppercase mb-1.5 ml-1 opacity-80";

// ── Task Form ─────────────────────────────────────────────────────────────
function TaskForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await invoke("create_task", {
        title: title.trim(),
        description: desc.trim() || null,
        completed,
        userId: DUMMY_USER_ID,
      });
      setTitle(""); setDesc(""); setCompleted(false);
      onSuccess();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="group relative">
        <label className={labelCls}>Task Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Complete UI mockups" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Description (optional)</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Add any details or notes..." rows={3} className={cn(inputCls, "resize-none")} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer select-none py-2 ml-1">
        <div className="relative flex items-center justify-center">
          <input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)} className="peer sr-only" />
          <div className="w-5 h-5 border-2 border-[hsl(258_100%_83%)] rounded-md peer-checked:bg-[hsl(258_100%_65%)] peer-checked:border-[hsl(258_100%_65%)] transition-all shadow-sm flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-xs font-semibold text-[hsl(232_45%_16%)]">Mark as completed</span>
      </label>
      <SubmitBtn loading={loading} onClick={submit} label="Add Task" disabled={!title.trim()} />
    </div>
  );
}

// ── Mood Form ─────────────────────────────────────────────────────────────
const MOOD_OPTIONS = [
  { level: 1, label: "Very Sad",   emoji: "😢", type: "very_sad", color: "hover:bg-blue-100 hover:border-blue-300 peer-checked:bg-blue-100 peer-checked:border-blue-400 peer-checked:text-blue-700" },
  { level: 2, label: "Sad",        emoji: "😕", type: "sad", color: "hover:bg-slate-100 hover:border-slate-300 peer-checked:bg-slate-100 peer-checked:border-slate-400 peer-checked:text-slate-700" },
  { level: 3, label: "Neutral",    emoji: "😐", type: "neutral", color: "hover:bg-gray-100 hover:border-gray-300 peer-checked:bg-gray-100 peer-checked:border-gray-400 peer-checked:text-gray-700" },
  { level: 4, label: "Happy",      emoji: "😊", type: "happy", color: "hover:bg-green-100 hover:border-green-300 peer-checked:bg-green-100 peer-checked:border-green-400 peer-checked:text-green-700" },
  { level: 5, label: "Amazing",    emoji: "😄", type: "very_happy", color: "hover:bg-pink-100 hover:border-pink-300 peer-checked:bg-pink-100 peer-checked:border-pink-400 peer-checked:text-pink-700" },
];

function MoodForm({ onSuccess }: { onSuccess: () => void }) {
  const [level, setLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const mood = MOOD_OPTIONS.find(m => m.level === level);
      await invoke("create_mood", {
        moodLevel: level,
        moodType: mood?.type || "neutral",
        notes: notes.trim() || null,
        userId: DUMMY_USER_ID,
      });
      setNotes("");
      onSuccess();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className={labelCls}>How are you feeling right now?</label>
        <div className="flex gap-2 mt-2">
          {MOOD_OPTIONS.map(m => (
            <label key={m.level} className="flex-1 cursor-pointer group relative">
              <input type="radio" name="mood" checked={level === m.level} onChange={() => setLevel(m.level)} className="peer sr-only" />
              <div className={cn("flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-transparent bg-white/50 transition-all duration-300", m.color)}>
                <span className="text-2xl mb-1 transform group-hover:scale-110 group-active:scale-95 transition-transform">{m.emoji}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 peer-checked:opacity-100">{m.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className={labelCls}>Reflection (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What's contributing to your mood?" rows={3} className={cn(inputCls, "resize-none")} />
      </div>
      <SubmitBtn loading={loading} onClick={submit} label="Log Mood Check-in" />
    </div>
  );
}

// ── Focus Form ────────────────────────────────────────────────────────────
function FocusForm({ onSuccess }: { onSuccess: () => void }) {
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState(25);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!activity.trim()) return;
    setLoading(true);
    try {
      await invoke("create_focus_session", {
        activity: activity.trim(),
        durationMinutes: duration,
        notes: notes.trim() || null,
        userId: DUMMY_USER_ID,
      });
      setActivity(""); setDuration(25); setNotes("");
      onSuccess();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Focus Target</label>
        <input value={activity} onChange={e => setActivity(e.target.value)} placeholder="What will you accomplish?" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Duration (Minutes)</label>
        <input type="number" min={1} max={480} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Session Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any insights from this session?" rows={3} className={cn(inputCls, "resize-none")} />
      </div>
      <SubmitBtn loading={loading} onClick={submit} label="Record Focus Session" disabled={!activity.trim()} />
    </div>
  );
}

// ── Journal Form ──────────────────────────────────────────────────────────
function JournalForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await invoke("create_journal", {
        title: title.trim(),
        content: content.trim(),
        mood: mood.trim() || null,
        userId: DUMMY_USER_ID,
      });
      setTitle(""); setContent(""); setMood("");
      onSuccess();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Entry Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="A glimpse into today..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Mood Tag (optional)</label>
        <input value={mood} onChange={e => setMood(e.target.value)} placeholder="e.g. Grateful, Anxious, Excited" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Thoughts & Reflections</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Let your thoughts flow freely..." rows={5} className={cn(inputCls, "resize-none")} />
      </div>
      <SubmitBtn loading={loading} onClick={submit} label="Save Journal Entry" disabled={!title.trim() || !content.trim()} />
    </div>
  );
}

// ── Routine Form ──────────────────────────────────────────────────────────
function RoutineForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await invoke("create_routine", {
        name: name.trim(),
        description: desc.trim() || null,
        completed,
        userId: DUMMY_USER_ID,
      });
      setName(""); setDesc(""); setCompleted(false);
      onSuccess();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Routine Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Morning sequence, Night wind-down..." className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Details (optional)</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Steps involved in this routine..." rows={3} className={cn(inputCls, "resize-none")} />
      </div>
      <label className="flex items-center gap-3 cursor-pointer select-none py-2 ml-1">
        <div className="relative flex items-center justify-center">
          <input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)} className="peer sr-only" />
          <div className="w-5 h-5 border-2 border-[hsl(258_100%_83%)] rounded-md peer-checked:bg-[hsl(258_100%_65%)] peer-checked:border-[hsl(258_100%_65%)] transition-all shadow-sm flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>
        <span className="text-xs font-semibold text-[hsl(232_45%_16%)]">Mark as completed today</span>
      </label>
      <SubmitBtn loading={loading} onClick={submit} label="Save Routine" disabled={!name.trim()} />
    </div>
  );
}

// ── Meditation Form ───────────────────────────────────────────────────────
const MEDITATION_TYPES = ["Mindfulness", "Guided", "Breathing", "Body Scan", "Loving-Kindness", "Visualization", "Transcendental", "Movement", "Other"];

function MeditationForm({ onSuccess }: { onSuccess: () => void }) {
  const [type, setType] = useState("");
  const [duration, setDuration] = useState(10);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!type) return;
    setLoading(true);
    try {
      await invoke("create_meditation", {
        meditationType: type,
        durationMinutes: duration,
        notes: notes.trim() || null,
        userId: DUMMY_USER_ID,
      });
      setType(""); setDuration(10); setNotes("");
      onSuccess();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Practice Type</label>
        <div className="relative">
          <select value={type} onChange={e => setType(e.target.value)} className={cn(inputCls, "appearance-none cursor-pointer pr-10")}>
            <option value="" disabled>Select meditation style...</option>
            {MEDITATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[hsl(232_20%_55%)]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      <div>
        <label className={labelCls}>Duration (Minutes)</label>
        <input type="number" min={1} max={180} value={duration} onChange={e => setDuration(parseInt(e.target.value) || 1)} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Experience Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Reflect on your state of mind..." rows={3} className={cn(inputCls, "resize-none")} />
      </div>
      <SubmitBtn loading={loading} onClick={submit} label="Log Meditation" disabled={!type} />
    </div>
  );
}

// ── Shared submit button ──────────────────────────────────────────────────
function SubmitBtn({ loading, onClick, label, disabled }: { loading: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative w-full flex items-center justify-center gap-2 px-6 py-3.5 mt-4 rounded-2xl bg-[hsl(232_45%_16%)] text-white text-xs font-heading font-bold uppercase tracking-wider overflow-hidden hover-glow disabled:opacity-50 transition-all duration-300 transform active:scale-[0.98]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(258_100%_65%)] to-[hsl(181_84%_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10 flex items-center gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : label}
      </span>
    </button>
  );
}

// ── Main Dialog Component ─────────────────────────────────────────────────
interface AddActivityDialogProps {
  onSuccess?: () => void;
}

export default function AddActivityDialog({ onSuccess }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("task");

  const handleSuccess = () => {
    onSuccess?.();
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        id="btn-add-activity"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-[11px] font-heading font-bold uppercase tracking-wide hover-glow transition-all shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Log Activity
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[hsl(232_45%_16%_/_0.3)] backdrop-blur-md animate-in fade-in duration-300" onClick={() => setOpen(false)} />
          
          <div className="relative glass-card rounded-[2rem] w-full max-w-lg max-h-[90vh] flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 bg-gradient-to-b from-white/95 to-white/70 animate-in zoom-in-95 duration-300 overflow-hidden">
            
            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 bg-gradient-to-r from-[hsl(258_100%_97%)] to-[hsl(197_100%_97%)] border-b border-white/60">
              <div className="absolute top-0 right-0 p-6">
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full hover:bg-white/60 text-[hsl(232_20%_55%)] hover:text-[hsl(232_45%_16%)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="pr-12">
                <h2 className="text-2xl font-heading font-black text-[hsl(232_45%_16%)] tracking-tight">Log an Activity</h2>
                <p className="text-xs font-semibold text-[hsl(258_100%_65%)] mt-1.5 uppercase tracking-widest">Track your journey</p>
              </div>
            </div>

            {/* Premium Tabs */}
            <div className="px-6 pt-4 bg-white/40 border-b border-white/50">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x">
                {TABS.map(({ id, label, icon: Icon, color }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-heading font-bold tracking-wide transition-all shrink-0 snap-start border",
                        isActive
                          ? "bg-white text-[hsl(232_45%_16%)] border-white shadow-sm ring-1 ring-black/5"
                          : "bg-transparent text-[hsl(232_20%_55%)] border-transparent hover:bg-white/50 hover:text-[hsl(232_45%_16%)]"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-[hsl(258_100%_65%)]" : "opacity-60 group-hover:opacity-100")} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                {activeTab === "task"       && <TaskForm       onSuccess={handleSuccess} />}
                {activeTab === "mood"       && <MoodForm       onSuccess={handleSuccess} />}
                {activeTab === "focus"      && <FocusForm      onSuccess={handleSuccess} />}
                {activeTab === "journal"    && <JournalForm    onSuccess={handleSuccess} />}
                {activeTab === "routine"    && <RoutineForm    onSuccess={handleSuccess} />}
                {activeTab === "meditation" && <MeditationForm onSuccess={handleSuccess} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
