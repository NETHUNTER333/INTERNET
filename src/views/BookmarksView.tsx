import { Bookmark, Trash2, ExternalLink, Newspaper } from 'lucide-react';
import type { BookmarkRecord } from '@/hooks/useBookmarks';
import { CATEGORY_COLORS, CATEGORY_LABELS, BIAS_LABELS, BIAS_COLORS } from '@/data/sources';
import type { BiasRating } from '@/types';

interface BookmarksViewProps {
  bookmarks: BookmarkRecord[];
  loading: boolean;
  onRemove: (link: string) => void;
}

export function BookmarksView({ bookmarks, loading, onRemove }: BookmarksViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="brutal-card bg-brutal-pink p-4">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <Bookmark className="w-7 h-7" /> Saved Articles
        </h2>
        <p className="text-sm font-mono">{bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}</p>
      </div>

      {loading && (
        <div className="brutal-card bg-brutal-white p-8 text-center">
          <p className="font-mono text-sm">Loading bookmarks...</p>
        </div>
      )}

      {!loading && bookmarks.length === 0 && (
        <div className="brutal-card bg-brutal-white p-12 text-center flex flex-col items-center gap-3">
          <Newspaper className="w-12 h-12 text-brutal-black/30" />
          <p className="font-display text-lg">No saved articles yet</p>
          <p className="text-sm font-mono text-brutal-black/60">
            Bookmark articles from the feed to read them later
          </p>
        </div>
      )}

      {!loading && bookmarks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarks.map((bm) => (
            <div key={bm.id} className="brutal-card bg-brutal-white p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {bm.category && (
                  <span className={`${CATEGORY_COLORS[bm.category] || 'bg-brutal-gray'} brutal-tag`}>
                    {CATEGORY_LABELS[bm.category] || bm.category}
                  </span>
                )}
                {bm.source_bias && (
                  <span className={`${BIAS_COLORS[bm.source_bias as BiasRating] || 'bg-brutal-gray'} brutal-tag`}>
                    {BIAS_LABELS[bm.source_bias as BiasRating] || bm.source_bias}
                  </span>
                )}
              </div>

              <h3 className="font-display text-base leading-tight">{bm.title}</h3>

              {bm.summary && (
                <p className="text-sm font-mono text-brutal-black/70 line-clamp-2">{bm.summary}</p>
              )}

              {bm.thumbnail && (
                <img
                  src={bm.thumbnail}
                  alt=""
                  className="w-full h-32 object-cover border-2 border-brutal-black"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}

              <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t-2 border-brutal-black/20">
                <span className="text-xs font-bold">{bm.source_name}</span>
                <div className="flex items-center gap-1.5">
                  <a
                    href={bm.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brutal-btn bg-brutal-yellow !px-2 !py-1 text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => onRemove(bm.link)}
                    className="brutal-btn bg-brutal-red text-brutal-white !px-2 !py-1 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
