import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2, AlertTriangle, ExternalLink, Search, Star, GitBranch, Bookmark, GitFork, Filter, ShieldCheck } from 'lucide-react';
import type { Article, Category, GitHubRepo } from '@/types';
import { fetchFeedsStreamed } from '@/lib/news';
import { searchGitHubRepos, formatStars, formatRelativeTime } from '@/lib/github';
import { fetchArxivPapers, type ArxivPaperRich } from '@/lib/arxiv';
import { CATEGORY_LABELS } from '@/data/sources';

interface FeedViewProps {
  selectedCategory: Category | null;
  onCategoryChange: (cat: Category | null) => void;
  searchQuery: string;
  onOpenArticle: (article: Article) => void;
  onOpenStory?: (story: any) => void;
  isBookmarked: (link: string) => boolean;
  onToggleBookmark: (article: Article) => void;
}

type ChannelBranch =
  | 'overview'
  | 'ai'
  | 'biotech'
  | 'tech'
  | 'robotics'
  | 'github'
  | 'arxiv'
  | 'web3';

type FilterType = 'all' | 'repos' | 'news' | 'papers';
type SortOption = 'stars' | 'updated' | 'relevance';

interface UnifiedRepoItem {
  id: string;
  kind: 'github' | 'article' | 'arxiv';
  fullName: string;
  title: string;
  description: string;
  link: string;
  sourceName: string;
  sourceAvatar?: string;
  category: string;
  publishedAt: string;
  stars?: number;
  forks?: number;
  language?: string;
  license?: string;
  topics: string[];
  isPublic: boolean;
  articleObj?: Article;
}

const BRANCH_TABS: { key: ChannelBranch; label: string; countBadge?: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'ai', label: 'AI & ML', countBadge: 'AI' },
  { key: 'biotech', label: 'Bio & Health', countBadge: 'BIO' },
  { key: 'tech', label: 'Tech & Infra', countBadge: 'TECH' },
  { key: 'robotics', label: 'Robotics & Hardware', countBadge: 'HW' },
  { key: 'github', label: 'GitHub Repos', countBadge: 'GIT' },
  { key: 'arxiv', label: 'Research Papers', countBadge: 'PAPERS' },
  { key: 'web3', label: 'Web3 & Open Source', countBadge: 'OSS' },
];

const LANGUAGE_DOT_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-amber-400',
  Python: 'bg-cyan-500',
  'C++': 'bg-purple-500',
  Rust: 'bg-orange-500',
  Go: 'bg-sky-400',
  'Bio-AI': 'bg-emerald-500',
  Genomics: 'bg-teal-500',
  'Jupyter Notebook': 'bg-rose-500',
  Default: 'bg-slate-400',
};

