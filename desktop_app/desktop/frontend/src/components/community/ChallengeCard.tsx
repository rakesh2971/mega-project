import { useState } from "react";
import { Users, Clock, Trophy, ArrowRight, Flame } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: "Easy" | "Medium" | "Hard";
  participants: number;
  category: string;
  isJoined: boolean;
  progress?: number;
  streak?: number;
}

const LEVEL_STYLES: Record<string, string> = {
  Easy: "bg-green-50 text-green-600 border border-green-200",
  Medium: "bg-amber-50 text-amber-600 border border-amber-200",
  Hard: "bg-red-50 text-red-600 border border-red-200",
};

import { invoke } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/useAppStore";

export default function ChallengeCard({ challenge: initial }: { challenge: Challenge }) {
  const { user } = useAppStore();
  const userId = user?.id ?? "00000000-0000-0000-0000-000000000001";
  const [isJoined, setIsJoined] = useState(initial.isJoined);
  const [progress] = useState(initial.progress ?? 0);
  const [loading, setLoading] = useState(false);

  // Use a hardcoded dummy UUID for testing
  const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001";

  const handleJoin = async () => {
    if (isJoined) return; // Do nothing if already joined, or handle leave/continue
    setLoading(true);
    try {
      await invoke("join_challenge", { userId, challengeId: initial.id });
      setIsJoined(true);
      window.dispatchEvent(new CustomEvent("challengeJoined"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "glass-card rounded-2xl p-4 flex flex-col gap-3 hover-glow transition-all",
      isJoined && "border-[hsl(258_100%_65%/0.25)]"
    )}>
      {/* Badges row */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-[hsl(258_60%_45%)] border border-[hsl(258_20%_88%)]">
          {initial.category}
        </span>
        <span className={cn(
          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
          LEVEL_STYLES[initial.level]
        )}>
          {initial.level}
        </span>
      </div>

      {/* Title + description */}
      <div>
        <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)] leading-snug mb-1">
          {initial.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {initial.description}
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-[hsl(232_20%_55%)]">
        <span className="flex items-center gap-1"><Clock size={11} />{initial.duration}</span>
        <span className="flex items-center gap-1"><Users size={11} />{initial.participants.toLocaleString()}</span>
      </div>

      {/* Progress bar (if joined) */}
      {isJoined && initial.progress !== undefined && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(258_30%_93%)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {initial.streak !== undefined && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-orange-500">
              <Flame size={10} />
              {initial.streak} day streak!
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <button
        id={`btn-challenge-${initial.id}`}
        onClick={handleJoin}
        disabled={loading}
        className={cn(
          "mt-auto w-full py-2 rounded-xl text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-all",
          isJoined
            ? "bg-muted text-[hsl(258_60%_45%)] border border-[hsl(258_20%_88%)] hover:bg-[hsl(258_30%_92%)]"
            : "bg-gradient-primary text-[hsl(232_45%_16%)] hover-glow disabled:opacity-50"
        )}
      >
        {isJoined ? (
          <><ArrowRight size={12} /> Continue Challenge</>
        ) : (
          <>{loading ? "Joining..." : "Join Challenge"}</>
        )}
      </button>
    </div>
  );
}
