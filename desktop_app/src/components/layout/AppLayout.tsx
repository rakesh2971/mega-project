import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import TitleBar from "./TitleBar";
import Sidebar from "./Sidebar";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

// ── AppLayout ─────────────────────────────────────────────────────────────

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  // Track current page in store for cross-component awareness
  useEffect(() => {
    setCurrentPage(location.pathname);
  }, [location.pathname, setCurrentPage]);

  // Don't render full layout for the floating avatar window
  const isFloatWindow = location.pathname === "/avatar-float";
  if (isFloatWindow) {
    return <>{children}</>;
  }

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
