import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { Article } from '@/types';
import { BiasTag } from './BiasTag';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface ArticleCardProps {
  article: Article;
  onOpen: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  showBias: boolean;
}

export function ArticleCard({
  article,
  onOpen,
  isBookmarked,
  onToggleBookmark,
  showBias,
}: ArticleCardProps) {
  return (
    <div
      className="brutal-card cursor-pointer flex flex-col"
      onClick={() => onOpen(article)}
    >
      {article.thumbnail && (
        <div className={`border-b-4 border-brutal-black ${CATEGORY_COLORS[article.category]} p-1`}>
          <img
            src={article.thumbnail}
            alt=""
            className="w-full h-40 object-cover border-2 border-brutal-black"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className={`${CATEGORY_COLORS[article.category]} brutal-tag`}>
            {CATEGORY_LABELS[article.category]}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            className="hover:scale-110 transition-transform"
            aria-label="Toggle bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-brutal-black fill-brutal-black" />
            ) : (
              <Bookmark className="w-5 h-5 text-brutal-black" />
            )}
          </button>
        </div>

        <h3 className="font-display text-base leading-tight line-clamp-3">
          {article.title}
        </h3>

        {article.summary && (
          <p className="text-sm text-brutal-black/70 line-clamp-2 font-mono">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t-2 border-brutal-black/20">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold">{article.sourceName}</span>
            {showBias && <BiasTag bias={article.sourceBias} />}
          </div>
          <span className="text-xs font-mono text-brutal-black/60">
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
