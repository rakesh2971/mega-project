import { useState } from "react";
import {
  MessageCircle, Trophy, Users, TrendingUp, Bookmark, Settings2,
  Search, Plus, Target, Zap, Heart, Brain, Flame, MessageCircleQuestion, X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import PostCard, { Post } from "@/components/community/PostCard";
import CreatePostBox from "@/components/community/CreatePostBox";
import ChallengeCard, { Challenge } from "@/components/community/ChallengeCard";
import QuestionCard, { Question } from "@/components/community/QuestionCard";
import TrendingTopicCard, { TrendingTopic } from "@/components/community/TrendingTopicCard";
import CommunityRightSidebar from "@/components/community/CommunityRightSidebar";

// ── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    user: { name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    mood: "motivated", moodEmoji: "🔥", productivityScore: 85,
    content: "Just completed my first 7-day focus challenge! The Pomodoro technique really works. Started with 2 sessions a day and now I'm consistently doing 6. My productivity has improved so much! 🎯",
    image: null, timestamp: "2 hours ago", likes: 24, comments: 8, isHelpful: true,
  },
  {
    id: "2",
    user: { name: "Alex Kumar", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
    mood: "calm", moodEmoji: "😌", productivityScore: 72,
    content: "Does anyone have tips for maintaining evening routines? I struggle with consistency after 8 PM. Would love to hear what works for you!",
    image: null, timestamp: "5 hours ago", likes: 12, comments: 15, isHelpful: false,
  },
  {
    id: "3",
    user: { name: "Maya Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya" },
    mood: "productive", moodEmoji: "🟢", productivityScore: 91,
    content: "Sharing my weekly dashboard! This app has been a game-changer for tracking my mental health journey. The AI insights are incredibly helpful. 📊",
    image: null, timestamp: "1 day ago", likes: 45, comments: 12, isHelpful: true,
  },
  {
    id: "4",
    user: { name: "Riya Mehta", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Riya" },
    mood: "curious", moodEmoji: "🤔", productivityScore: 68,
    content: "Started journaling every morning for 10 minutes. Day 14 and already noticing my anxiety levels dropping. Highly recommend trying it if you haven't already.",
    image: null, timestamp: "2 days ago", likes: 31, comments: 6, isHelpful: true,
  },
];

const FEED_FILTERS = ["Newest", "Most Helpful", "Most Liked", "Following"] as const;

// ── Tab config ────────────────────────────────────────────────────────────

const TABS = [
  { id: "feed",       label: "Feed",       icon: MessageCircle },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "qa",         label: "Q&A",        icon: Users },
  { id: "trending",   label: "Trending",   icon: TrendingUp },
  { id: "myposts",    label: "My Posts",   icon: Bookmark },
  { id: "settings",   label: "Settings",   icon: Settings2 },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Feed Tab ──────────────────────────────────────────────────────────────

function FeedTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>("Newest");
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [search, setSearch] = useState("");

  const handlePost = (content: string, mood: string | null) => {
    const newPost: Post = {
      id: String(Date.now()),
      user: { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User" },
      mood: mood ?? "motivated", moodEmoji: "✨", productivityScore: undefined,
      content, image: null, timestamp: "Just now", likes: 0, comments: 0, isHelpful: false,
    };
    setPosts([newPost, ...posts]);
  };

  const filtered = posts.filter((p) =>
    search === "" || p.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)]">
        <Search size={13} className="text-[hsl(232_20%_60%)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts…"
          className="flex-1 text-xs bg-transparent outline-none text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]"
        />
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FEED_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold transition-all",
              filter === f
                ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                : "bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_93%)]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Create post */}
      <CreatePostBox
        isExpanded={showCreate}
        onExpand={() => setShowCreate(true)}
        onCollapse={() => setShowCreate(false)}
        onPost={handlePost}
      />

      {/* Posts */}
      {filtered.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-[hsl(232_20%_55%)]">No posts match your search.</p>
        </div>
      )}
    </div>
  );
}

// ── Placeholder tabs (filled in next steps) ──────────────────────────────

