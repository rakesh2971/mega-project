import { MessageCircle, Eye, ArrowRight, TrendingUp } from "lucide-react";
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

export default function TrendingTopicCard({ topic }: { topic: TrendingTopic }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden hover-glow transition-all flex flex-col relative group">
      {/* HOT badge */}
      {topic.isHot && (
        <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl flex items-center gap-1 z-10">
          <TrendingUp size={9} /> HOT
        </div>
      )}

      <div className="p-4 flex-1 space-y-2">
        {/* Tag badge */}
        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[hsl(258_100%_65%_/_0.1)] text-[hsl(258_100%_55%)] border border-[hsl(258_100%_65%_/_0.2)]">
          {topic.tag}
        </span>

        {/* Title */}
        <h3 className="text-sm font-heading font-bold text-[hsl(232_45%_16%)] leading-snug line-clamp-2 group-hover:text-[hsl(258_100%_50%)] transition-colors">
          {topic.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-[hsl(232_20%_50%)] leading-relaxed line-clamp-2">
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
        <button className="w-full py-1.5 rounded-xl text-xs font-heading font-semibold text-[hsl(232_20%_50%)] flex items-center justify-center gap-1.5 hover:bg-gradient-primary hover:text-[hsl(232_45%_16%)] transition-all group-hover:bg-gradient-primary group-hover:text-[hsl(232_45%_16%)]">
          Join Discussion <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
