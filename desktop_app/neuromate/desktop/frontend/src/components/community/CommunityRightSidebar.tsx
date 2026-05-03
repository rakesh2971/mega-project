import { Trophy, Star, Users, MessageCircle, Target, Zap } from "lucide-react";

const TOP_USERS = [
  { rank: 1, name: "Jayeed Tamboli", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jayeed", points: 2850 },
  { rank: 2, name: "James Park",     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",  points: 2640 },
  { rank: 3, name: "Sofia Garcia",   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",  points: 2430 },
  { rank: 4, name: "Lucas Chen",     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",  points: 2210 },
  { rank: 5, name: "Ava Thompson",   avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ava",    points: 2050 },
];

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-400/20 text-yellow-600 font-extrabold",
  2: "bg-gray-300/30 text-gray-500 font-bold",
  3: "bg-orange-300/20 text-orange-500 font-bold",
};

const DAILY_STATS = [
  { icon: Star,          label: "Helpful Posts",   value: "124" },
  { icon: Users,         label: "Active Users",    value: "823" },
  { icon: Target,        label: "Challenges Done", value: "65"  },
  { icon: MessageCircle, label: "New Comments",    value: "340" },
];

const ACTIVE_CHALLENGES = [
  { title: "Focus Sprint",   desc: "25 min × 4 sessions", icon: Zap,    participants: 234 },
  { title: "Night Routine",  desc: "7 days challenge",    icon: Target,  participants: 187 },
];

export default function CommunityRightSidebar() {
  return (
    <div className="w-60 shrink-0 border-l border-[hsl(258_20%_90%)] overflow-y-auto smooth-scroll scrollbar-hide bg-[hsl(258_30%_98%)] p-3 space-y-3">
      {/* Leaderboard */}
      <div className="glass-card rounded-2xl p-3 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Trophy size={13} className="text-amber-500" />
          <h3 className="text-xs font-heading font-bold text-[hsl(232_45%_16%)]">Top Achievers</h3>
        </div>

        <div className="space-y-2">
          {TOP_USERS.map((user) => (
            <div key={user.rank} className="flex items-center gap-2">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${RANK_STYLES[user.rank] ?? "bg-[hsl(258_30%_93%)] text-[hsl(232_20%_50%)] font-medium"}`}>
                {user.rank}
              </div>
              <img
                src={user.avatar}
                alt={user.name}
                className="h-6 w-6 rounded-full bg-[hsl(258_30%_92%)] shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-xs text-[hsl(232_35%_25%)] flex-1 truncate">{user.name}</span>
              <span className="text-[10px] text-[hsl(232_20%_55%)] font-medium">{user.points}</span>
            </div>
          ))}
        </div>

        <button className="w-full py-1.5 rounded-xl text-[10px] font-semibold text-[hsl(258_100%_60%)] border border-[hsl(258_100%_65%_/_0.25)] hover:bg-[hsl(258_100%_65%_/_0.07)] transition-all">
          Full Leaderboard
        </button>
      </div>

      {/* Daily Stats */}
      <div className="glass-card rounded-2xl p-3 space-y-2">
        <h3 className="text-xs font-heading font-bold text-[hsl(232_45%_16%)]">Community Today</h3>
        {DAILY_STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon size={11} className="text-[hsl(258_100%_65%)]" />
              <span className="text-[11px] text-[hsl(232_20%_50%)]">{label}</span>
            </div>
            <span className="text-xs font-bold text-[hsl(232_45%_16%)]">{value}</span>
          </div>
        ))}
      </div>

      {/* Active Challenges */}
      <div className="glass-card rounded-2xl p-3 space-y-2.5">
        <h3 className="text-xs font-heading font-bold text-[hsl(232_45%_16%)]">Active Challenges</h3>
        {ACTIVE_CHALLENGES.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="rounded-xl border border-[hsl(258_20%_90%)] p-2.5 space-y-2">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-[hsl(258_100%_65%_/_0.1)] shrink-0">
                  <Icon size={12} className="text-[hsl(258_100%_60%)]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[hsl(232_45%_16%)]">{c.title}</p>
                  <p className="text-[10px] text-[hsl(232_20%_55%)]">{c.desc}</p>
                  <p className="text-[10px] text-[hsl(232_20%_60%)] mt-0.5">{c.participants} participating</p>
                </div>
              </div>
              <button className="w-full py-1 rounded-lg bg-gradient-primary text-[hsl(232_45%_16%)] text-[10px] font-semibold hover-glow transition-all">
                Join Challenge
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
