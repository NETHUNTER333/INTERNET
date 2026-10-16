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

export interface XPost {
  title: string;
  author: string;
  url: string;
  snippet: string;
  publishedAt: string;
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
  twitter?: XPost[];
}

export interface AthleteSocial {
  name: string;
  sport: string;
  instagram?: string;
  twitter?: string;
  category: Category;
}

export type ViewName = 'chat' | 'feed' | 'article' | 'github' | 'settings' | 'bookmarks' | 'videos' | 'arxiv' | 'research' | 'pdf-reader';

// Distill Knowledge System Entities
export type AgentRole = 'alberto' | 'neo' | 'radar' | 'media';
export type EngagementMode = 'invoked' | 'relevant' | 'engaged';

export interface VaultEntry {
  id: string;
  threadId?: string;
  projectId?: string;
  type: 'thought' | 'decision' | 'observation' | 'url' | 'media' | 'action';
  content: string;
  monthKey: string; // e.g. "2026-12"
  createdAt: string;
  updatedAt?: string;
  sourceUrl?: string;
}

export interface SourceRecord {
  id: string;
  url: string;
  title: string;
  type: 'arxiv' | 'github' | 'youtube' | 'news' | 'web';
  retrievedAt: string;
  rawSnippet?: string;
  fullText?: string;
  authorOrChannel?: string;
}

export interface ExtractedClaim {
  id: string;
  sourceId: string;
  verbatimQuote: string;
  claimText: string;
  confidenceScore: number; // 0.0 to 1.0
  createdAt: string;
}

export interface DurableMemory {
  id: string;
  category: 'preference' | 'constraint' | 'decision' | 'fact';
  content: string;
  sourceClaimId?: string;
  status: 'proposed' | 'approved' | 'deprecated';
  createdAt: string;
  userApprovedAt?: string;
}

export interface PlannerActionItem {
  id: string;
  title: string;
  dueAt?: string;
  timezone?: string;
  recurrenceRule?: 'NONE' | 'FREQ=DAILY' | 'FREQ=WEEKLY' | 'FREQ=MONTHLY';
  reminderAt?: string;
  status: 'pending' | 'completed' | 'missed';
  completedAt?: string;
  sourceEntryId?: string;
  sourceThreadId?: string;
  createdAt: string;
}

export interface WeeklyDistill {
  id: string;
  weekLabel: string;
  summary: string;
  keyThemes: string[];
  actionItems: string[];
  sourcesAnalyzed: number;
  createdAt: string;
}

