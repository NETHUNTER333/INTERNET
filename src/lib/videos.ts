import type { NewsVideo, Category } from '@/types';
import { YOUTUBE_SOURCES } from '@/data/videoSources';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FeedResponse {
  feeds: {
    sourceName: string;
    category: string;
    bias: string;
    items: {
      title: string;
      link: string;
      summary: string;
      publishedAt: string;
      thumbnail?: string;
    }[];
  }[];
}

function extractVideoId(url: string): string | null {
  const match = url.match(/watch\?v=([\w-]+)/);
  return match ? match[1] : null;
}

function extractThumbFromDescription(desc: string): string | undefined {
  const imgMatch = desc.match(/<img[^>]*src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : undefined;
}

export async function fetchVideos(category?: Category): Promise<NewsVideo[]> {
  const sources = category
    ? YOUTUBE_SOURCES.filter((s) => s.category === category)
    : YOUTUBE_SOURCES;

  const rssSources = sources.map((s) => ({
    url: `https://www.youtube.com/feeds/videos.xml?channel_id=${s.channelId}`,
    sourceName: s.channelName,
    category: s.category,
    bias: s.bias,
  }));

  const response = await fetch(`${SUPABASE_URL}/functions/v1/rss-feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ sources: rssSources }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video feeds: ${response.status}`);
  }

  const data: FeedResponse = await response.json();

  const videos: NewsVideo[] = [];
  for (const feed of data.feeds) {
    for (const item of feed.items) {
      const videoId = extractVideoId(item.link);
      if (!videoId) continue;

      const thumbnail = item.thumbnail || extractThumbFromDescription(item.summary) || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      videos.push({
        id: `${feed.sourceName}-${videoId}`,
        videoId,
        title: item.title,
        description: item.summary.replace(/<[^>]+>/g, '').slice(0, 200),
        thumbnail,
        publishedAt: item.publishedAt,
        channelName: feed.sourceName,
        channelBias: feed.bias as NewsVideo['channelBias'],
        category: feed.category as Category,
        watchUrl: item.link,
      });
    }
  }

  return videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}
