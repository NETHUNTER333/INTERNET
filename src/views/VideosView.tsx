import { useState, useEffect, useMemo } from 'react';
import { Loader2, RefreshCw, AlertTriangle, Play, X, Filter, Youtube } from 'lucide-react';
import type { NewsVideo, Category, BiasRating, ViewName } from '@/types';
import { fetchVideos } from '@/lib/videos';
import { VideoCard } from '@/components/VideoCard';
import { BiasTag } from '@/components/BiasTag';
import { CATEGORY_COLORS, CATEGORY_LABELS, BIAS_LABELS, BIAS_ORDER, BIAS_COLORS, ALL_CATEGORIES } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface VideosViewProps {
  selectedCategory: Category | null;
  onCategoryChange: (cat: Category | null) => void;
  showBias: boolean;
  onPlayVideo: (video: NewsVideo) => void;
}

type BiasFilter = BiasRating | 'all';
type VideoDisplayMode = 'grid' | 'list';

export function VideosView({
  selectedCategory,
  onCategoryChange,
  showBias,
  onPlayVideo,
}: VideosViewProps) {
  const [videos, setVideos] = useState<NewsVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biasFilter, setBiasFilter] = useState<BiasFilter>('all');
  const [displayMode, setDisplayMode] = useState<VideoDisplayMode>('grid');

  const loadVideos = async () => {
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
  };

  useEffect(() => {
    loadVideos();
  }, [selectedCategory]);

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (biasFilter !== 'all') {
      result = result.filter((v) => v.channelBias === biasFilter);
    }
    return result;
  }, [videos, biasFilter]);

  const VIDEO_CATEGORIES: Category[] = ALL_CATEGORIES;

  return (
    <div className="flex flex-col gap-4">
      <div className="brutal-card bg-brutal-red p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl flex items-center gap-2">
              <Youtube className="w-7 h-7" /> Video News
            </h2>
            <p className="text-sm font-mono text-brutal-white">
              {filteredVideos.length} videos from major news channels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border-3 border-brutal-black">
              <button
                onClick={() => setDisplayMode('grid')}
                className={`px-3 py-1.5 text-sm font-bold uppercase ${displayMode === 'grid' ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`px-3 py-1.5 text-sm font-bold uppercase border-l-3 border-brutal-black ${displayMode === 'list' ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
              >
                List
              </button>
            </div>
            <button
              onClick={loadVideos}
              disabled={loading}
              className="brutal-btn bg-brutal-white text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase flex items-center gap-1 text-brutal-white">
            <Filter className="w-3 h-3" /> Bias:
          </span>
          <button
            onClick={() => setBiasFilter('all')}
            className={`brutal-tag ${biasFilter === 'all' ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
          >
            All
          </button>
          {BIAS_ORDER.map((bias) => (
            <button
              key={bias}
              onClick={() => setBiasFilter(bias)}
              className={`brutal-tag ${BIAS_COLORS[bias]} ${biasFilter === bias ? 'ring-2 ring-brutal-black ring-offset-1' : ''}`}
            >
              {BIAS_LABELS[bias]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onCategoryChange(null)}
          className={`brutal-tag ${!selectedCategory ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
        >
          All Categories
        </button>
        {VIDEO_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`brutal-tag ${selectedCategory === cat ? `${CATEGORY_COLORS[cat]} ring-2 ring-brutal-black ring-offset-1` : 'bg-brutal-white'}`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brutal-black" />
          <p className="font-mono text-sm">Fetching videos from YouTube channels...</p>
        </div>
      )}

      {error && (
        <div className="brutal-card bg-brutal-red p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-brutal-white" />
          <div>
            <p className="font-bold text-brutal-white">Failed to load videos</p>
            <p className="text-sm text-brutal-white/80 font-mono">{error}</p>
          </div>
          <button onClick={loadVideos} className="brutal-btn bg-brutal-white ml-auto text-sm">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && displayMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} video={video} onPlay={onPlayVideo} showBias={showBias} />
          ))}
        </div>
      )}

      {!loading && !error && displayMode === 'list' && (
        <div className="flex flex-col gap-2">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="brutal-card bg-brutal-white p-3 flex items-center gap-3 cursor-pointer"
              onClick={() => onPlayVideo(video)}
            >
              <div className="relative shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-32 h-20 object-cover border-2 border-brutal-black"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-brutal-black/30 flex items-center justify-center">
                  <Play className="w-6 h-6 text-brutal-white fill-brutal-white" />
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h3 className="font-bold text-sm line-clamp-2">{video.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono">{video.channelName}</span>
                  {showBias && <BiasTag bias={video.channelBias} />}
                  <span className="text-xs font-mono text-brutal-black/50">{formatTimeAgo(video.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredVideos.length === 0 && (
        <div className="brutal-card bg-brutal-white p-8 text-center">
          <p className="font-display text-lg">No videos found</p>
          <p className="text-sm font-mono text-brutal-black/60 mt-1">Try a different category or refresh</p>
        </div>
      )}
    </div>
  );
}