const MOCK_CHALLENGES: Challenge[] = [
  { id: 1, title: "30-Day Productivity Sprint", description: "Boost your focus and output with daily micro-tasks designed to build consistency.", duration: "30 Days", level: "Medium", participants: 3244, category: "Productivity", isJoined: true, progress: 60, streak: 6 },
  { id: 2, title: "Morning Mindfulness", description: "Start your day with 10 minutes of guided meditation and intention setting.", duration: "14 Days", level: "Easy", participants: 1205, category: "Wellbeing", isJoined: false },
  { id: 3, title: "Deep Work Week", description: "Commit to 2 hours of distraction-free deep work every day for a week.", duration: "7 Days", level: "Hard", participants: 850, category: "Productivity", isJoined: false },
  { id: 4, title: "Hydration Hero", description: "Track your water intake and hit your daily hydration goals every day.", duration: "21 Days", level: "Easy", participants: 5600, category: "Health", isJoined: true, progress: 15, streak: 3 },
  { id: 5, title: "Learn a New Skill", description: "Dedicate 30 minutes daily to learning something completely new.", duration: "10 Days", level: "Medium", participants: 940, category: "Skill Growth", isJoined: false },
  { id: 6, title: "Digital Detox Weekend", description: "Disconnect from screens and reconnect with the real world around you.", duration: "2 Days", level: "Medium", participants: 2100, category: "Wellbeing", isJoined: false },
];

const CHALLENGE_CATS = [
  { id: "all",          label: "All",         icon: Target },
  { id: "productivity", label: "Productivity", icon: Zap },
  { id: "wellbeing",    label: "Wellbeing",   icon: Heart },
  { id: "skill",        label: "Skill Growth",icon: Brain },
  { id: "health",       label: "Health",      icon: Flame },
];

function ChallengesTab() {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all"
    ? MOCK_CHALLENGES
    : MOCK_CHALLENGES.filter((c) => c.category.toLowerCase().includes(cat === "skill" ? "skill" : cat));

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-[hsl(258_100%_65%_/_0.08)] to-orange-500/5 border border-[hsl(258_20%_88%)]">
        <h2 className="text-base font-heading font-bold gradient-text flex items-center gap-2 mb-1">
          <Trophy size={18} className="text-orange-500" /> Community Challenges
        </h2>
        <p className="text-xs text-[hsl(232_20%_55%)]">Build habits, stay accountable, and grow with the community.</p>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {CHALLENGE_CATS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCat(id)}
            className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all",
              cat === id
                ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                : "bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_93%)]"
            )}
          >
            <Icon size={11} />{label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
      </div>
    </div>
  );
}

