import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, RefreshCw, AlertTriangle, Play, Youtube, Grid, List } from 'lucide-react';
import type { NewsVideo, Category } from '@/types';
import { fetchVideos } from '@/lib/videos';
import { VideoCard } from '@/components/VideoCard';
import { CATEGORY_LABELS, ALL_CATEGORIES } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface VideosViewProps {
  selectedCategory: Category | null;
  onCategoryChange: (cat: Category | null) => void;
  showBias?: boolean;
  onPlayVideo: (video: NewsVideo) => void;
}

type VideoDisplayMode = 'grid' | 'list';

export function VideosView({
  selectedCategory,
  onCategoryChange,
  onPlayVideo,
}: VideosViewProps) {
  const [videos, setVideos] = useState<NewsVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<VideoDisplayMode>('grid');

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetched = await fetchVideos(selectedCategory || undefined);
      setVideos(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const filteredVideos = useMemo(() => {
    return videos;
  }, [videos]);

  const VIDEO_CATEGORIES: Category[] = ALL_CATEGORIES;

  return (
    <div className="flex flex-col gap-5 font-sans">
      <div className="brutal-card bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-sketch text-2xl uppercase tracking-wider font-black flex items-center gap-2">
              <Youtube className="w-7 h-7" /> VIDEO INTELLIGENCE
            </h2>
            <p className="text-xs font-mono font-bold opacity-80 mt-0.5">
              {filteredVideos.length} AI, tech, research & news video streams
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border-2 border-slate-900 dark:border-slate-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 ${
                  displayMode === 'grid'
                    ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
                    : 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" /> Grid
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1 ${
                  displayMode === 'list'
                    ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
                    : 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
            </div>
            <button
              onClick={loadVideos}
              disabled={loading}
              className="brutal-btn !p-2 !bg-white !text-slate-900"
              aria-label="Refresh videos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={`brutal-tag text-xs font-extrabold uppercase cursor-pointer ${
            !selectedCategory
              ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          All Categories
        </button>
        {VIDEO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`brutal-tag text-xs font-extrabold uppercase cursor-pointer ${
              selectedCategory === cat
                ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="brutal-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-slate-100" />
          <p className="font-mono text-xs font-bold uppercase">Fetching YouTube Intelligence Streams...</p>
        </div>
      )}

      {error && (
        <div className="brutal-card p-4 bg-rose-100 border-2 border-rose-900 text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-mono font-bold">{error}</span>
          </div>
          <button onClick={loadVideos} className="prisma-btn-primary text-xs uppercase font-bold !px-3 !py-1">
            RETRY
          </button>
        </div>
      )}

      {!loading && !error && displayMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video, idx) => (
            <VideoCard key={`${video.id}-${idx}`} video={video} onPlay={onPlayVideo} />
          ))}
        </div>
      )}

      {!loading && !error && displayMode === 'list' && (
        <div className="flex flex-col gap-3">
          {filteredVideos.map((video, idx) => (
            <div
              key={`${video.id}-${idx}`}
              className="brutal-card bg-white dark:bg-slate-900 p-3.5 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => onPlayVideo(video)}
            >
              <div className="relative shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover rounded-xl border-2 border-slate-900 dark:border-slate-100"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="brutal-tag text-[9px] uppercase font-mono">
                    {CATEGORY_LABELS[video.category]}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base leading-tight line-clamp-1 text-slate-900 dark:text-slate-100">
                  {video.title}
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-500">
                  <span>{video.channelName}</span>
                  <span>{formatTimeAgo(video.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
