import type { GitHubRepo } from '@/types';

const GITHUB_API = 'https://api.github.com';

export const GITHUB_TOPICS = [
  { label: 'News Tools', query: 'news-aggregator', sort: 'stars' as const },
  { label: 'Data Journalism', query: 'data-journalism', sort: 'stars' as const },
  { label: 'RSS Libraries', query: 'rss-parser', sort: 'stars' as const },
  { label: 'NLP & Media', query: 'natural-language-processing news', sort: 'stars' as const },
  { label: 'Web Scraping', query: 'web-scraping news', sort: 'stars' as const },
  { label: 'Fact Checking', query: 'fact-checking', sort: 'stars' as const },
  { label: 'Media Tools', query: 'media-tools', sort: 'stars' as const },
  { label: 'Open Source News', query: 'open-source-news', sort: 'updated' as const },
];

interface GitHubSearchResponse {
  total_count: number;
  items: Array<{
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    stargazers_count: number;
    language: string | null;
    topics: string[];
    updated_at: string;
    owner: {
      login: string;
      avatar_url: string;
    };
  }>;
}

export async function searchGitHubRepos(
  query: string,
  sort: 'stars' | 'updated' = 'stars',
  perPage = 20
): Promise<GitHubRepo[]> {
  const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=desc&per_page=${perPage}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit reached. Try again in a few minutes.');
    }
    throw new Error(`GitHub search failed (${response.status})`);
  }

  const data: GitHubSearchResponse = await response.json();

  return data.items.map((item) => ({
    id: item.id,
    name: item.name,
    fullName: item.full_name,
    description: item.description || 'No description available',
    url: item.html_url,
    stars: item.stargazers_count,
    language: item.language || 'Unknown',
    topics: item.topics || [],
    updatedAt: item.updated_at,
    owner: item.owner.login,
    ownerAvatar: item.owner.avatar_url,
  }));
}

export function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
}

export function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.max(0, now - then);

  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
