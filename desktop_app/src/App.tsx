import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

// ── Pages ─────────────────────────────────────────────────────────────────
import Home from "@/pages/Home";
import Community from "@/pages/Community";
import Productivity from "@/pages/Productivity";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import KillSwitch from "@/pages/KillSwitch";
import AvatarFloat from "@/pages/AvatarFloat";

// ── App ───────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <MemoryRouter initialEntries={["/"]} initialIndex={0}>
      <AppLayout>
        <Routes>
          {/* ── Main app pages ──────────────────────────────── */}
          <Route path="/"             element={<Home />} />
          <Route path="/community"   element={<Community />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/settings"    element={<Settings />} />
          <Route path="/kill-switch" element={<KillSwitch />} />

          {/* ── Floating avatar overlay (second Tauri window) ── */}
          <Route path="/avatar-float" element={<AvatarFloat />} />
        </Routes>
      </AppLayout>
    </MemoryRouter>
  );
}
