import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  X,
  MessageSquare,
  Search,
  Clock,
  Loader2,
  Plus,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatSession {
  id: string;
  title: string | null;
  preview: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectSession: (session: ChatSession) => void;
  onNewSession: () => void;
  activeSessionId: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function sessionTitle(s: ChatSession, idx: number): string {
  if (s.title) return s.title;
  if (s.preview) {
    const words = s.preview.split(" ").slice(0, 6).join(" ");
    return words.length < s.preview.length ? words + "…" : words;
  }
  return `Conversation ${idx + 1}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChatSessionsModal({
  open,
  onClose,
  onSelectSession,
  onNewSession,
  activeSessionId,
}: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoke<ChatSession[]>("get_chat_sessions", { limit: 100 });
      setSessions(data);
    } catch (e: any) {
      setError("Could not load sessions. Is the database connected?");
      console.error("[ChatSessionsModal] get_chat_sessions error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      load();
      setQuery("");
    }
  }, [open, load]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = query.trim()
    ? sessions.filter(
        (s) =>
          sessionTitle(s, 0).toLowerCase().includes(query.toLowerCase()) ||
          s.preview?.toLowerCase().includes(query.toLowerCase())
      )
    : sessions;

  const modal = (
    <div
      className="csm-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
      aria-label="All chat sessions"
    >
      <div className="csm-panel">
        {/* Header */}
        <div className="csm-header">
          <div className="csm-header-left">
            <div className="csm-icon-wrap">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="csm-title">All Conversations</h2>
              <p className="csm-subtitle">
                {sessions.length} session{sessions.length !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
          <div className="csm-header-right">
            <button
              id="btn-new-chat-session"
              className="csm-btn-new"
              onClick={() => { onNewSession(); onClose(); }}
            >
              <Plus size={14} />
              New Chat
            </button>
            <button
              id="btn-close-sessions-modal"
              className="csm-btn-close"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="csm-search-wrap">
          <Search size={14} className="csm-search-icon" />
          <input
            id="input-session-search"
            type="text"
            placeholder="Search conversations…"
            className="csm-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Body */}
        <div className="csm-body">
          {loading ? (
            <div className="csm-state">
              <Loader2 className="animate-spin csm-state-icon" size={28} />
              <p>Loading sessions…</p>
            </div>
          ) : error ? (
            <div className="csm-state csm-state-error">
              <MessageSquare size={28} className="csm-state-icon" />
              <p>{error}</p>
              <button className="csm-retry-btn" onClick={load}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="csm-state">
              <MessageSquare size={28} className="csm-state-icon csm-state-empty" />
              <p>{query ? "No conversations match your search." : "No conversations yet. Start chatting!"}</p>
            </div>
          ) : (
            <ul className="csm-list">
              {filtered.map((s, idx) => {
                const isActive = s.id === activeSessionId;
                return (
                  <li key={s.id}>
                    <button
                      id={`btn-session-${s.id}`}
                      className={cn("csm-item", isActive && "csm-item-active")}
                      onClick={() => { onSelectSession(s); onClose(); }}
                    >
                      {/* Avatar bubble */}
                      <div className={cn("csm-item-avatar", isActive && "csm-item-avatar-active")}>
                        <MessageSquare size={14} />
                      </div>

                      {/* Content */}
                      <div className="csm-item-content">
                        <div className="csm-item-row">
                          <span className="csm-item-title">
                            {sessionTitle(s, idx)}
                          </span>
                          <span className="csm-item-time">
                            <Clock size={10} />
                            {timeAgo(s.updated_at || s.created_at)}
                          </span>
                        </div>
                        <div className="csm-item-row">
                          <span className="csm-item-preview">
                            {s.preview ?? "No messages yet"}
                          </span>
                          <span className="csm-item-count">
                            {s.message_count} msg{s.message_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight size={14} className="csm-item-arrow" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .csm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 12, 40, 0.55);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: csmFadeIn 0.18s ease;
        }
        @keyframes csmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .csm-panel {
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 32px 80px rgba(90, 60, 200, 0.22), 0 8px 32px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          /* Force hardware acceleration to prevent clip-path paint lag */
          transform: translateZ(0);
          animation: csmSlideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes csmSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97) translateZ(0); }
          to { opacity: 1; transform: translateY(0) scale(1) translateZ(0); }
        }

        .csm-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid hsl(258 20% 92%);
          background: linear-gradient(135deg, hsl(258 100% 98%) 0%, hsl(258 60% 96%) 100%);
        }
        .csm-header-left { display: flex; align-items: center; gap: 12px; }
        .csm-header-right { display: flex; align-items: center; gap: 8px; }

        .csm-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, hsl(258 100% 65%), hsl(280 80% 60%));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(120, 60, 220, 0.35);
        }
        .csm-title {
          font-size: 16px;
          font-weight: 700;
          color: hsl(232 45% 16%);
          margin: 0;
        }
        .csm-subtitle {
          font-size: 12px;
          color: hsl(258 20% 55%);
          margin: 2px 0 0;
        }

        .csm-btn-new {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, hsl(258 100% 65%), hsl(280 80% 60%));
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 2px 8px rgba(120, 60, 220, 0.35);
        }
        .csm-btn-new:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(120, 60, 220, 0.45); }

        .csm-btn-close {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid hsl(258 20% 88%);
          background: white;
          color: hsl(258 20% 50%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .csm-btn-close:hover { background: hsl(258 100% 65%); color: white; border-color: transparent; }

        .csm-search-wrap {
          position: relative;
          padding: 12px 24px;
          border-bottom: 1px solid hsl(258 20% 92%);
        }
        .csm-search-icon {
          position: absolute;
          left: 38px;
          top: 50%;
          transform: translateY(-50%);
          color: hsl(258 20% 60%);
          pointer-events: none;
        }
        .csm-search-input {
          width: 100%;
          padding: 9px 14px 9px 34px;
          border-radius: 12px;
          border: 1.5px solid hsl(258 20% 88%);
          background: hsl(258 30% 97%);
          font-size: 13px;
          color: hsl(232 45% 16%);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .csm-search-input:focus {
          border-color: hsl(258 100% 65%);
          box-shadow: 0 0 0 3px rgba(120, 60, 220, 0.12);
        }

        .csm-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
          /* Optimization for smooth scrolling */
          overscroll-behavior-y: contain;
          contain: content;
          transform: translateZ(0);
          will-change: transform, scroll-position;
        }
        .csm-body::-webkit-scrollbar { width: 4px; }
        .csm-body::-webkit-scrollbar-thumb { background: hsl(258 20% 85%); border-radius: 4px; }

        .csm-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 48px 24px;
          color: hsl(258 20% 55%);
          font-size: 13px;
        }
        .csm-state-icon { opacity: 0.4; }
        .csm-state-empty { color: hsl(258 100% 65%); opacity: 0.3; }
        .csm-state-error { color: hsl(0 70% 55%); }
        .csm-retry-btn {
          padding: 6px 16px;
          border-radius: 8px;
          border: 1px solid hsl(0 70% 55%);
          background: transparent;
          color: hsl(0 70% 55%);
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .csm-retry-btn:hover { background: hsl(0 70% 55%); color: white; }

        .csm-list {
          list-style: none;
          margin: 0;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .csm-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s, transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-align: left;
          will-change: transform, background-color;
        }
        .csm-item:hover {
          background: hsl(258 60% 97%);
          transform: translate3d(2px, 0, 0);
        }
        .csm-item-active {
          background: linear-gradient(135deg, hsl(258 100% 97%) 0%, hsl(280 80% 96%) 100%);
          border: 1.5px solid hsl(258 100% 80%);
        }
        .csm-item-active:hover { background: linear-gradient(135deg, hsl(258 100% 96%) 0%, hsl(280 80% 95%) 100%); }

        .csm-item-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: hsl(258 30% 93%);
          color: hsl(258 60% 55%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .csm-item-avatar-active {
          background: linear-gradient(135deg, hsl(258 100% 65%), hsl(280 80% 60%));
          color: white;
          box-shadow: 0 3px 10px rgba(120, 60, 220, 0.3);
        }

        .csm-item-content { flex: 1; min-width: 0; }
        .csm-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .csm-item-title {
          font-size: 13px;
          font-weight: 600;
          color: hsl(232 45% 16%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 300px;
        }
        .csm-item-time {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          color: hsl(258 20% 60%);
          flex-shrink: 0;
        }
        .csm-item-preview {
          font-size: 12px;
          color: hsl(258 20% 55%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }
        .csm-item-count {
          font-size: 11px;
          color: hsl(258 100% 65%);
          font-weight: 500;
          flex-shrink: 0;
        }

        .csm-item-arrow {
          color: hsl(258 20% 75%);
          flex-shrink: 0;
          transition: color 0.15s, transform 0.15s;
          will-change: transform;
        }
        .csm-item:hover .csm-item-arrow {
          color: hsl(258 100% 65%);
          transform: translate3d(2px, 0, 0);
        }
      `}</style>
    </div>
  );

  return createPortal(modal, document.body);
}
