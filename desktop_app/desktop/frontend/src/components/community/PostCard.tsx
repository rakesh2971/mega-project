import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Heart, MessageCircle, Repeat2, Star, Flag, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { invoke } from "@tauri-apps/api/core";

export interface Post {
  id: string;
  author_name: string;
  author_avatar?: string;
  mood: string;
  mood_emoji: string;
  productivity_score?: number;
  content: string;
  image_url?: string | null;
  created_at: string;
  likes: number;
  comments: number;
  is_helpful: boolean;
}

export interface PostComment {
  id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export default function PostCard({ post, onInteraction }: { post: Post, onInteraction?: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [helpful, setHelpful] = useState(post.is_helpful);
  const [showAI, setShowAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [commentsList, setCommentsList] = useState<PostComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [reposting, setReposting] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostThought, setRepostThought] = useState("");

  // Use a hardcoded dummy UUID for user actions until auth state is wired in this component.
  // In a full app, you'd get this from a global auth store.
  const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000001"; 

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  };

  const handleHelpful = async () => {
    const previousState = helpful;
    // Optimistic update so it glows yellow instantly
    setHelpful(!previousState);
    
    try {
      const isNowHelpful: boolean = await invoke("toggle_helpful_post", {
        userId: DUMMY_USER_ID,
        postId: post.id
      });
      setHelpful(isNowHelpful);
      if (onInteraction) onInteraction();
    } catch (e) {
      console.error("Failed to toggle helpful:", e);
      // Revert if the backend call fails
      setHelpful(previousState);
    }
  };

  const handleRepostClick = () => {
    setShowRepostModal(true);
  };

  const submitRepost = async () => {
    setReposting(true);
    try {
      await invoke("repost", {
        postId: post.id,
        authorId: DUMMY_USER_ID,
        thought: repostThought.trim() !== "" ? repostThought : null
      });
      setShowRepostModal(false);
      setRepostThought("");
      if (onInteraction) onInteraction();
    } catch (e) {
      console.error("Failed to repost:", e);
    } finally {
      setReposting(false);
    }
  };

  const handleShowAI = async () => {
    setShowAI(!showAI);
    if (!showAI && !aiInsight) {
      setInsightLoading(true);
      try {
        const insight: string = await invoke("get_ai_post_insight", {
          postId: post.id,
          content: post.content
        });
        setAiInsight(insight);
      } catch (e) {
        console.error("Failed to fetch AI insight:", e);
        setAiInsight("Unable to generate insight at this time.");
      } finally {
        setInsightLoading(false);
      }
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const list: PostComment[] = await invoke("get_post_comments", { postId: post.id });
      setCommentsList(list);
    } catch (e) {
      console.error("Failed to fetch comments", e);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    if (!showComments && commentsList.length === 0) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const submitComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await invoke("add_post_comment", {
        postId: post.id,
        authorId: DUMMY_USER_ID,
        content: commentInput
      });
      setCommentInput("");
      setCommentsCount(c => c + 1);
      fetchComments(); // Refresh comments list
      if (onInteraction) onInteraction();
    } catch (e) {
      console.error("Failed to add comment:", e);
    }
  };

  const avatarSrc = post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`;

  return (
    <div className="glass-card rounded-2xl p-4 space-y-3 hover-glow transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={post.author_name}
            className="h-9 w-9 rounded-full object-cover bg-[hsl(258_30%_92%)]"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)]">
                {post.author_name}
              </p>
              {post.productivity_score != null && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(258_100%_65%/0.1)] text-[hsl(258_100%_55%)]">
                  {post.productivity_score} pts
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[hsl(232_20%_55%)]">
              <span>{post.mood_emoji} {post.mood}</span>
              <span>·</span>
              <span>{new Date(post.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
      <p className="text-sm text-[hsl(232_35%_25%)] leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post attachment"
          className="rounded-xl w-full object-cover max-h-52"
        />
      )}

      {/* AI Summary */}
      {showAI && (
        <div className="bg-[hsl(258_100%_65%_/_0.07)] border border-[hsl(258_100%_65%/0.2)] rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-[hsl(258_100%_65%)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[hsl(258_100%_55%)] mb-1">AI Insight</p>
              {insightLoading ? (
                <p className="text-xs text-[hsl(232_35%_30%)] animate-pulse">Analyzing post...</p>
              ) : (
                <p className="text-xs text-[hsl(232_35%_30%)] leading-relaxed">
                  {aiInsight}
                </p>
              )}
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
                : "text-[hsl(232_20%_55%)] hover:bg-muted"
            )}
          >
            <Heart size={13} className={cn(liked && "fill-red-500")} />
            {likeCount}
          </button>

          <button
            onClick={toggleComments}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[hsl(232_20%_55%)] hover:bg-muted transition-all"
          >
            <MessageCircle size={13} />
            {commentsCount}
          </button>

          <button 
            onClick={handleRepostClick}
            disabled={reposting}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[hsl(232_20%_55%)] hover:bg-muted transition-all disabled:opacity-50"
          >
            <Repeat2 size={13} />
            {reposting ? "..." : "Share"}
          </button>

          <button
            onClick={handleHelpful}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
              helpful
                ? "text-amber-500 bg-amber-50"
                : "text-[hsl(232_20%_55%)] hover:bg-muted"
            )}
          >
            <Star size={13} className={cn(helpful && "fill-amber-500")} />
            Helpful
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShowAI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[hsl(258_100%_60%)] border border-[hsl(258_100%_65%/0.25)] hover:bg-[hsl(258_100%_65%/0.07)] transition-all"
          >
            <Sparkles size={12} />
            AI
          </button>
          <button className="p-1.5 rounded-lg text-[hsl(232_20%_65%)] hover:bg-muted transition-all">
            <Flag size={12} />
          </button>
        </div>
      </div>

      {/* Comment section */}
      {showComments && (
        <div className="pt-2 space-y-3">
          {/* Comments List */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1 smooth-scroll">
            {loadingComments && <p className="text-[10px] text-center text-muted-foreground">Loading comments...</p>}
            {!loadingComments && commentsList.map(c => (
              <div key={c.id} className="flex gap-2">
                 <img
                  src={c.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author_name}`}
                  alt=""
                  className="h-6 w-6 rounded-full bg-[hsl(258_30%_92%)] mt-0.5"
                 />
                 <div className="flex-1 bg-[hsl(258_20%_96%)] px-3 py-2 rounded-xl">
                   <div className="flex items-center justify-between mb-0.5">
                     <span className="text-[11px] font-bold text-[hsl(232_45%_16%)]">{c.author_name}</span>
                     <span className="text-[9px] text-[hsl(232_20%_55%)]">{new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <p className="text-xs text-[hsl(232_35%_25%)]">{c.content}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <div className="h-7 w-7 rounded-full bg-linear-to-br from-purple-200 to-purple-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-[hsl(258_60%_40%)]">
              You
            </div>
            <div className="flex-1 flex gap-2">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-[hsl(258_30%_97%)] border border-[hsl(258_20%_90%)] focus:outline-none focus:border-[hsl(258_100%_65%/0.5)] text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]"
                onKeyDown={(e) => { if (e.key === 'Enter') submitComment() }}
              />
              <button
                disabled={!commentInput.trim()}
                onClick={submitComment}
                className="px-3 py-1.5 rounded-xl bg-gradient-primary text-[hsl(232_45%_16%)] text-xs font-semibold disabled:opacity-40 hover-glow transition-all"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Repost Modal via Portal */}
      {showRepostModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl border border-[hsl(258_30%_90%)] rounded-2xl p-5 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[hsl(232_45%_16%)] mb-4">Quote Share</h3>
            
            <textarea
              value={repostThought}
              onChange={(e) => setRepostThought(e.target.value)}
              placeholder="Add a comment... (optional)"
              className="w-full text-sm p-4 rounded-xl bg-transparent border-none focus:outline-none focus:ring-0 text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)] min-h-[100px] resize-none mb-3"
              autoFocus
            />

            <div className="mb-4 p-4 bg-[hsl(258_30%_98%)] border border-[hsl(258_30%_90%)] rounded-xl opacity-90">
              <div className="flex items-center gap-2 mb-2">
                 <img
                  src={avatarSrc}
                  alt={post.author_name}
                  className="h-5 w-5 rounded-full object-cover bg-[hsl(258_30%_92%)]"
                 />
                 <p className="text-xs font-semibold text-[hsl(232_45%_16%)]">{post.author_name}</p>
              </div>
              <p className="text-xs text-[hsl(232_35%_25%)] line-clamp-3 leading-relaxed">{post.content}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[hsl(258_20%_92%)]">
              <button
                onClick={() => setShowRepostModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[hsl(232_20%_55%)] hover:bg-[hsl(258_20%_92%)] transition-all"
                disabled={reposting}
              >
                Cancel
              </button>
              <button
                onClick={submitRepost}
                disabled={reposting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-primary text-[hsl(232_45%_16%)] hover-glow transition-all"
              >
                {reposting ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
