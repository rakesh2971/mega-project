import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import AvatarFloat from "./pages/AvatarFloat";
import ErrorBoundary from "./components/ErrorBoundary";
import Login, { mapDbUser } from "./pages/Login";
import { useAppStore } from "./store/useAppStore";
import { invoke } from "@tauri-apps/api/core";

// ── Global error catchers (dev only) ──────────────────────────────────────
window.addEventListener("unhandledrejection", (e) => {
  console.error(
    "[unhandledRejection]",
    e.reason,
    "\nStack:", e.reason?.stack ?? "(no stack)"
  );
});

window.onerror = (msg, src, line, col, err) => {
  console.error(`[onerror] ${msg} @ ${src}:${line}:${col}`, err);
};

// ── Auth-gated Main App ───────────────────────────────────────────────────

function AuthGate() {
  const { user, setUser } = useAppStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Try to restore session (if user was logged in before)
    invoke("get_current_user")
      .then((raw: any) => {
        if (raw) {
          setUser(mapDbUser(raw));
        } else {
          // DEV BYPASS: Force a dummy user so we can test the frontend
          setUser({
            id: "00000000-0000-0000-0000-000000000001",
            username: "offline_dev",
            display_name: "Offline Developer",
            avatar_seed: "dev",
            created_at: new Date().toISOString(),
            name: "Offline Developer"
          });
        }
      })
      .catch(() => {
        // DEV BYPASS: DB offline, force dummy user
        setUser({
          id: "00000000-0000-0000-0000-000000000001",
          username: "offline_dev",
          display_name: "Offline Developer",
          avatar_seed: "dev",
          created_at: new Date().toISOString(),
          name: "Offline Developer"
        });
      }) 
      .finally(() => setChecking(false));
  }, [setUser]);

  if (checking) {
    // Brief loading while checking existing session
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(258_60%_97%)] to-[hsl(181_40%_96%)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(258_100%_65%)] to-[hsl(181_84%_45%)] animate-pulse" />
          <p className="text-xs text-[hsl(232_20%_55%)]">Starting NeuroMate…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={(u) => setUser(u)}
      />
    );
  }

  return <App />;
}

// ── Root — detects which Tauri window is running ───────────────────────────

function Root() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);

  useEffect(() => {
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => {
        const label = getCurrentWindow().label;
        if (label === "avatar-float") {
          document.documentElement.style.background = "transparent";
          document.body.style.background = "transparent";
        }
        setWindowLabel(label);
      })
      .catch(() => {
        setWindowLabel("main");
      });
  }, []);

  if (windowLabel === null) return null;

  if (windowLabel === "avatar-float") {
    return (
      <ErrorBoundary label="Float Avatar — Error">
        <AvatarFloat />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary label="NeuroMate — App Error">
      <AuthGate />
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Root />
);
