import { useState, useEffect, useMemo } from 'react';
import { Loader2, RefreshCw, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import type { Article, Story, Category, BiasRating, Language } from '@/types';
import { fetchFeedsStreamed, groupArticlesIntoStories } from '@/lib/news';
import { StoryCard } from '@/components/StoryCard';
import { ArticleCard } from '@/components/ArticleCard';
import { Dropdown } from '@/components/Dropdown';
import { BIAS_LABELS, BIAS_ORDER, BIAS_COLORS, CATEGORY_LABELS, ALL_LANGUAGES, LANGUAGE_LABELS, LANGUAGE_FLAGS } from '@/data/sources';
import { SUB_CATEGORIES, SUB_CATEGORY_LABELS } from '@/data/subCategories';

interface FeedViewProps {
  selectedCategory: Category | null;
  searchQuery: string;
  onOpenArticle: (article: Article) => void;
  onOpenStory: (story: Story) => void;
  isBookmarked: (link: string) => boolean;
  onToggleBookmark: (article: Article) => void;
  showBias: boolean;
}

type BiasFilter = BiasRating | 'all';
type DisplayMode = 'stories' | 'articles';
type LanguageFilter = Language | 'all';

export function FeedView({
  selectedCategory,
  searchQuery,
  onOpenArticle,
  onOpenStory,
  isBookmarked,
  onToggleBookmark,
  showBias,
}: FeedViewProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [streamProgress, setStreamProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [biasFilter, setBiasFilter] = useState<BiasFilter>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('stories');
  const [showBlindSpotsOnly, setShowBlindSpotsOnly] = useState(false);
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all');

  const availableSubCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return SUB_CATEGORIES[selectedCategory] || [];
  }, [selectedCategory]);

  const languageOptions = [
    { value: 'all', label: 'All Languages' },
    ...ALL_LANGUAGES.map((lang) => ({
      value: lang,
      label: LANGUAGE_LABELS[lang],
      badge: LANGUAGE_FLAGS[lang],
    })),
  ];

  const subCategoryOptions = useMemo(() => [
    { value: 'all', label: 'All Sub-Topics' },
    ...availableSubCategories.map((sub) => ({
      value: sub,
      label: SUB_CATEGORY_LABELS[sub] || sub,
    })),
  ], [availableSubCategories]);

  const loadFeeds = async () => {
    setLoading(true);
    setError(null);
    setArticles([]);
    setStories([]);
    setStreamProgress(0);
    try {
      await fetchFeedsStreamed(
        selectedCategory || undefined,
        languageFilter,
        subCategoryFilter,
        (batchArticles, batchIndex, totalBatches) => {
          setArticles(batchArticles);
          setStories(groupArticlesIntoStories(batchArticles));
          setStreamProgress(Math.round(((batchIndex + 1) / totalBatches) * 100));
          if (batchIndex === 0) setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, [selectedCategory, languageFilter, subCategoryFilter]);

  useEffect(() => {
    setSubCategoryFilter('all');
  }, [selectedCategory]);

  const filteredStories = useMemo(() => {
    let result = stories;

    if (biasFilter !== 'all') {
      result = result.filter((s) => s.coverage[biasFilter] > 0);
    }

    if (showBlindSpotsOnly) {
      result = result.filter((s) => s.isBlindSpot);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.articles.some((a) => a.sourceName.toLowerCase().includes(q))
      );
    }

    return result;
  }, [stories, biasFilter, showBlindSpotsOnly, searchQuery]);

  const filteredArticles = useMemo(() => {
    let result = articles;

    if (biasFilter !== 'all') {
      result = result.filter((a) => a.sourceBias === biasFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.sourceName.toLowerCase().includes(q)
      );
    }

    return result;
  }, [articles, biasFilter, searchQuery]);

  const blindSpotCount = stories.filter((s) => s.isBlindSpot).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="brutal-card bg-gradient-to-r from-prisma-accentLight via-zeno-mint/20 to-zeno-sky/10 p-4 flex flex-col gap-3 border-prisma-border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl">
              {selectedCategory ? CATEGORY_LABELS[selectedCategory] : 'All News'}
            </h2>
            <p className="text-sm font-mono">
              {displayMode === 'stories'
                ? `${filteredStories.length} stories from ${articles.length} articles`
                : `${filteredArticles.length} articles`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border-3 border-brutal-black">
              <button
                onClick={() => setDisplayMode('stories')}
                className={`px-3 py-1.5 text-sm font-bold uppercase ${displayMode === 'stories' ? 'bg-prisma-accent text-white' : 'bg-prisma-surface'}`}
              >
                Stories
              </button>
              <button
                onClick={() => setDisplayMode('articles')}
                className={`px-3 py-1.5 text-sm font-bold uppercase border-l border-prisma-border ${displayMode === 'articles' ? 'bg-prisma-accent text-white' : 'bg-prisma-surface'}`}
              >
                Articles
              </button>
            </div>
            <button
              onClick={loadFeeds}
              disabled={loading}
              className="brutal-btn bg-brutal-white text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Row: Bias + Dropdowns */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase flex items-center gap-1">
              <Filter className="w-3 h-3" /> Bias:
            </span>
            <button
              onClick={() => setBiasFilter('all')}
              className={`brutal-tag ${biasFilter === 'all' ? 'bg-prisma-accent text-white' : 'bg-prisma-surface'}`}
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

        <div className="flex items-center gap-3 flex-wrap">
          <Dropdown
            options={languageOptions}
            value={languageFilter}
            onChange={(v) => setLanguageFilter(v as LanguageFilter)}
            placeholder="All Languages"
            label="Language"
          />
          {availableSubCategories.length > 0 && (
            <Dropdown
              options={subCategoryOptions}
              value={subCategoryFilter}
              onChange={setSubCategoryFilter}
              placeholder="All Sub-Topics"
              label="Sub-Topic"
            />
          )}
        </div>

        {blindSpotCount > 0 && (
          <button
            onClick={() => setShowBlindSpotsOnly(!showBlindSpotsOnly)}
            className={`brutal-tag flex items-center gap-1 w-fit ${
              showBlindSpotsOnly ? 'bg-brutal-red text-brutal-white' : 'bg-brutal-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {showBlindSpotsOnly ? 'Showing' : 'Show'} {blindSpotCount} Blind Spot{blindSpotCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-prisma-accent" />
          <p className="font-mono text-sm text-prisma-textSecondary">Loading stories as they arrive...</p>
          {streamProgress > 0 && (
            <div className="w-48 h-1.5 bg-prisma-surfaceAlt rounded-full overflow-hidden">
              <div className="h-full bg-prisma-accent rounded-full transition-all duration-300" style={{ width: `${streamProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="prisma-card bg-red-50 border-red-200 p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-bold text-red-700">Failed to load news</p>
            <p className="text-sm text-red-600/80 font-mono">{error}</p>
          </div>
          <button onClick={loadFeeds} className="prisma-btn-primary ml-auto text-sm">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && displayMode === 'stories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onOpenArticle={onOpenArticle}
              onOpenStory={onOpenStory}
              isBookmarked={isBookmarked}
              onToggleBookmark={onToggleBookmark}
              showBias={showBias}
            />
          ))}
        </div>
      )}

      {!loading && !error && displayMode === 'articles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onOpen={onOpenArticle}
              isBookmarked={isBookmarked(article.link)}
              onToggleBookmark={onToggleBookmark}
              showBias={showBias}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredStories.length === 0 && displayMode === 'stories' && (
        <div className="prisma-card p-8 text-center">
          <p className="font-display text-lg">No stories found</p>
          <p className="text-sm font-mono text-prisma-textMuted mt-1">Try adjusting your filters or refresh</p>
        </div>
      )}
    </div>
  );
}
