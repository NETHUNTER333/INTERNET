import { Eye, EyeOff, Layers, ChevronRight } from 'lucide-react';
import type { Story, Article } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface StoryCardProps {
  story: Story;
  onOpenArticle: (article: Article) => void;
  onOpenStory: (story: Story) => void;
  isBookmarked: (link: string) => boolean;
  onToggleBookmark: (article: Article) => void;
  showBias?: boolean;
}

export function StoryCard({
  story,
  onOpenArticle,
  onOpenStory,
  isBookmarked,
  onToggleBookmark,
}: StoryCardProps) {
  const badgeStyle = CATEGORY_COLORS[story.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300/90 transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Thumbnail Banner */}
      {story.thumbnail && (
        <div className="relative h-44 overflow-hidden bg-slate-100 border-b border-slate-100">
          <img
            src={story.thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
              {CATEGORY_LABELS[story.category]}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header Metadata (if no thumbnail) */}
        {!story.thumbnail && (
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
              {CATEGORY_LABELS[story.category]}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {formatTimeAgo(story.publishedAt)}
            </span>
          </div>
        )}

        {/* Story Title */}
        <h2
          className="font-display text-base font-bold leading-snug text-slate-900 group-hover:text-teal-600 transition-colors cursor-pointer line-clamp-2"
          onClick={() => onOpenStory(story)}
        >
          {story.title}
        </h2>

        {/* Sources Coverage Header */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>{story.totalSources} {story.totalSources === 1 ? 'Source' : 'Sources'}</span>
          </div>
          {story.thumbnail && (
            <span className="text-xs font-medium text-slate-400">
              {formatTimeAgo(story.publishedAt)}
            </span>
          )}
        </div>

        {/* Source List */}
        <div className="flex flex-col gap-2 pt-1">
          {story.articles.slice(0, 3).map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between gap-2 border border-slate-200/70 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-200 p-2.5 rounded-xl transition-all cursor-pointer"
              onClick={() => onOpenArticle(article)}
            >
              <span className="text-xs font-semibold text-slate-800 truncate">{article.sourceName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(article);
                }}
                className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-teal-600 transition-colors shrink-0 ml-auto"
                aria-label="Toggle bookmark"
              >
                {isBookmarked(article.link) ? (
                  <EyeOff className="w-3.5 h-3.5 text-teal-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}

          {story.articles.length > 3 && (
            <button
              onClick={() => onOpenStory(story)}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-1 hover:underline text-left w-fit"
            >
              <span>+{story.articles.length - 3} more sources</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
