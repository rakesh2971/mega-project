import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TitleBar from "./TitleBar";
import Sidebar from "./Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { checkConnection } from "@/services/tauri";
import { cn } from "@/lib/cn";

interface AppLayoutProps {
  children: React.ReactNode;
}

// ── AppLayout ─────────────────────────────────────────────────────────────

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const setWsStatus = useAppStore((s) => s.setWsStatus);

  // Track current page in store for cross-component awareness
  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname, setCurrentPage]);

  // Poll database connection status
  useEffect(() => {
    let mounted = true;
    const verifyConnection = async () => {
      const isOnline = await checkConnection();
      if (mounted) {
        setWsStatus(isOnline ? "connected" : "disconnected");
      }
    };

    verifyConnection();
    const interval = setInterval(verifyConnection, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [setWsStatus]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[hsl(0_0%_100%)] rounded-lg">
      {/* ── Glassmorphic title bar ────────────────────────────── */}
      <TitleBar />

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Page content */}
        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden",
            "bg-[hsl(0_0%_99%)]",
            "page-enter selectable"
          )}
          key={location.pathname} // Re-trigger animation on page change
        >
          {children}
        </main>
      </div>
    </div>
  );
}
