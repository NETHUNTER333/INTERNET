import { X, ExternalLink, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import type { NewsVideo } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';
import { useEffect } from 'react';

interface VideoPlayerProps {
  video: NewsVideo;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (video: NewsVideo) => void;
  showBias?: boolean;
}

export function VideoPlayer({
  video,
  onClose,
  isBookmarked,
  onToggleBookmark,
}: VideoPlayerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-brutal-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="brutal-card bg-brutal-white max-w-4xl w-full flex flex-col gap-4 p-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${CATEGORY_COLORS[video.category]} brutal-tag`}>
              {CATEGORY_LABELS[video.category]}
            </span>
            <span className="font-bold text-sm">{video.channelName}</span>
          </div>
          <button onClick={onClose} className="brutal-btn bg-brutal-red text-brutal-white !p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative w-full bg-brutal-black border-4 border-brutal-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <h2 className="font-display text-xl leading-tight">{video.title}</h2>

        {video.description && (
          <p className="text-sm font-mono text-brutal-black/70 leading-relaxed">{video.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t-2 border-brutal-black/20">
          <span className="text-xs font-mono text-brutal-black/60 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatTimeAgo(video.publishedAt)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(video)}
              className="brutal-btn bg-brutal-white text-sm flex items-center gap-2"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {isBookmarked ? 'Saved' : 'Save'}
            </button>
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brutal-btn bg-brutal-yellow text-sm flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> YouTube
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
