import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

// ── AvatarFloat Page ──────────────────────────────────────────────────────
// This is the standalone transparent always-on-top floating window
// shown when the main window is minimized.

import AvatarCanvas from "@/components/avatar/AvatarCanvas";

export default function AvatarFloat() {
  const { avatarMood } = useAppStore();

  return (
    <div
      className={cn(
        "w-full h-screen",
        "bg-transparent",
        "flex items-center justify-center",
        "titlebar-drag" // entire float window is draggable
      )}
    >
      <div className="titlebar-no-drag w-full flex flex-col items-center">
        <AvatarCanvas mode="float" mood={avatarMood} />
      </div>
    </div>
  );
}