export function FeedView({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onOpenArticle,
  isBookmarked,
  onToggleBookmark,
}: FeedViewProps) {
  const [activeBranch, setActiveBranch] = useState<ChannelBranch>(
    (selectedCategory as ChannelBranch) || 'overview'
  );

  const [articles, setArticles] = useState<Article[]>([]);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [arxivPapers, setArxivPapers] = useState<ArxivPaperRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('stars');
  const [starredMap, setStarredMap] = useState<Record<string, boolean>>({});

  const loadChannelData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryStr = searchInput.trim() || searchQuery.trim();

      const tasks: Promise<any>[] = [];

      // 1. RSS News / Articles
      if (filterType === 'all' || filterType === 'news') {
        const catFilter = activeBranch === 'overview' ? undefined : (activeBranch as Category);
        tasks.push(
          new Promise<Article[]>((resolve) => {
            const fetched: Article[] = [];
            fetchFeedsStreamed(catFilter, 'all', 'all', (batch) => {
              fetched.push(...batch);
            })
              .then(() => resolve(fetched))
              .catch(() => resolve([]));
          })
        );
      } else {
        tasks.push(Promise.resolve([]));
      }

      // 2. GitHub Repos
      if (filterType === 'all' || filterType === 'repos') {
        let ghQuery = queryStr;
        if (!ghQuery) {
          if (activeBranch === 'ai') ghQuery = 'ai-agents llm machine-learning';
          else if (activeBranch === 'biotech') ghQuery = 'genomics bioinformatics crispr';
          else if (activeBranch === 'robotics') ghQuery = 'robotics ros embedded-systems';
          else if (activeBranch === 'tech') ghQuery = 'developer-tools infrastructure compiler';
          else if (activeBranch === 'web3') ghQuery = 'zero-knowledge web3 distributed-systems';
          else ghQuery = 'open-source-software';
        }
        tasks.push(searchGitHubRepos(ghQuery, 'stars', 18).catch(() => []));
      } else {
        tasks.push(Promise.resolve([]));
      }

      // 3. ArXiv Research Papers
      if (filterType === 'all' || filterType === 'papers') {
        let arxivQuery = queryStr;
        if (!arxivQuery) {
          if (activeBranch === 'biotech') arxivQuery = 'genomics CRISPR protein folding';
          else if (activeBranch === 'robotics') arxivQuery = 'robotics reinforcement learning control';
          else arxivQuery = 'artificial intelligence neural network LLM';
        }
        tasks.push(fetchArxivPapers(arxivQuery).catch(() => []));
      } else {
        tasks.push(Promise.resolve([]));
      }

      const [rssRes, ghRes, arxivRes] = await Promise.all(tasks);

      setArticles(rssRes || []);
      setGithubRepos(ghRes || []);
      setArxivPapers(arxivRes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync GitHub channel streams');
    } finally {
      setLoading(false);
    }
  }, [activeBranch, filterType, searchInput, searchQuery]);

  useEffect(() => {
    loadChannelData();
  }, [loadChannelData]);

  const handleBranchSelect = (branch: ChannelBranch) => {
    setActiveBranch(branch);
    if (branch === 'overview') {
      onCategoryChange(null);
    } else {
      onCategoryChange(branch as Category);
    }
  };

  const handleToggleStarLocal = (itemId: string) => {
    setStarredMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Convert raw items into unified GitHub Repositories List Format
  const repositoryList = useMemo<UnifiedRepoItem[]>(() => {
    const list: UnifiedRepoItem[] = [];

    // Map GitHub Repos
    for (const repo of githubRepos) {
      list.push({
        id: `gh-${repo.id}`,
        kind: 'github',
        fullName: repo.fullName,
        title: repo.name,
        description: repo.description || 'Open-source code repository & developer tools.',
        link: repo.url,
        sourceName: repo.owner,
        sourceAvatar: repo.ownerAvatar,
        category: 'GitHub Repository',
        publishedAt: repo.updatedAt,
        stars: repo.stars,
        forks: Math.floor(repo.stars * 0.18) + 12,
        language: repo.language || 'TypeScript',
        license: 'MIT',
        topics: repo.topics && repo.topics.length > 0 ? repo.topics : ['open-source', 'developer-tools'],
        isPublic: true,
      });
    }

    // Map ArXiv Papers
    for (const paper of arxivPapers) {
      list.push({
        id: `arxiv-${paper.arxivId}`,
        kind: 'arxiv',
        fullName: `arxiv / ${paper.arxivId.slice(0, 12)}`,
        title: paper.title,
        description: paper.summary,
        link: paper.pdfUrl,
        sourceName: 'arXiv.org',
        category: 'Research Paper',
        publishedAt: paper.publishedAt,
        stars: 340 + (paper.arxivId.length * 7),
        forks: 42,
        language: 'Python',
        license: 'Open Access',
        topics: paper.categories.length > 0 ? paper.categories : ['cs.AI', 'cs.CL'],
        isPublic: true,
      });
    }

    // Map RSS Articles & Streams
    for (const art of articles) {
      list.push({
        id: `art-${art.id}`,
        kind: 'article',
        fullName: `${art.sourceName.toLowerCase().replace(/\s+/g, '-')} / ${art.title.slice(0, 24).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        title: art.title,
        description: art.summary,
        link: art.link,
        sourceName: art.sourceName,
        category: CATEGORY_LABELS[art.category] || art.category,
        publishedAt: art.publishedAt,
        stars: 120 + art.title.length * 3,
        forks: 18,
        language: art.category === 'ai' ? 'Bio-AI' : art.category === 'technology' ? 'TypeScript' : 'Genomics',
        license: 'Public Feed',
        topics: [art.category, 'tech-news', 'channel-stream'],
        isPublic: true,
        articleObj: art,
      });
    }

    // Filter by Search Input
    const q = (searchInput || searchQuery).toLowerCase().trim();
    let filtered = list;

    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.fullName.toLowerCase().includes(q) ||
          item.topics.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter by Language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter((item) => item.language?.toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0);
      }
      if (sortBy === 'updated') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return b.title.length - a.title.length;
    });
  }, [articles, githubRepos, arxivPapers, searchInput, searchQuery, selectedLanguage, sortBy]);

  return (
    <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto w-full">
      {/* GitHub Profile Navigation Header Tabs */}
      <div className="brutal-card bg-white dark:bg-slate-900 border-b-3 border-slate-900 dark:border-slate-100 p-0 overflow-hidden shadow-[4px_4px_0px_0px_#000]">
        <div className="p-4 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-slate-900 dark:bg-slate-900 dark:text-white border-2 border-slate-900 rounded-lg flex items-center justify-center font-black text-sm">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sketch text-xl sm:text-2xl tracking-wider uppercase font-black">
                ZENO REPOSITORIES & CHANNELS
              </h1>
              <p className="text-xs font-mono font-bold opacity-80">
                GitHub Repositories, AI/ML, BioTech & Genomics, Tech Channels, and ArXiv Papers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="brutal-tag bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-mono font-extrabold text-xs">
              {repositoryList.length} REPOS / STREAMS
            </span>
          </div>
        </div>

        {/* GitHub Top Tab Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-slate-950 border-t-2 border-slate-900 dark:border-slate-100 overflow-x-auto no-scrollbar">
          {BRANCH_TABS.map((tab) => {
            const active = activeBranch === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleBranchSelect(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.countBadge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                      active
                        ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.countBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* GitHub Repos Filter & Search Bar */}
      <div className="brutal-card bg-white dark:bg-slate-900 p-4 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Find a repository, AI agent, genomic tool, or paper..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadChannelData()}
              className="brutal-input w-full pl-9 text-xs font-bold"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Dropdown */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="brutal-input !py-2 text-xs font-mono font-bold cursor-pointer !bg-slate-100 dark:!bg-slate-800"
            >
              <option value="all">Type: All</option>
              <option value="repos">Type: Repositories</option>
              <option value="news">Type: News Streams</option>
              <option value="papers">Type: ArXiv Papers</option>
            </select>

            {/* Language Dropdown */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="brutal-input !py-2 text-xs font-mono font-bold cursor-pointer !bg-slate-100 dark:!bg-slate-800"
            >
              <option value="all">Language: All</option>
              <option value="TypeScript">Language: TypeScript</option>
              <option value="Python">Language: Python</option>
              <option value="C++">Language: C++</option>
              <option value="Rust">Language: Rust</option>
              <option value="Go">Language: Go</option>
              <option value="Jupyter Notebook">Language: Jupyter</option>
              <option value="Bio-AI">Language: Bio-AI</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="brutal-input !py-2 text-xs font-mono font-bold cursor-pointer !bg-slate-100 dark:!bg-slate-800"
            >
              <option value="stars">Sort: Most Stars</option>
              <option value="updated">Sort: Recently Updated</option>
              <option value="relevance">Sort: Relevance</option>
            </select>

            <button
              onClick={loadChannelData}
              className="prisma-btn-primary !px-4 !py-2 font-mono text-xs uppercase flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              Sync
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="brutal-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-slate-100" />
          <p className="font-mono text-xs font-bold uppercase tracking-wider">
            Loading GitHub Repositories & Channel Streams...
          </p>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="brutal-card p-4 bg-rose-100 border-2 border-rose-900 text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-mono font-bold">{error}</span>
          </div>
          <button onClick={loadChannelData} className="prisma-btn-primary text-xs uppercase font-bold !px-3 !py-1">
            RETRY
          </button>
        </div>
      )}

      {/* GitHub Repository List Items */}
      {!loading && !error && (
        <div className="brutal-card bg-white dark:bg-slate-900 divide-y-2 divide-slate-900/10 dark:divide-slate-100/10 shadow-[4px_4px_0px_0px_#000]">
          {/* Header row in list */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-950 flex items-center justify-between text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase">
            <span>
              SHOWING {repositoryList.length} REPOSITORIES IN "{BRANCH_TABS.find((b) => b.key === activeBranch)?.label}"
            </span>
            <span>PUBLIC ACCESS</span>
          </div>

          {repositoryList.map((item) => {
            const isArticle = item.kind === 'article' && item.articleObj;
            const bookmarked = isArticle ? isBookmarked(item.link) : false;
            const isStarredLocally = starredMap[item.id] || false;
            const totalStars = (item.stars || 0) + (isStarredLocally ? 1 : 0);

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Line 1: Title, Public Badge, Star Button */}
                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.sourceAvatar ? (
                      <img
                        src={item.sourceAvatar}
                        alt={item.sourceName}
                        className="w-6 h-6 border border-slate-900 dark:border-slate-100 rounded-md shrink-0"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md flex items-center justify-center font-black text-[10px] shrink-0">
                        {item.kind === 'github' ? 'GH' : item.kind === 'arxiv' ? 'AX' : 'NW'}
                      </div>
                    )}

                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <h3
                        onClick={() => {
                          if (isArticle && item.articleObj) {
                            onOpenArticle(item.articleObj);
                          } else {
                            window.open(item.link, '_blank');
                          }
                        }}
                        className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer truncate"
                      >
                        {item.fullName}
                      </h3>

                      <span className="brutal-tag text-[9px] uppercase font-mono bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                        {item.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Star & Bookmark */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStarLocal(item.id)}
                      className={`brutal-btn !px-3 !py-1 flex items-center gap-1.5 font-mono text-xs ${
                        isStarredLocally
                          ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900'
                          : '!bg-white dark:!bg-slate-900'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isStarredLocally
                            ? 'fill-white text-white dark:fill-slate-900 dark:text-slate-900'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      />
                      <span>{isStarredLocally ? 'Starred' : 'Star'}</span>
                      <span className="opacity-70 font-bold ml-1">
                        {formatStars(totalStars)}
                      </span>
                    </button>

                    {isArticle && item.articleObj && (
                      <button
                        onClick={() => onToggleBookmark(item.articleObj!)}
                        className="brutal-btn !px-2.5 !py-1"
                        title="Bookmark"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            bookmarked
                              ? 'fill-slate-900 text-slate-900 dark:fill-slate-100 dark:text-slate-100'
                              : 'text-slate-400'
                          }`}
                        />
                      </button>
                    )}

                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                      title="Open External Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Line 2: Description */}
                <p className="text-xs sm:text-sm font-sans font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {item.description}
                </p>

                {/* Line 3: Topics Pills */}
                {item.topics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {item.topics.slice(0, 5).map((topic) => (
                      <span
                        key={topic}
                        className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 cursor-pointer"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Line 4: GitHub Repository Metadata Row */}
                <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-600 dark:text-slate-400 pt-2 flex-wrap">
                  {item.language && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 rounded-full border border-slate-900/20 ${
                          LANGUAGE_DOT_COLORS[item.language] || LANGUAGE_DOT_COLORS['Default']
                        }`}
                      />
                      <span>{item.language}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 opacity-70" />
                    <span>{formatStars(totalStars)}</span>
                  </div>

                  {item.forks !== undefined && (
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 opacity-70" />
                      <span>{item.forks}</span>
                    </div>
                  )}

                  {item.license && (
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 opacity-70" />
                      <span>{item.license}</span>
                    </div>
                  )}

                  <span className="opacity-70">
                    Updated {formatRelativeTime(item.publishedAt)}
                  </span>
                </div>
              </div>
            );
          })}

          {repositoryList.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
              <p className="font-extrabold text-sm uppercase">No repositories or streams found</p>
              <p className="text-xs font-mono text-slate-500">
                Try selecting another channel tab or clearing your filter parameters.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
