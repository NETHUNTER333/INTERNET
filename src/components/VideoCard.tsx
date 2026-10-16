import { Play, Clock, ExternalLink } from 'lucide-react';
import type { NewsVideo } from '@/types';
import { BiasTag } from './BiasTag';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';

interface VideoCardProps {
  video: NewsVideo;
  onPlay: (video: NewsVideo) => void;
  showBias: boolean;
}

export function VideoCard({ video, onPlay, showBias }: VideoCardProps) {
  return (
    <div className="brutal-card bg-brutal-white flex flex-col overflow-hidden">
      <div
        className={`relative cursor-pointer border-b-4 border-brutal-black ${CATEGORY_COLORS[video.category]}`}
        onClick={() => onPlay(video)}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-44 object-cover border-2 border-brutal-black"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-brutal-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-brutal-yellow border-3 border-brutal-black p-3 shadow-brutal-sm">
            <Play className="w-8 h-8 text-brutal-black fill-brutal-black" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-brutal-black px-2 py-0.5 border-2 border-brutal-yellow">
          <span className="text-brutal-yellow text-xs font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" /> Video
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${CATEGORY_COLORS[video.category]} brutal-tag`}>
            {CATEGORY_LABELS[video.category]}
          </span>
          {showBias && <BiasTag bias={video.channelBias} />}
        </div>

        <h3
          className="font-display text-sm leading-tight line-clamp-2 cursor-pointer hover:underline"
          onClick={() => onPlay(video)}
        >
          {video.title}
        </h3>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t-2 border-brutal-black/20">
          <span className="text-xs font-bold truncate">{video.channelName}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-brutal-black/60">{formatTimeAgo(video.publishedAt)}</span>
            <a
              href={video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-brutal-black/40 hover:text-brutal-black"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
