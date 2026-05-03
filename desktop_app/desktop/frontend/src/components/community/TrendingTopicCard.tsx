import { useState } from "react";
import { MessageCircle, Eye, ArrowRight, TrendingUp, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TrendingTopic {
  id: number;
  tag: string;
  title: string;
  description: string;
  replies: number;
  views: number;
  growth: number;
  isHot: boolean;
}

const MOCK_COMMENTS = [
  { id: 1, author: "DeepThinker", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deep", content: "This has been a game changer for me. Highly recommend trying it out for at least a week before judging.", upvotes: 45, timeAgo: "2 hours ago" },
  { id: 2, author: "RoutineBuilder", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Routine", content: "I struggled with this initially, but combining it with a good sleep schedule made all the difference.", upvotes: 32, timeAgo: "4 hours ago" },
  { id: 3, author: "NoviceLearner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Novice", content: "Can someone explain the second step in more detail? I keep getting stuck there.", upvotes: 12, timeAgo: "5 hours ago" },
];

export default function TrendingTopicCard({ topic }: { topic: TrendingTopic }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newReply, setNewReply] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
      content: newReply.trim(),
      upvotes: 1,
      timeAgo: "Just now"
    };
    setComments([newComment, ...comments]);
    setNewReply("");
  };

  return (
    <div className={cn("glass-card rounded-2xl overflow-hidden hover-glow transition-all flex flex-col relative group", isExpanded && "col-span-2")}>
      {/* HOT badge */}
      {topic.isHot && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl flex items-center gap-1 z-10">
          <TrendingUp size={9} /> HOT
        </div>
      )}

      <div className="p-4 flex-1 space-y-2">
        {/* Tag badge */}
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(258_100%_65%/0.1)] text-[hsl(258_100%_55%)] border border-[hsl(258_100%_65%/0.2)]">
          {topic.tag}
        </span>

        {/* Title */}
        <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)] leading-snug line-clamp-2 group-hover:text-[hsl(258_100%_50%)] transition-colors">
          {topic.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {topic.description}
        </p>

        {/* Metrics */}
        <div className="flex items-center gap-3 text-[10px] text-[hsl(232_20%_55%)] pt-1">
          <span className="flex items-center gap-1"><MessageCircle size={10} />{topic.replies} replies</span>
          <span className="flex items-center gap-1">
            <Eye size={10} />
            {topic.views > 1000 ? `${(topic.views / 1000).toFixed(1)}k` : topic.views} views
          </span>
          <span className="flex items-center gap-1 text-green-600 font-semibold">
            <TrendingUp size={10} />+{topic.growth}%
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4 pt-1 border-t border-[hsl(258_20%_92%)] mt-auto">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full py-1.5 rounded-xl text-xs font-heading font-semibold text-muted-foreground flex items-center justify-center gap-1.5 transition-all",
            isExpanded 
              ? "bg-muted text-[hsl(232_45%_16%)]" 
              : "hover:bg-gradient-primary hover:text-[hsl(232_45%_16%)] group-hover:bg-gradient-primary group-hover:text-[hsl(232_45%_16%)]"
          )}
        >
          {isExpanded ? "Close Discussion" : "Join Discussion"}
          {!isExpanded && <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />}
        </button>
      </div>

      {/* Reddit Thread Expanded View */}
      {isExpanded && (
        <div className="bg-[hsl(258_30%_98%)] border-t border-[hsl(258_20%_92%)] p-4 space-y-4">
          <form onSubmit={handleSubmitReply} className="flex gap-2 items-start">
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="What are your thoughts?"
              rows={2}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-[hsl(258_20%_90%)] outline-none focus:border-[hsl(258_100%_65%/0.4)] resize-none text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]"
            />
            <button
              type="submit"
              disabled={!newReply.trim()}
              className="px-4 py-2 h-full min-h-[38px] rounded-xl text-xs font-semibold bg-gradient-primary text-[hsl(232_45%_16%)] hover-glow disabled:opacity-40 transition-all shrink-0"
            >
              Comment
            </button>
          </form>

          <div className="space-y-3 pt-3 border-t border-[hsl(258_20%_92%)]">
            <h4 className="text-xs font-semibold text-[hsl(232_45%_25%)] mb-2">Discussion Thread</h4>
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 bg-white p-3 rounded-xl border border-[hsl(258_20%_92%)]">
                <div className="flex flex-col items-center gap-1">
                  <button className="text-[hsl(232_20%_60%)] hover:text-[hsl(258_100%_60%)] transition-colors">
                    <ArrowBigUp size={16} />
                  </button>
                  <span className="text-[10px] font-bold text-[hsl(232_45%_25%)]">{comment.upvotes}</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <img src={comment.avatar} alt={comment.author} className="h-4 w-4 rounded-full bg-[hsl(258_30%_92%)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <span className="text-[10px] font-bold text-[hsl(232_35%_25%)]">{comment.author}</span>
                    <span className="text-[10px] text-[hsl(232_20%_65%)]">·</span>
                    <span className="text-[10px] text-[hsl(232_20%_65%)]">{comment.timeAgo}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                  <div className="flex items-center gap-3 pt-1">
                    <button className="text-[10px] font-semibold text-[hsl(232_20%_55%)] hover:text-[hsl(258_100%_60%)] transition-colors flex items-center gap-1">
                      <MessageCircle size={10} /> Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
