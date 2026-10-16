export type BiasRating = 'far_left' | 'left' | 'lean_left' | 'center' | 'lean_right' | 'right' | 'far_right';

export type Category = 'politics' | 'technology' | 'world' | 'business' | 'science' | 'health' | 'sports' | 'entertainment' | 'education' | 'environment' | 'culture' | 'opinion' | 'space' | 'ai' | 'crypto' | 'startup' | 'design';

export type Language =
  | 'en' | 'es' | 'fr' | 'de' | 'ar' | 'ja' | 'pt' | 'it' | 'ru' | 'zh' | 'hi' | 'tr'
  | 'te' | 'ta' | 'bn' | 'mr' | 'gu' | 'pa' | 'ur' | 'kn' | 'ml' | 'or'
  | 'vi' | 'ko' | 'id' | 'th' | 'fa' | 'pl' | 'nl' | 'sv' | 'uk' | 'he' | 'sw';

export type SubCategory = string;

export interface NewsSource {
  name: string;
  rssUrl: string;
  category: Category;
  bias: BiasRating;
  ownership?: string;
  country?: string;
  language?: Language;
  subCategory?: SubCategory;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  link: string;
  sourceName: string;
  sourceBias: BiasRating;
  category: Category;
  publishedAt: string;
  thumbnail?: string;
  content?: string;
  language?: Language;
  subCategory?: SubCategory;
}

export interface Story {
  id: string;
  title: string;
  articles: Article[];
  coverage: {
    far_left: number;
    left: number;
    lean_left: number;
    center: number;
    lean_right: number;
    right: number;
    far_right: number;
  };
  totalSources: number;
  isBlindSpot: boolean;
  blindSpotSide?: 'left' | 'right';
  publishedAt: string;
  thumbnail?: string;
  category: Category;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  topics: string[];
  updatedAt: string;
  owner: string;
  ownerAvatar: string;
}

export interface FirecrawlSearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
  markdown?: string;
}

export interface NewsVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelName: string;
  channelBias: BiasRating;
  category: Category;
  watchUrl: string;
}

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string;
  summary: string;
  link: string;
  publishedAt: string;
  categories: string;
}

export interface AgentResearchResult {
  query: string;
  reddit: {
    title: string;
    url: string;
    score: number;
    comments: number;
    subreddit: string;
    publishedAt: string;
    snippet: string;
  }[];
  arxiv: ArxivPaper[];
  github: {
    name: string;
    fullName: string;
    description: string;
    url: string;
    stars: number;
    language: string;
    updatedAt: string;
    owner: string;
    ownerAvatar: string;
  }[];
  news: {
    title: string;
    link: string;
    snippet: string;
    source: string;
    publishedAt: string;
  }[];
}

export interface AthleteSocial {
  name: string;
  sport: string;
  instagram?: string;
  twitter?: string;
  category: Category;
}

export type ViewName = 'feed' | 'article' | 'github' | 'settings' | 'bookmarks' | 'videos' | 'arxiv' | 'research' | 'pdf-reader';
