import type { Article, Story, BiasRating, Category } from '@/types';
import { NEWS_SOURCES, BIAS_ORDER } from '@/data/sources';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

export async function fetchAllFeeds(category?: Category, language?: string, subCategory?: string): Promise<Article[]> {
  let sources = NEWS_SOURCES;
  if (category) {
    sources = sources.filter((s) => s.category === category);
  }
  if (language && language !== 'all') {
    sources = sources.filter((s) => s.language === language);
  }
  if (subCategory && subCategory !== 'all') {
    sources = sources.filter((s) => s.subCategory === subCategory);
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/rss-feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      sources: sources.map((s) => ({
        url: s.rssUrl,
        sourceName: s.name,
        category: s.category,
        bias: s.bias,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feeds: ${response.status}`);
  }

  const data: FeedResponse = await response.json();

  const articles: Article[] = [];
  const seenLinks = new Set<string>();

  for (const feed of data.feeds) {
    for (const item of feed.items) {
      if (!item.link || seenLinks.has(item.link)) continue;
      seenLinks.add(item.link);

      articles.push({
        id: `${feed.sourceName}-${item.link}`.slice(0, 100),
        title: item.title,
        summary: item.summary,
        link: item.link,
        sourceName: feed.sourceName,
        sourceBias: feed.bias as BiasRating,
        category: feed.category as Category,
        publishedAt: item.publishedAt,
        thumbnail: item.thumbnail,
      });
    }
  }

  return articles;
}

const BATCH_SIZE = 8;

export async function fetchFeedsStreamed(
  category: Category | undefined,
  language: string | undefined,
  subCategory: string | undefined,
  onBatch: (articles: Article[], batchIndex: number, totalBatches: number) => void
): Promise<Article[]> {
  let sources = NEWS_SOURCES;
  if (category) {
    sources = sources.filter((s) => s.category === category);
  }
  if (language && language !== 'all') {
    sources = sources.filter((s) => s.language === language);
  }
  if (subCategory && subCategory !== 'all') {
    sources = sources.filter((s) => s.subCategory === subCategory);
  }

  const batches: typeof sources[] = [];
  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    batches.push(sources.slice(i, i + BATCH_SIZE));
  }

  const allArticles: Article[] = [];
  const seenLinks = new Set<string>();

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/rss-feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          sources: batch.map((s) => ({
            url: s.rssUrl,
            sourceName: s.name,
            category: s.category,
            bias: s.bias,
          })),
        }),
      });

      if (response.ok) {
        const data: FeedResponse = await response.json();
        for (const feed of data.feeds) {
          for (const item of feed.items) {
            if (!item.link || seenLinks.has(item.link)) continue;
            seenLinks.add(item.link);

            allArticles.push({
              id: `${feed.sourceName}-${item.link}`.slice(0, 100),
              title: item.title,
              summary: item.summary,
              link: item.link,
              sourceName: feed.sourceName,
              sourceBias: feed.bias as BiasRating,
              category: feed.category as Category,
              publishedAt: item.publishedAt,
              thumbnail: item.thumbnail,
            });
          }
        }
      }
    } catch {
      // skip failed batch
    }

    onBatch([...allArticles], i, batches.length);
  }

  return allArticles;
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(the|a|an|is|are|was|were|in|on|at|to|for|of|with|and|or|not|from|by)\b/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return 1;

  const wordsA = new Set(na.split(' ').filter((w) => w.length > 3));
  const wordsB = new Set(nb.split(' ').filter((w) => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let common = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }

  return common / Math.max(wordsA.size, wordsB.size);
}

export function groupArticlesIntoStories(articles: Article[]): Story[] {
  const stories: Story[] = [];
  const used = new Set<number>();

  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue;

    const group: Article[] = [sorted[i]];
    used.add(i);

    for (let j = i + 1; j < sorted.length; j++) {
      if (used.has(j)) continue;

      const sim = titleSimilarity(sorted[i].title, sorted[j].title);
      if (sim >= 0.5) {
        group.push(sorted[j]);
        used.add(j);
      }
    }

    const coverage = {
      far_left: 0,
      left: 0,
      lean_left: 0,
      center: 0,
      lean_right: 0,
      right: 0,
      far_right: 0,
    };

    const sourceSet = new Set<string>();
    for (const article of group) {
      if (!sourceSet.has(article.sourceName)) {
        sourceSet.add(article.sourceName);
        coverage[article.sourceBias]++;
      }
    }

    const leftCount = coverage.far_left + coverage.left + coverage.lean_left;
    const rightCount = coverage.far_right + coverage.right + coverage.lean_right;

    let isBlindSpot = false;
    let blindSpotSide: 'left' | 'right' | undefined;

    if (leftCount > 0 && rightCount === 0 && group.length >= 2) {
      isBlindSpot = true;
      blindSpotSide = 'right';
    } else if (rightCount > 0 && leftCount === 0 && group.length >= 2) {
      isBlindSpot = true;
      blindSpotSide = 'left';
    }

    const latestDate = group.reduce((latest, a) => {
      const d = new Date(a.publishedAt).getTime();
      return d > latest ? d : latest;
    }, 0);

    stories.push({
      id: `${group[0].id}-story-${stories.length}`,
      title: group[0].title,
      articles: group.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
      coverage,
      totalSources: sourceSet.size,
      isBlindSpot,
      blindSpotSide,
      publishedAt: new Date(latestDate).toISOString(),
      thumbnail: group.find((a) => a.thumbnail)?.thumbnail,
      category: group[0].category,
    });
  }

  return stories.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, now - then);

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export { BIAS_ORDER };
