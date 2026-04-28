import { useState } from "react";
import { Image, Tag, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface CreatePostBoxProps {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onPost?: (content: string, mood: string | null) => void;
}

const MOODS = [
  { emoji: "🔥", label: "Motivated" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😣", label: "Struggling" },
  { emoji: "🟢", label: "Productive" },
  { emoji: "🤔", label: "Curious" },
];

export default function CreatePostBox({
  isExpanded,
  onExpand,
  onCollapse,
  onPost,
}: CreatePostBoxProps) {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handlePost = () => {
    if (!content.trim()) return;
    onPost?.(content, selectedMood);
    setContent("");
    setSelectedMood(null);
    onCollapse();
  };

  if (!isExpanded) {
    return (
      <div
        id="create-post-collapsed"
        onClick={onExpand}
        className="glass-card rounded-2xl p-4 cursor-pointer hover-glow transition-all hover:bg-white/80"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-[hsl(258_60%_40%)]">
            You
          </div>
          <span className="text-sm text-[hsl(232_20%_60%)]">
            Share your experience today…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div id="create-post-expanded" className="glass-card rounded-2xl p-4 space-y-3 hover-glow transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 flex items-center justify-center text-[10px] font-bold text-[hsl(258_60%_40%)]">
            You
          </div>
          <div>
            <p className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)]">Create Post</p>
            <p className="text-[10px] text-[hsl(232_20%_55%)]">Share with the community</p>
          </div>
        </div>
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-lg text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)] transition-all"
        >
          <X size={14} />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        id="post-content-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your experience today…"
        rows={4}
        className="w-full text-sm px-3 py-2.5 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] focus:outline-none focus:border-[hsl(258_100%_65%_/_0.4)] resize-none text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]"
      />

      {/* Mood Picker */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-[hsl(232_20%_50%)] uppercase tracking-wider">
          How are you feeling?
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((mood) => (
            <button
              key={mood.label}
              onClick={() => setSelectedMood(selectedMood === mood.label ? null : mood.label)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                selectedMood === mood.label
                  ? "bg-gradient-primary text-[hsl(232_45%_16%)] shadow-sm"
                  : "bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] text-[hsl(232_20%_50%)] hover:bg-[hsl(258_30%_94%)]"
              )}
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[hsl(258_20%_92%)]">
        <div className="flex gap-1">
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)] transition-all">
            <Image size={13} /> Photo
          </button>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)] transition-all">
            <Tag size={13} /> Tag
          </button>
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)] transition-all">
            <HelpCircle size={13} /> Ask Q&A
          </button>
        </div>

        <button
          id="btn-submit-post"
          disabled={!content.trim()}
          onClick={handlePost}
          className="px-4 py-1.5 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-heading font-semibold disabled:opacity-40 hover-glow transition-all"
        >
          Post
        </button>
      </div>
    </div>
  );
}
