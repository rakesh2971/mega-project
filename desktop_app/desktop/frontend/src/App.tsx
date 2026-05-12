import { MemoryRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

// ── Pages ─────────────────────────────────────────────────────────────────
import Home from "@/pages/Home";
import Community from "@/pages/Community";
import Productivity from "@/pages/Productivity";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import KillSwitch from "@/pages/KillSwitch";
import Pomodoro from "@/pages/Pomodoro";
import Breathing from "@/pages/Breathing";
import Soundscapes from "@/pages/Soundscapes";
import Cognitive from "@/pages/Cognitive";
import Profile from "@/pages/Profile";

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
          <Route path="/productivity/pomodoro" element={<Pomodoro />} />
          <Route path="/productivity/breathing" element={<Breathing />} />
          <Route path="/productivity/soundscapes" element={<Soundscapes />} />
          <Route path="/productivity/cognitive" element={<Cognitive />} />
          <Route path="/profile"      element={<Profile />} />


        </Routes>
      </AppLayout>
    </MemoryRouter>
  );
}
