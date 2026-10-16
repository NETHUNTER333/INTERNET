import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import type { Story, Article } from '@/types';
import { BiasTag } from './BiasTag';
import { CoverageBar } from './CoverageBar';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface StoryCardProps {
  story: Story;
  onOpenArticle: (article: Article) => void;
  onOpenStory: (story: Story) => void;
  isBookmarked: (link: string) => boolean;
  onToggleBookmark: (article: Article) => void;
  showBias: boolean;
}

export function StoryCard({
  story,
  onOpenArticle,
  onOpenStory,
  isBookmarked,
  onToggleBookmark,
  showBias,
}: StoryCardProps) {
  return (
    <div className="brutal-card flex flex-col overflow-hidden">
      {story.thumbnail && (
        <div className={`border-b-4 border-brutal-black ${CATEGORY_COLORS[story.category]} p-1`}>
          <img
            src={story.thumbnail}
            alt=""
            className="w-full h-48 object-cover border-2 border-brutal-black"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${CATEGORY_COLORS[story.category]} brutal-tag`}>
            {CATEGORY_LABELS[story.category]}
          </span>
          <span className="brutal-tag bg-brutal-white">
            {story.totalSources} {story.totalSources === 1 ? 'Source' : 'Sources'}
          </span>
          {story.isBlindSpot && (
            <span className="brutal-tag bg-brutal-red text-brutal-white flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {story.blindSpotSide === 'right' ? 'Right Blind Spot' : 'Left Blind Spot'}
            </span>
          )}
        </div>

        <h2
          className="font-display text-lg leading-tight cursor-pointer hover:underline"
          onClick={() => onOpenStory(story)}
        >
          {story.title}
        </h2>

        {showBias && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase">Coverage</span>
              <span className="text-xs font-mono text-brutal-black/60">{formatTimeAgo(story.publishedAt)}</span>
            </div>
            <CoverageBar coverage={story.coverage} totalSources={story.totalSources} />
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-xs font-bold uppercase text-brutal-black/60">Sources covering this:</span>
          {story.articles.slice(0, 4).map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between gap-2 border-2 border-brutal-black/30 p-1.5 hover:border-brutal-black hover:bg-brutal-yellow/20 transition-all cursor-pointer"
              onClick={() => onOpenArticle(article)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xs font-bold truncate">{article.sourceName}</span>
                {showBias && <BiasTag bias={article.sourceBias} />}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(article);
                }}
                className="shrink-0"
                aria-label="Toggle bookmark"
              >
                {isBookmarked(article.link) ? (
                  <EyeOff className="w-4 h-4 text-brutal-black/40" />
                ) : (
                  <Eye className="w-4 h-4 text-brutal-black/60" />
                )}
              </button>
            </div>
          ))}
          {story.articles.length > 4 && (
            <button
              onClick={() => onOpenStory(story)}
              className="text-xs font-bold uppercase text-brutal-blue hover:underline text-left"
            >
              +{story.articles.length - 4} more sources
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
