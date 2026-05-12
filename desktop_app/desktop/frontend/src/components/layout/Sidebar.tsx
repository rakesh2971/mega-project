import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Zap,
  BarChart3,
  Settings,
  PowerOff,
  ChevronLeft,
  ChevronRight,
  Brain,
  Mic,
  User as UserIcon,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";

// ── Nav items definition ──────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "home",         path: "/",            label: "Home",              icon: Home },
  { id: "community",    path: "/community",   label: "Community",         icon: Users },
  { id: "productivity", path: "/productivity",label: "Productivity",      icon: Zap },
  { id: "dashboard",    path: "/dashboard",   label: "Dashboard",         icon: BarChart3 },
  { id: "settings",     path: "/settings",    label: "Settings",          icon: Settings },
] as const;

const DANGER_ITEMS = [
  { id: "kill-switch",  path: "/kill-switch", label: "Kill Switch",       icon: PowerOff },
] as const;

// ── Sidebar ───────────────────────────────────────────────────────────────

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSidebarCollapsed, toggleSidebar, isListening, wsStatus } = useAppStore();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 h-full",
        "border-r border-[hsl(258_20%_90%)]",
        "bg-(--gradient-sidebar)",
        "shadow-(--shadow-sidebar)",
        "transition-all duration-300 ease-in-out",
        isSidebarCollapsed ? "w-16" : "w-(--sidebar-width)"
      )}
      style={{ background: "var(--gradient-sidebar)" }}
    >
      {/* ── User chip ─────────────────────────────────────────── */}
      <button
        id="nav-profile-chip"
        onClick={() => navigate("/profile")}
        className={cn(
          "flex items-center gap-3 px-3 py-3 mx-2 mt-2 rounded-xl text-left",
          "bg-white/60 border border-[hsl(258_100%_83%/0.2)]",
          "hover:bg-white/90 hover:border-[hsl(258_100%_65%/0.3)]",
          "transition-all duration-300 cursor-pointer group"
        )}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(258_100%_65%)] to-[hsl(258_80%_55%)] flex items-center justify-center shadow-sm font-heading font-bold text-white text-xs">
            {user ? user.name.charAt(0).toUpperCase() : <Brain className="h-4 w-4 text-white" />}
          </div>
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
              wsStatus === "connected" ? "bg-green-400" : "bg-gray-300"
            )}
          />
        </div>

        {!isSidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-heading font-semibold text-[hsl(232_45%_16%)] truncate group-hover:text-[hsl(258_100%_65%)] transition-colors">
              {user ? user.name : "Guest"}
            </p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              {isListening ? (
                <>
                  <Mic className="h-2.5 w-2.5 text-[hsl(258_100%_65%)] animate-pulse" />
                  Listening…
                </>
              ) : user ? (
                `@${user.username}`
              ) : (
                "Not signed in"
              )}
            </p>
          </div>
        )}
      </button>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ id, path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => navigate(path)}
              title={isSidebarCollapsed ? label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-left transition-all duration-200 group",
                active
                  ? "bg-gradient-primary text-[hsl(232_45%_16%)] shadow-(--shadow-card)"
                  : "text-muted-foreground hover:bg-white/60 hover:text-[hsl(232_45%_16%)]"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110",
                  active ? "text-[hsl(232_45%_16%)]" : "text-[hsl(258_100%_65%)]"
                )}
                size={18}
              />
              {!isSidebarCollapsed && (
                <span className="text-sm font-heading font-medium truncate">{label}</span>
              )}
              {/* Active pill indicator */}
              {active && !isSidebarCollapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[hsl(232_45%_16%/0.5)]" />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-[hsl(258_20%_90%)]" />

        {/* Danger zone items */}
        {DANGER_ITEMS.map(({ id, path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => navigate(path)}
              title={isSidebarCollapsed ? label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                "text-left transition-all duration-200 group",
                active
                  ? "bg-red-500/10 text-red-600 border border-red-200"
                  : "text-red-400/70 hover:bg-red-50 hover:text-red-600"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-110" size={18} />
              {!isSidebarCollapsed && (
                <span className="text-sm font-heading font-medium truncate">{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Collapse toggle ───────────────────────────────────── */}
      <div className="px-2 pb-3">
        <button
          id="btn-sidebar-toggle"
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl",
            "text-muted-foreground hover:bg-white/60 hover:text-[hsl(232_45%_16%)]",
            "transition-all duration-200 text-xs font-medium"
          )}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