const MOCK_QUESTIONS: Question[] = [
  { id: 1, title: "How do I stay consistent in my study routine?", description: "I start strong every week but by Wednesday I lose motivation. Does anyone use a specific tracking method?", tags: ["Productivity", "Study"], author: "User123", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User123", timeAgo: "2 hours ago", upvotes: 12, answers: 5, isAnswered: true },
  { id: 2, title: "Best CBT techniques for imposter syndrome?", description: "I just started a new job and feel like I don't belong. Looking for quick CBT exercises I can do at my desk.", tags: ["Wellness", "CBT", "Career"], author: "DevSarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", timeAgo: "4 hours ago", upvotes: 24, answers: 8, isAnswered: false },
  { id: 3, title: "Can I sync NeuroMate tasks with Google Calendar?", description: "I love the app but I need my tasks to show up on my main calendar. Is this feature available?", tags: ["App Feature", "Tech"], author: "MikeT", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", timeAgo: "1 day ago", upvotes: 8, answers: 1, isAnswered: false },
  { id: 4, title: "Morning routine ideas for non-morning people", description: "I struggle to wake up. What are some gentle routines to get the brain moving without caffeine overload?", tags: ["Wellness", "Routine"], author: "SleepyHead", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sleepy", timeAgo: "2 days ago", upvotes: 45, answers: 12, isAnswered: true },
];

const QA_SORTS = ["Recent", "Most Upvoted", "Unanswered"] as const;

function QATab() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<string>("Recent");
  const [showModal, setShowModal] = useState(false);
  const [qTitle, setQTitle] = useState("");
  const [qDesc, setQDesc] = useState("");
  const [qTags, setQTags] = useState("");

  const filtered = MOCK_QUESTIONS
    .filter((q) => search === "" || q.title.toLowerCase().includes(search.toLowerCase()))
    .filter((q) => sort === "Unanswered" ? !q.isAnswered : true)
    .sort((a, b) => sort === "Most Upvoted" ? b.upvotes - a.upvotes : 0);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-blue-500/8 to-[hsl(258_100%_65%_/_0.05)] border border-[hsl(258_20%_88%)]">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-heading font-bold gradient-text flex items-center gap-2 mb-1">
              <MessageCircleQuestion size={18} /> Community Q&amp;A
            </h2>
            <p className="text-xs text-[hsl(232_20%_55%)]">Ask questions → Get answers → Improve together.</p>
          </div>
          <button
            id="btn-ask-question"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-semibold hover-glow transition-all"
          >
            <Plus size={13} /> Ask Question
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex gap-2 mt-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 border border-[hsl(258_20%_90%)]">
            <Search size={12} className="text-[hsl(232_20%_60%)] shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions…" className="flex-1 text-xs bg-transparent outline-none text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]" />
          </div>
          <div className="flex items-center gap-1 bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] rounded-xl px-1 py-1">
            {QA_SORTS.map((s) => (
              <button key={s} onClick={() => setSort(s)} className={cn("px-2 py-1 rounded-lg text-[10px] font-semibold transition-all", sort === s ? "bg-gradient-primary text-[hsl(232_45%_16%)]" : "text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_93%)]")}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q) => <QuestionCard key={q.id} question={q} />)}
        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-sm text-[hsl(232_20%_55%)]">No questions match your search.</p>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-5 w-[480px] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">Ask a Question</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[hsl(258_30%_95%)] text-[hsl(232_20%_55%)] transition-all"><X size={14} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[hsl(232_20%_50%)] block mb-1">Question Title</label>
                <input value={qTitle} onChange={(e) => setQTitle(e.target.value)} placeholder="e.g. How do I stay consistent with…" className="w-full text-xs px-3 py-2 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] outline-none focus:border-[hsl(258_100%_65%_/_0.4)] text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[hsl(232_20%_50%)] block mb-1">Description</label>
                <textarea value={qDesc} onChange={(e) => setQDesc(e.target.value)} placeholder="Provide more details…" rows={3} className="w-full text-xs px-3 py-2 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] outline-none focus:border-[hsl(258_100%_65%_/_0.4)] resize-none text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[hsl(232_20%_50%)] block mb-1">Tags (comma separated)</label>
                <input value={qTags} onChange={(e) => setQTags(e.target.value)} placeholder="e.g. productivity, wellness" className="w-full text-xs px-3 py-2 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] outline-none focus:border-[hsl(258_100%_65%_/_0.4)] text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={() => setShowModal(false)} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[hsl(258_20%_90%)] text-[hsl(232_20%_50%)] hover:bg-[hsl(258_30%_95%)] transition-all">Cancel</button>
              <button onClick={() => { setShowModal(false); setQTitle(""); setQDesc(""); setQTags(""); }} disabled={!qTitle.trim()} className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-gradient-primary text-[hsl(232_45%_16%)] hover-glow disabled:opacity-40 transition-all">Post Question</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_TRENDING: TrendingTopic[] = [
  { id: 1, tag: "#DeepWorkRoutine", title: "How do you maintain 2h focus blocks without burnout?", description: "Discussing the Pomodoro technique vs. 90-minute ultradian rhythms for maximum output.", replies: 247, views: 1200, growth: 142, isHot: true },
  { id: 2, tag: "#MorningAnxiety", title: "I finally fixed my morning anxiety with this 10-min habit stack", description: "Sharing my routine involving cold water, gratitude journaling, and no phone for 30 mins.", replies: 482, views: 5600, growth: 86, isHot: true },
  { id: 3, tag: "#SleepHealth", title: "Does magnesium glycinate actually help with deep sleep?", description: "Looking for community experiences with supplements for improving sleep quality.", replies: 118, views: 3400, growth: 45, isHot: false },
  { id: 4, tag: "#DigitalMinimalism", title: "Challenge: 24 hours without social media. Who's in?", description: "A collective challenge to reset our dopamine receptors this weekend.", replies: 320, views: 2100, growth: 210, isHot: true },
  { id: 5, tag: "#StudyHacks", title: "The Feynman Technique explained simply", description: "How to learn anything faster by teaching it to a 5-year-old (or your rubber duck).", replies: 95, views: 1800, growth: 32, isHot: false },
  { id: 6, tag: "#JournalingPrompts", title: "Stoic evening reflection prompts", description: "5 questions to ask yourself every night to build resilience and clarity.", replies: 156, views: 2900, growth: 67, isHot: false },
];

const TOP_TAGS = ["#DeepWork", "#StudyHacks", "#MoodBoosters", "#NightRoutine", "#AnxietyTips", "#Minimalism", "#Focus", "#CBT"];

function TrendingTab() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = activeTag
    ? MOCK_TRENDING.filter((t) => t.tag.toLowerCase().includes(activeTag.replace("#", "").toLowerCase()))
    : MOCK_TRENDING;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-red-500/8 to-orange-500/5 border border-[hsl(258_20%_88%)]">
        <h2 className="text-base font-heading font-bold gradient-text flex items-center gap-2 mb-1">
          <Flame size={18} className="text-red-500" /> Trending Topics
        </h2>
        <p className="text-xs text-[hsl(232_20%_55%)]">Discover what the community is talking about right now.</p>
      </div>

      {/* Tag pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[hsl(232_20%_50%)]">
          <TrendingUp size={12} /> Trending:
        </div>
        {TOP_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all",
              activeTag === tag
                ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                : "bg-[hsl(258_30%_95%)] text-[hsl(258_60%_45%)] hover:bg-[hsl(258_100%_65%_/_0.15)] border border-[hsl(258_20%_88%)]"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((t) => <TrendingTopicCard key={t.id} topic={t} />)}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-[hsl(232_20%_55%)]">No trending topics for this tag.</p>
        </div>
      )}
    </div>
  );
}

const MY_POSTS: Post[] = [
  {
    id: "my-1",
    user: { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User" },
    mood: "productive", moodEmoji: "🟢", productivityScore: 88,
    content: "Just hit a 14-day journaling streak! It's incredible how much clarity writing brings. If you haven't started yet, start with just 3 sentences a day. 📓",
    image: null, timestamp: "3 days ago", likes: 18, comments: 4, isHelpful: true,
  },
];

function MyPostsTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [posts, setPosts] = useState<Post[]>(MY_POSTS);

  const handlePost = (content: string, mood: string | null) => {
    setPosts([{
      id: String(Date.now()),
      user: { name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User" },
      mood: mood ?? "motivated", moodEmoji: "✨",
      content, image: null, timestamp: "Just now", likes: 0, comments: 0, isHelpful: false,
    }, ...posts]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 border border-[hsl(258_20%_88%)]">
        <h2 className="text-base font-heading font-bold text-[hsl(232_45%_16%)] flex items-center gap-2 mb-1">
          <Bookmark size={16} className="text-[hsl(258_100%_65%)]" /> My Posts
        </h2>
        <p className="text-xs text-[hsl(232_20%_55%)]">View and manage your contributions to the community.</p>
      </div>

      {/* Create post */}
      <CreatePostBox
        isExpanded={showCreate}
        onExpand={() => setShowCreate(true)}
        onCollapse={() => setShowCreate(false)}
        onPost={handlePost}
      />

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-10 text-center space-y-3">
          <Bookmark size={36} className="text-[hsl(258_30%_85%)] mx-auto" />
          <p className="text-sm font-semibold text-[hsl(232_45%_16%)]">No posts yet</p>
          <p className="text-xs text-[hsl(232_20%_55%)]">Share your experience to inspire the community.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-semibold hover-glow transition-all"
          >
            <Plus size={13} /> Create First Post
          </button>
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-all shrink-0",
        checked ? "bg-gradient-primary" : "bg-[hsl(258_20%_88%)]"
      )}
    >
      <span className={cn(
        "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
        checked ? "left-5" : "left-0.5"
      )} />
    </button>
  );
}

function SettingRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[hsl(258_20%_93%)] last:border-0">
      <div>
        <p className="text-xs font-semibold text-[hsl(232_35%_25%)]">{label}</p>
        {desc && <p className="text-[10px] text-[hsl(232_20%_55%)] mt-0.5">{desc}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SettingsTab() {
  const [vis, setVis] = useState({ username: true, avatar: true, anonymous: false });
  const [notif, setNotif] = useState({ replies: true, likes: true, mentions: true, digest: true, push: true, email: false });
  const [content, setContent] = useState({ harmful: true, triggering: false, profanity: true });
  const [topics, setTopics] = useState([
    { id: "productivity", label: "Productivity", on: true },
    { id: "motivation",   label: "Motivation",   on: true },
    { id: "study",        label: "Study",         on: false },
    { id: "anxiety",      label: "Anxiety Support", on: true },
    { id: "sleep",        label: "Sleep",         on: false },
    { id: "mindfulness",  label: "Mindfulness",   on: true },
    { id: "fitness",      label: "Fitness",       on: true },
    { id: "cbt",          label: "CBT",           on: false },
  ]);
  const [saved, setSaved] = useState(false);

  const toggleTopic = (id: string) =>
    setTopics(topics.map((t) => t.id === id ? { ...t, on: !t.on } : t));

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const SectionHeader = ({ icon: Icon, color, title, desc }: { icon: React.ElementType; color: string; title: string; desc: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className={cn("p-1.5 rounded-lg", color)}><Icon size={14} className="text-white" /></div>
      <div><p className="text-sm font-heading font-bold text-[hsl(232_45%_16%)]">{title}</p><p className="text-[10px] text-[hsl(232_20%_55%)]">{desc}</p></div>
    </div>
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Banner */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-r from-[hsl(258_100%_65%_/_0.07)] to-purple-500/5 border border-[hsl(258_20%_88%)]">
        <h2 className="text-base font-heading font-bold gradient-text flex items-center gap-2 mb-1">
          <Settings2 size={16} /> Community Settings
        </h2>
        <p className="text-xs text-[hsl(232_20%_55%)]">Manage your privacy, notifications, and safety preferences.</p>
      </div>

      {/* Profile & Visibility */}
      <div className="glass-card rounded-2xl p-4">
        <SectionHeader icon={Users} color="bg-blue-400" title="Profile & Visibility" desc="Control what others see about you." />
        <SettingRow label="Show Username Publicly" desc="Your username is visible on your posts." checked={vis.username} onChange={(v) => setVis({ ...vis, username: v })} />
        <SettingRow label="Show Avatar" desc="Display your profile picture next to your name." checked={vis.avatar} onChange={(v) => setVis({ ...vis, avatar: v })} />
        <SettingRow label="Anonymous Mode" desc="Hide your identity on all future posts (visible to mods)." checked={vis.anonymous} onChange={(v) => setVis({ ...vis, anonymous: v })} />
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4">
        <SectionHeader icon={MessageCircle} color="bg-amber-400" title="Notifications" desc="Choose how and when you want to be notified." />
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <p className="text-[10px] font-bold text-[hsl(232_20%_50%)] uppercase tracking-wide mb-2">Activity</p>
            <SettingRow label="Replies to posts" checked={notif.replies} onChange={(v) => setNotif({ ...notif, replies: v })} />
            <SettingRow label="Likes on posts" checked={notif.likes} onChange={(v) => setNotif({ ...notif, likes: v })} />
            <SettingRow label="Mentions" checked={notif.mentions} onChange={(v) => setNotif({ ...notif, mentions: v })} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[hsl(232_20%_50%)] uppercase tracking-wide mb-2">Channels</p>
            <SettingRow label="Daily Digest" checked={notif.digest} onChange={(v) => setNotif({ ...notif, digest: v })} />
            <SettingRow label="Push Notifications" checked={notif.push} onChange={(v) => setNotif({ ...notif, push: v })} />
            <SettingRow label="Email Notifications" checked={notif.email} onChange={(v) => setNotif({ ...notif, email: v })} />
          </div>
        </div>
      </div>

      {/* Content & Safety */}
      <div className="glass-card rounded-2xl p-4">
        <SectionHeader icon={Settings2} color="bg-green-500" title="Content & Safety" desc="Customize your feed for a safe experience." />
        <SettingRow label="Filter Harmful Content" desc="AI-based flagging of toxic or harmful posts." checked={content.harmful} onChange={(v) => setContent({ ...content, harmful: v })} />
        <SettingRow label="Hide Triggering Content" desc="Blur posts containing common triggers." checked={content.triggering} onChange={(v) => setContent({ ...content, triggering: v })} />
        <SettingRow label="Profanity Filter" desc="Hide offensive language in posts." checked={content.profanity} onChange={(v) => setContent({ ...content, profanity: v })} />
      </div>

      {/* Topic Preferences */}
      <div className="glass-card rounded-2xl p-4">
        <SectionHeader icon={Bookmark} color="bg-pink-400" title="Topic Preferences" desc="Select topics to customize your feed." />
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTopic(t.id)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                t.on
                  ? "bg-gradient-primary text-[hsl(232_45%_16%)]"
                  : "bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_93%)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocked Users */}
      <div className="glass-card rounded-2xl p-4">
        <SectionHeader icon={Users} color="bg-red-400" title="Blocked Users" desc="Manage users you have blocked." />
        {[{ name: "SpamBot99", date: "Blocked Nov 12, 2024" }, { name: "NegativeVibes", date: "Blocked Oct 24, 2024" }].map((u) => (
          <div key={u.name} className="flex items-center justify-between py-2 border-b border-[hsl(258_20%_93%)] last:border-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[hsl(258_30%_92%)] flex items-center justify-center text-[10px] font-bold text-[hsl(232_20%_50%)]">
                {u.name[0]}
              </div>
              <div>
                <p className="text-xs font-semibold text-[hsl(232_35%_25%)]">{u.name}</p>
                <p className="text-[10px] text-[hsl(232_20%_60%)]">{u.date}</p>
              </div>
            </div>
            <button className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-all">
              Unblock
            </button>
          </div>
        ))}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          id="btn-save-community-settings"
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-heading font-semibold transition-all",
            saved
              ? "bg-green-100 text-green-600 border border-green-200"
              : "bg-gradient-primary text-[hsl(232_45%_16%)] hover-glow"
          )}
        >
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Community Page ────────────────────────────────────────────────────────

export default function Community() {
  const [activeTab, setActiveTab] = useState<TabId>("feed");

  const tabContent: Record<TabId, React.ReactNode> = {
    feed:       <FeedTab />,
    challenges: <ChallengesTab />,
    qa:         <QATab />,
    trending:   <TrendingTab />,
    myposts:    <MyPostsTab />,
    settings:   <SettingsTab />,
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(258_20%_90%)] bg-white/60 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="text-base font-heading font-bold text-[hsl(232_45%_16%)]">Community</h1>
            <p className="text-[11px] text-[hsl(232_20%_55%)]">Connect, share, and grow together</p>
          </div>
          <button
            id="btn-new-post-fab"
            onClick={() => setActiveTab("feed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-heading font-semibold hover-glow transition-all"
          >
            <Plus size={13} /> New Post
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[hsl(258_20%_90%)] overflow-x-auto scrollbar-hide shrink-0 bg-white/40">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`tab-community-${id}`}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold whitespace-nowrap transition-all",
                activeTab === id
                  ? "bg-gradient-primary text-[hsl(232_45%_16%)] shadow-sm"
                  : "text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)]"
              )}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 smooth-scroll scrollbar-hide">
          {tabContent[activeTab]}
        </div>
      </div>

      {/* Right sidebar */}
      <CommunityRightSidebar />
    </div>
  );
}
