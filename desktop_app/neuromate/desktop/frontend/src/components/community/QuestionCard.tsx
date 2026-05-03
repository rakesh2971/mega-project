import { useState } from "react";
import { ArrowBigUp, MessageSquare, Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Question {
  id: number;
  title: string;
  description: string;
  tags: string[];
  author: string;
  avatar: string;
  timeAgo: string;
  upvotes: number;
  answers: number;
  isAnswered: boolean;
}

export default function QuestionCard({ question }: { question: Question }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(question.upvotes);
  const [bookmarked, setBookmarked] = useState(false);

  const handleUpvote = () => {
    setUpvoted(!upvoted);
    setUpvoteCount(upvoted ? upvoteCount - 1 : upvoteCount + 1);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-glow transition-all flex">
      {/* Upvote column */}
      <div className="flex flex-col items-center py-4 px-3 gap-1 bg-[hsl(258_30%_98%)] border-r border-[hsl(258_20%_92%)] min-w-[52px]">
        <button
          onClick={handleUpvote}
          className={cn(
            "p-1 rounded-lg transition-all",
            upvoted
              ? "text-[hsl(258_100%_60%)] bg-[hsl(258_100%_65%/0.1)]"
              : "text-[hsl(232_20%_60%)] hover:text-[hsl(258_100%_60%)] hover:bg-[hsl(258_100%_65%/0.07)]"
          )}
        >
          <ArrowBigUp size={20} className={cn(upvoted && "fill-[hsl(258_100%_60%)]")} />
        </button>
        <span className="text-xs font-bold text-[hsl(232_45%_25%)]">{upvoteCount}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-heading font-semibold text-[hsl(232_45%_16%)] leading-snug hover:text-[hsl(258_100%_55%)] cursor-pointer transition-colors line-clamp-2">
              {question.title}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-[hsl(258_60%_45%)] border border-[hsl(258_20%_88%)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {question.isAnswered && (
            <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
              Answered
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {question.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <img
              src={question.avatar}
              alt={question.author}
              className="h-5 w-5 rounded-full bg-[hsl(258_30%_92%)]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <span className="text-[10px] text-[hsl(232_20%_55%)]">{question.author}</span>
            <span className="text-[10px] text-[hsl(232_20%_65%)]">·</span>
            <span className="text-[10px] text-[hsl(232_20%_65%)]">{question.timeAgo}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-[hsl(232_20%_55%)]">
              <MessageSquare size={11} />
              {question.answers} answers
            </span>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={cn(
                "p-1 rounded-lg transition-all",
                bookmarked
                  ? "text-[hsl(258_100%_60%)] bg-[hsl(258_100%_65%/0.1)]"
                  : "text-[hsl(232_20%_60%)] hover:bg-muted"
              )}
            >
              <Bookmark size={12} className={cn(bookmarked && "fill-[hsl(258_100%_60%)]")} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
