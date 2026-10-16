import { Play, Clock, ExternalLink } from 'lucide-react';
import type { NewsVideo } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface VideoCardProps {
  video: NewsVideo;
  onPlay: (video: NewsVideo) => void;
  showBias?: boolean;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  const badgeStyle = CATEGORY_COLORS[video.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300/90 transition-all duration-200 flex flex-col group overflow-hidden">
      <div
        className="relative cursor-pointer h-44 overflow-hidden bg-slate-100 border-b border-slate-100"
        onClick={() => onPlay(video)}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3.5 shadow-lg scale-95 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-rose-600 fill-rose-600 ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
          <span className="text-white text-[10px] font-mono flex items-center gap-1 font-semibold">
            <Clock className="w-3 h-3 text-rose-400" /> Video
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
            {CATEGORY_LABELS[video.category]}
          </span>
        </div>

        <h3
          className="font-display text-sm font-bold leading-snug text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 cursor-pointer"
          onClick={() => onPlay(video)}
        >
          {video.title}
        </h3>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700 truncate">{video.channelName}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-400">{formatTimeAgo(video.publishedAt)}</span>
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-400 hover:text-rose-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
