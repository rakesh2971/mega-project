import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import AvatarFloat from "./pages/AvatarFloat";
import ErrorBoundary from "./components/ErrorBoundary";

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

// ── Root — detects which Tauri window is running ───────────────────────────
// The avatar-float window gets a bare <AvatarFloat /> without any router or
// layout wrapping. Everything else gets the full <App />.

function Root() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import to avoid issues in non-Tauri environments
    import("@tauri-apps/api/window")
      .then(({ getCurrentWindow }) => {
        const label = getCurrentWindow().label;
        if (label === "avatar-float") {
          // Make body/html fully transparent for the shapeless float window
          document.documentElement.style.background = "transparent";
          document.body.style.background = "transparent";
        }
        setWindowLabel(label);
      })
      .catch(() => {
        setWindowLabel("main"); // fallback for browser dev
      });
  }, []);

  // Show nothing until we know which window we are (avoids flash of wrong UI)
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
      <App />
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Root />
);
