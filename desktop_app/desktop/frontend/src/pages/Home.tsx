import { useState, useEffect, useRef, lazy, Suspense, useCallback } from "react";
import { Heart, Focus, BookOpen, TrendingUp, Activity, Mic, MicOff, MessageSquare, Loader2, Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { getGreeting, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import { FLOAT_CANVAS_H } from "@/constants/avatar";
import ErrorBoundary from "@/components/ErrorBoundary";
import ChatSessionsModal from "@/components/ChatSessionsModal";
import { invoke } from "@tauri-apps/api/core";

// Lazy-load the heavy Live2D + PIXI bundle so React mounts instantly
const AvatarCanvas = lazy(() => import("@/components/avatar/AvatarCanvas"));

// ── Quick stat card ───────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-3 hover-glow transition-all">
      <div className={cn("p-2 rounded-xl", color)}>
        <Icon className="h-4 w-4 text-white" size={16} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-base font-heading font-bold text-[hsl(232_45%_16%)]">{value}</p>
      </div>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string | null;
  preview: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export default function Home() {
  const { avatarMood, setAvatarMood, isListening, setListening, isSpeaking, setSpeaking } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Session management
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionLabel, setSessionLabel] = useState<string | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const sessionCreatedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Voice Recognition Setup
  useEffect(() => {
    if (isListening) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleSend(transcript);
          setListening(false);
        };

        recognition.onerror = () => setListening(false);
        recognition.onend = () => setListening(false);

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        alert("Speech Recognition is not supported in your environment.");
        setListening(false);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isListening, setListening]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // ── Session helpers ──────────────────────────────────────────────────────

  /** Ensure a session exists before sending the first message. */
  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionId) return sessionId;
    try {
      const id = await invoke<string>("create_chat_session", { title: null });
      setSessionId(id);
      sessionCreatedRef.current = true;
      return id;
    } catch (e) {
      console.warn("[Home] Could not create session (DB offline?):", e);
      const fallback = crypto.randomUUID();
      setSessionId(fallback);
      return fallback;
    }
  }, [sessionId]);

  /** Start a fresh session (called by modal "New Chat"). */
  const startNewSession = useCallback(async () => {
    setMessages([]);
    setSessionId(null);
    setSessionLabel(null);
    sessionCreatedRef.current = false;
  }, []);

  /** Load a previous session from the DB. */
  const loadSession = useCallback(async (session: ChatSession) => {
    try {
      const history = await invoke<Array<{ role: string; content: string }>>(
        "get_chat_history",
        { session_id: session.id }
      );
      setMessages(history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      setSessionId(session.id);
      setSessionLabel(session.title ?? session.preview?.slice(0, 40) ?? "Previous chat");
    } catch (e) {
      console.error("[Home] Could not load session history:", e);
    }
  }, []);

  // ── Send message ─────────────────────────────────────────────────────────

  const speakText = (text: string) => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      const femaleVoice = voices.find((v) => v.name.includes("Female") || v.name.includes("Zira"));
      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      synth.speak(utterance);
    }
  };

  const handleSend = async (textToSubmit?: string) => {
    const text = textToSubmit || inputValue.trim();
    if (!text || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    // Get or create a DB session
    const sid = await ensureSession();

    // Persist user message (best-effort)
    try {
      await invoke("save_chat_message", {
        session_id: sid,
        role: "user",
        content: text,
        mood: null,
      });
    } catch (e) {
      console.warn("[Home] Could not persist user message:", e);
    }

    // If this is the first message, auto-title the session
    if (messages.length === 0 && sessionCreatedRef.current) {
      const autoTitle = text.length > 50 ? text.slice(0, 50) + "…" : text;
      setSessionLabel(autoTitle);
      try {
        await invoke("update_session_title", { session_id: sid, title: autoTitle });
      } catch (_) {}
    }

    try {
      const response = await invoke<string>("chat_with_ai", { messages: newMessages });
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setAvatarMood("happy");
      speakText(response);

      // Persist assistant message (best-effort)
      try {
        await invoke("save_chat_message", {
          session_id: sid,
          role: "assistant",
          content: response,
          mood: avatarMood,
        });
      } catch (e) {
        console.warn("[Home] Could not persist assistant message:", e);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble processing that. Let's try again!" },
      ]);
      setAvatarMood("sad");
    } finally {
      setIsLoading(false);
      setTimeout(() => setAvatarMood("neutral"), 5000);
    }
  };

  const quickStats = [
    { icon: Heart, label: "Mood Score", value: "—", color: "bg-pink-400" },
    { icon: Focus, label: "Focus Streak", value: "—", color: "bg-[hsl(258_100%_65%)]" },
    { icon: TrendingUp, label: "Tasks Done", value: "—", color: "bg-[hsl(181_84%_45%)]" },
    { icon: Activity, label: "Wellness", value: "—", color: "bg-blue-400" },
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left: Avatar + Chat ──────────────────────────────── */}
      <div className="flex flex-col items-center justify-center w-80 shrink-0 border-r border-[hsl(258_20%_90%)] p-6 gap-6 bg-gradient-hero">
        {/* Greeting */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground font-medium">
            {formatDate(currentTime)}
          </p>
          <h1 className="text-xl font-heading font-bold text-[hsl(232_45%_16%)] mt-1">
            {getGreeting()},{" "}
            <span className="gradient-text">User</span>
          </h1>
        </div>

        {/* Avatar — lazy-loaded Live2D canvas, isolated error boundary */}
        <ErrorBoundary label="Avatar Error">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center w-full gap-3" style={{ height: FLOAT_CANVAS_H }}>
                <Loader2 className="h-8 w-8 animate-spin text-[hsl(258_100%_65%)]" />
                <span className="text-xs text-muted-foreground">Loading avatar…</span>
              </div>
            }
          >
            <AvatarCanvas mode="home" mood={avatarMood} />
          </Suspense>
        </ErrorBoundary>

        {/* Voice toggle */}
        <button
          id="btn-voice-toggle"
          onClick={() => setListening(!isListening)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full",
            "font-heading font-semibold text-sm transition-all",
            isListening
              ? "bg-gradient-primary text-[hsl(232_45%_16%)] shadow-(--shadow-glow) animate-pulse"
              : "glass-card text-muted-foreground hover:text-[hsl(232_45%_16%)] hover-glow"
          )}
        >
          {isListening ? (
            <><MicOff size={16} /> Stop Listening</>
          ) : (
            <><Mic size={16} /> Talk to NeuroMate</>
          )}
        </button>
      </div>

      {/* ── Right: Dashboard overview ────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        {/* Quick stats */}
        <section className="shrink-0">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Today's Overview
          </h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {quickStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </section>

        {/* Chat area */}
        <section className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                {sessionLabel ? (
                  <span className="normal-case text-[hsl(232_45%_16%)]">{sessionLabel}</span>
                ) : (
                  "Recent Conversations"
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {/* New chat */}
              <button
                id="btn-new-chat"
                onClick={startNewSession}
                title="Start new conversation"
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-[hsl(258_100%_65%)] hover:bg-[hsl(258_60%_97%)] transition-all"
              >
                <Plus size={14} />
              </button>
              {/* View all */}
              <button
                id="btn-view-all-sessions"
                onClick={() => setSessionsModalOpen(true)}
                className="text-xs text-[hsl(258_100%_65%)] hover:underline font-medium transition-all hover:text-[hsl(258_80%_55%)]"
              >
                View All
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex flex-col gap-4 flex-1 min-h-0">
            {/* Chat Messages */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar"
            >
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Start a conversation with NeuroMate...
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 max-w-[80%]",
                      msg.role === "user" ? "flex-row-reverse self-end" : "self-start"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-xs",
                        msg.role === "assistant"
                          ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                          : "bg-[hsl(258_30%_90%)] text-[hsl(258_40%_40%)]"
                      )}
                    >
                      {msg.role === "assistant" ? "NM" : "U"}
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-2xl text-sm",
                        msg.role === "user"
                          ? "bg-[hsl(258_100%_65%)] text-white rounded-tr-sm"
                          : "bg-white border border-[hsl(258_20%_90%)] text-[hsl(232_45%_16%)] rounded-tl-sm shadow-xs"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-start gap-3 self-start max-w-[80%] animate-pulse">
                  <div className="h-8 w-8 rounded-full shrink-0 bg-gradient-primary" />
                  <div className="h-10 w-24 rounded-2xl rounded-tl-sm bg-white border border-[hsl(258_20%_90%)] flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(258_100%_65%)] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(258_100%_65%)] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[hsl(258_100%_65%)] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="mt-auto pt-3 border-t border-[hsl(258_20%_90%)] flex items-center gap-2 shrink-0">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Ask NeuroMate something…"
                  className="w-full h-10 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] px-4 text-sm text-[hsl(232_45%_16%)] focus:outline-none focus:border-[hsl(258_100%_65%)] focus:ring-1 focus:ring-[hsl(258_100%_65%)] transition-all"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <button
                id="btn-send-message"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center hover-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <MessageSquare size={16} className="text-[hsl(232_45%_16%)]" />
              </button>
            </div>
          </div>
        </section>

        {/* Module shortcuts */}
        <section className="shrink-0">
          <h2 className="text-sm font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Heart, label: "Mood Check", color: "from-pink-200 to-pink-100" },
              { icon: Focus, label: "Focus Session", color: "from-purple-200 to-purple-100" },
              { icon: BookOpen, label: "Daily Journal", color: "from-blue-200 to-blue-100" },
            ].map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                className={cn(
                  "glass-card rounded-2xl p-4 flex flex-col items-center gap-2",
                  "hover-glow cursor-pointer transition-all group"
                )}
              >
                <div className={cn("p-3 rounded-xl bg-linear-to-br", color)}>
                  <Icon className="h-5 w-5 text-[hsl(232_45%_25%)]" />
                </div>
                <span className="text-xs font-heading font-semibold text-[hsl(232_45%_16%)] group-hover:gradient-text">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ── Sessions Modal ──────────────────────────────────────── */}
      <ChatSessionsModal
        open={sessionsModalOpen}
        onClose={() => setSessionsModalOpen(false)}
        onSelectSession={loadSession}
        onNewSession={startNewSession}
        activeSessionId={sessionId}
      />
    </div>
  );
}
