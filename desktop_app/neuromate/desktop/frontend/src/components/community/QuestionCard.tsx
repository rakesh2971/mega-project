import { useState } from "react";
import { ArrowBigUp, MessageSquare, Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Answer {
  id: number;
  author: string;
  avatar: string;
  content: string;
  upvotes: number;
  timeAgo: string;
  isAccepted?: boolean;
}

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
  answersList?: Answer[];
  isBookmarked?: boolean;
}

export default function QuestionCard({ 
  question, 
  onUpvote, 
  onAnswerSubmit,
  onBookmark
}: { 
  question: Question; 
  onUpvote?: (id: number, increment: boolean) => void;
  onAnswerSubmit?: (id: number, content: string) => void;
  onBookmark?: (id: number, bookmarked: boolean) => void;
}) {
  const [upvoted, setUpvoted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(question.upvotes);
  const [localBookmarked, setLocalBookmarked] = useState(false);

  const bookmarked = question.isBookmarked ?? localBookmarked;

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = !bookmarked;
    setLocalBookmarked(newStatus);
    if (onBookmark) {
      onBookmark(question.id, newStatus);
    }
  };
  const [newAnswer, setNewAnswer] = useState("");

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    if (onAnswerSubmit) {
      onAnswerSubmit(question.id, newAnswer.trim());
      setNewAnswer("");
    }
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowUpvoted = !upvoted;
    setUpvoted(isNowUpvoted);
    setUpvoteCount(isNowUpvoted ? upvoteCount + 1 : upvoteCount - 1);
    if (onUpvote) {
      onUpvote(question.id, isNowUpvoted);
    }
  };

  return (
    <div 
      className="glass-card rounded-2xl overflow-hidden hover-glow transition-all flex flex-col cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex">
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
              onClick={handleBookmark}
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

      {/* Inline Answers & Reply Box */}
      {isExpanded && (
        <div className="bg-[hsl(258_30%_98%)] border-t border-[hsl(258_20%_92%)] p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
          
          {/* Reply Box */}
          <form onSubmit={handleSubmitAnswer} className="flex gap-2 items-start">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer..."
              rows={2}
              className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-[hsl(258_20%_90%)] outline-none focus:border-[hsl(258_100%_65%/0.4)] resize-none text-[hsl(232_35%_25%)] placeholder:text-[hsl(232_20%_65%)]"
            />
            <button
              type="submit"
              disabled={!newAnswer.trim()}
              className="px-4 py-2 h-full min-h-[38px] rounded-xl text-xs font-semibold bg-gradient-primary text-[hsl(232_45%_16%)] hover-glow disabled:opacity-40 transition-all shrink-0"
            >
              Post
            </button>
          </form>

          {/* Answers List */}
          {question.answersList && question.answersList.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[hsl(258_20%_92%)]">
              <h4 className="text-xs font-semibold text-[hsl(232_45%_25%)] mb-2">Answers</h4>
              {question.answersList.map((ans) => (
                <div key={ans.id} className="flex gap-3 bg-white p-3 rounded-xl border border-[hsl(258_20%_92%)]">
                  <div className="flex flex-col items-center gap-1">
                    <button className="text-[hsl(232_20%_60%)] hover:text-[hsl(258_100%_60%)] transition-colors">
                      <ArrowBigUp size={16} />
                    </button>
                    <span className="text-[10px] font-bold text-[hsl(232_45%_25%)]">{ans.upvotes}</span>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs text-muted-foreground leading-relaxed">{ans.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img src={ans.avatar} alt={ans.author} className="h-4 w-4 rounded-full bg-[hsl(258_30%_92%)]" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <span className="text-[10px] text-[hsl(232_20%_55%)]">{ans.author}</span>
                        <span className="text-[10px] text-[hsl(232_20%_65%)]">·</span>
                        <span className="text-[10px] text-[hsl(232_20%_65%)]">{ans.timeAgo}</span>
                      </div>
                      {ans.isAccepted && (
                        <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                          Accepted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
