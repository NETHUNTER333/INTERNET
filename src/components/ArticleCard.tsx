import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { Article } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  showBias?: boolean;
}

export function ArticleCard({
  article,
  onOpen,
  isBookmarked,
  onToggleBookmark,
}: ArticleCardProps) {
  const badgeStyle = CATEGORY_COLORS[article.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300/90 transition-all duration-200 cursor-pointer flex flex-col group overflow-hidden"
      onClick={() => onOpen(article)}
    >
      {/* Article Thumbnail */}
      {article.thumbnail && (
        <div className="relative h-40 overflow-hidden bg-slate-100 border-b border-slate-100">
          <img
            src={article.thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute top-3 left-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
              {CATEGORY_LABELS[article.category]}
            </span>
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col gap-2.5 flex-1">
        {/* Category Header (if no thumbnail) */}
        {!article.thumbnail && (
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle}`}>
              {CATEGORY_LABELS[article.category]}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(article);
              }}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800"
              aria-label="Toggle bookmark"
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-teal-600 fill-teal-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Title */}
        <h3 className="font-display text-base font-bold leading-snug text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-3">
          {article.title}
        </h3>

        {/* Summary */}
        {article.summary && (
          <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-800 truncate">{article.sourceName}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-400">
              {formatTimeAgo(article.publishedAt)}
            </span>
            {article.thumbnail && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(article);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-teal-600"
                aria-label="Toggle bookmark"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-teal-600 fill-teal-600" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
