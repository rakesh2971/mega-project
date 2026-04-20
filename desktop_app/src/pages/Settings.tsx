import { useState } from "react";
import {
  Settings as SettingsIcon, User, Palette, Bell, Shield, Brain, Info, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";


// ── Tab definition ────────────────────────────────────────────────────────

const SETTING_TABS = [
  { id: "general",       label: "General",       icon: SettingsIcon },
  { id: "appearance",    label: "Appearance",    icon: Palette },
  { id: "profile",       label: "Profile",       icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy",       label: "Privacy",       icon: Shield },
  { id: "ai",            label: "AI & Voice",    icon: Brain },
  { id: "about",         label: "About",         icon: Info },
] as const;

type TabId = (typeof SETTING_TABS)[number]["id"];

// ── Setting row ───────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[hsl(258_20%_93%)] last:border-0">
      <div>
        <p className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)]">{label}</p>
        {description && (
          <p className="text-xs text-[hsl(232_20%_55%)] mt-0.5">{description}</p>
        )}
      </div>
      {control}
    </div>
  );
}

// ── Toggle placeholder ────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors",
        on ? "bg-gradient-primary" : "bg-[hsl(258_20%_88%)]"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ── Tab content ───────────────────────────────────────────────────────────

function TabContent({ tab }: { tab: TabId }) {
  const contents: Record<TabId, React.ReactNode> = {
    general: (
      <div>
        <SettingRow label="Launch at startup" description="Start NeuroMate when Windows boots" control={<Toggle />} />
        <SettingRow label="Minimize to float on close" description="Show floating avatar instead of closing" control={<Toggle defaultOn />} />
        <SettingRow label="Language" description="App display language" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            English <ChevronRight size={12} />
          </div>
        } />
        <SettingRow label="Time format" description="12-hour or 24-hour clock" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            12h <ChevronRight size={12} />
          </div>
        } />
      </div>
    ),
    appearance: (
      <div>
        <SettingRow label="Theme" description="Light, dark, or system default" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            Light <ChevronRight size={12} />
          </div>
        } />
        <SettingRow label="Glassmorphism effects" description="Blur effects on panels and cards" control={<Toggle defaultOn />} />
        <SettingRow label="Animations" description="Page transitions and micro-animations" control={<Toggle defaultOn />} />
        <SettingRow label="Sidebar collapsed by default" description="Start app with sidebar minimized" control={<Toggle />} />
        <SettingRow label="Font size" description="Adjust text size across the app" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            Medium <ChevronRight size={12} />
          </div>
        } />
      </div>
    ),
    profile: (
      <div>
        <SettingRow label="Display name" description="How NeuroMate addresses you" control={
          <div className="skeleton h-7 w-32 rounded-lg" />
        } />
        <SettingRow label="Avatar" description="Customize your profile picture" control={
          <div className="h-9 w-9 rounded-full bg-gradient-primary" />
        } />
        <SettingRow label="Status" description="Your current focus status" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            Online <ChevronRight size={12} />
          </div>
        } />
        <SettingRow label="Bio" description="Short description for community profile" control={
          <div className="skeleton h-7 w-40 rounded-lg" />
        } />
      </div>
    ),
    notifications: (
      <div>
        <SettingRow label="Desktop notifications" description="Allow system notifications" control={<Toggle defaultOn />} />
        <SettingRow label="Mood check-in reminders" description="Daily reminders to log your mood" control={<Toggle defaultOn />} />
        <SettingRow label="Focus session alerts" description="Notify when sessions start/end" control={<Toggle defaultOn />} />
        <SettingRow label="Community activity" description="Replies, likes, and mentions" control={<Toggle />} />
        <SettingRow label="Sound effects" description="Notification sounds" control={<Toggle />} />
      </div>
    ),
    privacy: (
      <div>
        <SettingRow label="Analytics" description="Help improve NeuroMate with usage data" control={<Toggle />} />
        <SettingRow label="Local data only" description="Store chat history locally, not on cloud" control={<Toggle />} />
        <SettingRow label="Community visibility" description="Show your profile in community" control={<Toggle defaultOn />} />
        <SettingRow label="Clear chat history" description="Delete all local conversation logs" control={
          <button className="text-xs font-heading font-semibold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
            Clear
          </button>
        } />
      </div>
    ),
    ai: (
      <div>
        <SettingRow label="Voice engine" description="Speech-to-text provider" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            Vosk (Offline) <ChevronRight size={12} />
          </div>
        } />
        <SettingRow label="TTS provider" description="Text-to-speech engine" control={
          <div className="flex items-center gap-1 text-xs font-medium text-[hsl(258_100%_60%)] cursor-pointer">
            Coqui TTS <ChevronRight size={12} />
          </div>
        } />
        <SettingRow label="ElevenLabs premium voice" description="Use ElevenLabs for high-quality voice" control={<Toggle />} />
        <SettingRow label="Avatar expressions" description="Enable mood-based Live2D animations" control={<Toggle defaultOn />} />
        <SettingRow label="Auto-detect emotion" description="AI reads emotional tone in messages" control={<Toggle defaultOn />} />
        <SettingRow label="WebSocket backend URL" description="FastAPI server endpoint" control={
          <div className="skeleton h-7 w-40 rounded-lg" />
        } />
      </div>
    ),
    about: (
      <div className="space-y-4 py-2">
        <div className="glass-card rounded-2xl p-5 text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary mx-auto flex items-center justify-center">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-base font-heading font-bold text-[hsl(232_45%_16%)]">NeuroMate</h2>
          <p className="text-xs text-[hsl(232_20%_55%)]">Version 0.1.0 — Scaffolding Build</p>
          <p className="text-xs text-[hsl(232_20%_55%)]">
            Built with Tauri 2 + React + Vite + Tailwind CSS
          </p>
        </div>
        <SettingRow label="Check for updates" description="Current version: 0.1.0" control={
          <button className="text-xs font-heading font-semibold text-[hsl(258_100%_60%)] hover:underline">
            Check
          </button>
        } />
        <SettingRow label="Open source licenses" description="Third-party software credits" control={
          <ChevronRight size={14} className="text-[hsl(232_20%_60%)]" />
        } />
      </div>
    ),
  };

  return <div className="flex-1 overflow-y-auto">{contents[tab]}</div>;
}

// ── Settings Page ─────────────────────────────────────────────────────────

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Settings sidebar ──────────────────────────────────── */}
      <div className="w-52 shrink-0 border-r border-[hsl(258_20%_90%)] bg-[hsl(258_30%_98%)] p-3 space-y-1">
        <p className="text-[10px] font-heading font-bold text-[hsl(232_20%_55%)] uppercase tracking-widest px-3 py-1">
          Settings
        </p>
        {SETTING_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`settings-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all",
              activeTab === id
                ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                : "text-[hsl(232_20%_55%)] hover:bg-white/70 hover:text-[hsl(232_45%_16%)]"
            )}
          >
            <Icon size={14} />
            <span className="text-xs font-heading font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Settings content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-xl">
          <h2 className="text-base font-heading font-bold text-[hsl(232_45%_16%)] mb-1">
            {SETTING_TABS.find((t) => t.id === activeTab)?.label}
          </h2>
          <p className="text-xs text-[hsl(232_20%_55%)] mb-5">
            Customize how NeuroMate works for you
          </p>
          <div className="glass-card rounded-2xl px-5 py-2">
            <TabContent tab={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}
