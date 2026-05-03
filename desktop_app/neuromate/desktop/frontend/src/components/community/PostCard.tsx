import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Star, Flag, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Post {
  id: string;
  user: { name: string; avatar: string };
  mood: string;
  moodEmoji: string;
  productivityScore?: number;
  content: string;
  image?: string | null;
  timestamp: string;
  likes: number;
  comments: number;
  isHelpful: boolean;
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [helpful, setHelpful] = useState(post.isHelpful);
  const [showAI, setShowAI] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const initials = post.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 hover-glow transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="h-9 w-9 rounded-full object-cover bg-[hsl(258_30%_92%)]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)]">
                {post.user.name}
              </p>
              {post.productivityScore && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(258_100%_65%_/_0.1)] text-[hsl(258_100%_55%)]">
                  {post.productivityScore} pts
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(232_20%_55%)]">
              <span>{post.moodEmoji} {post.mood}</span>
              <span>·</span>
              <span>{post.timestamp}</span>
            </div>
          </div>
        </div>

        {helpful && (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            <Star size={10} className="fill-amber-500 text-amber-500" />
            Helpful
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-sm text-[hsl(232_35%_25%)] leading-relaxed">{post.content}</p>

      {post.image && (
        <img
          src={post.image}
          alt="Post attachment"
          className="rounded-xl w-full object-cover max-h-52"
        />
      )}

      {/* AI Summary */}
      {showAI && (
        <div className="bg-[hsl(258_100%_65%_/_0.07)] border border-[hsl(258_100%_65%_/_0.2)] rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-[hsl(258_100%_65%)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[hsl(258_100%_55%)] mb-1">AI Insight</p>
              <p className="text-xs text-[hsl(232_35%_30%)] leading-relaxed">
                This post demonstrates effective habit formation with measurable progress. The user's
                consistency improvement reflects strong focus routines — a key indicator of long-term wellness.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[hsl(258_20%_92%)]">
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleLike}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              liked
                ? "text-red-500 bg-red-50"
                : "text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)]"
            )}
          >
            <Heart size={13} className={cn(liked && "fill-red-500")} />
            {likeCount}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)] transition-all"
          >
            <MessageCircle size={13} />
            {post.comments}
          </button>

          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)] transition-all">
            <Repeat2 size={13} />
            Share
          </button>

          <button
            onClick={() => setHelpful(!helpful)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              helpful
                ? "text-amber-500 bg-amber-50"
                : "text-[hsl(232_20%_55%)] hover:bg-[hsl(258_30%_95%)]"
            )}
          >
            <Star size={13} className={cn(helpful && "fill-amber-500")} />
            Helpful
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[hsl(258_100%_60%)] border border-[hsl(258_100%_65%_/_0.25)] hover:bg-[hsl(258_100%_65%_/_0.07)] transition-all"
          >
            <Sparkles size={12} />
            AI
          </button>
          <button className="p-1.5 rounded-lg text-[hsl(232_20%_65%)] hover:bg-[hsl(258_30%_95%)] transition-all">
            <Flag size={12} />
          </button>
        </div>
      </div>

      {/* Comment section */}
      {showComments && (
        <div className="pt-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-200 to-purple-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-[hsl(258_60%_40%)]">
              You
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] focus:outline-none focus:border-[hsl(258_100%_65%_/_0.5)] text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]"
              />
              <button
                disabled={!comment.trim()}
                onClick={() => setComment("")}
                className="px-3 py-1.5 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-semibold disabled:opacity-40 hover-glow transition-all"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
