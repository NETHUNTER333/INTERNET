import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Loader2, FileText, AlertTriangle, Flame, Fish, Download, Share2 } from 'lucide-react';
import type { Article, Story } from '@/types';
import { BiasTag } from '@/components/BiasTag';
import { CoverageBar } from '@/components/CoverageBar';
import { CATEGORY_COLORS, CATEGORY_LABELS, BIAS_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';
import { deepReadScrape, deepReadSearch } from '@/lib/firecrawl';
import type { DeepReadProvider } from '@/hooks/useSettings';

interface ArticleViewProps {
  article: Article;
  story?: Story | null;
  onBack: () => void;
  onOpenArticle: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  firecrawlApiKey: string;
  tinyfishApiKey: string;
  activeProvider: DeepReadProvider;
  showBias: boolean;
}

export function ArticleView({
  article,
  story,
  onBack,
  onOpenArticle,
  isBookmarked,
  onToggleBookmark,
  firecrawlApiKey,
  tinyfishApiKey,
  activeProvider,
  showBias,
}: ArticleViewProps) {
  const [deepContent, setDeepContent] = useState<string | null>(null);
  const [loadingDeep, setLoadingDeep] = useState(false);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [relatedResults, setRelatedResults] = useState<{ title: string; url: string; description: string }[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const activeKey = activeProvider === 'tinyfish' ? tinyfishApiKey : firecrawlApiKey;
  const providerName = activeProvider === 'tinyfish' ? 'TinyFish' : 'Firecrawl';

  useEffect(() => {
    setDeepContent(null);
    setDeepError(null);
    setRelatedResults([]);
  }, [article.link]);

  const handleDeepRead = async () => {
    if (!activeKey) {
      setDeepError(`Add your ${providerName} API key in Settings to use deep read.`);
      return;
    }

    setLoadingDeep(true);
    setDeepError(null);
    try {
      const result = await deepReadScrape(activeKey, article.link, activeProvider);
      setDeepContent(result.markdown);
    } catch (err) {
      setDeepError(err instanceof Error ? err.message : 'Failed to scrape article');
    } finally {
      setLoadingDeep(false);
    }
  };

  const handleDownloadPDF = () => {
    const content = `${article.title}\n\nSource: ${article.sourceName}\nDate: ${formatTimeAgo(article.publishedAt)}\nLink: ${article.link}\n\n${article.summary}\n\n${deepContent ? deepContent.slice(0, 5000) : ''}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article.title.slice(0, 60).replace(/[^\w\s-]/g, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url: article.link });
      } catch { /* user cancelled */ }
    } else {
      navigator.clipboard.writeText(article.link);
    }
  };

  const handleFindRelated = async () => {
    if (!activeKey) {
      setDeepError(`Add your ${providerName} API key in Settings to search for related coverage.`);
      return;
    }

    setLoadingRelated(true);
    setDeepError(null);
    try {
      const results = await deepReadSearch(activeKey, article.title, activeProvider);
      setRelatedResults(results.slice(0, 5).map((r) => ({ title: r.title, url: r.url, description: r.description })));
    } catch (err) {
      setDeepError(err instanceof Error ? err.message : 'Failed to search for related coverage');
    } finally {
      setLoadingRelated(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <button onClick={onBack} className="brutal-btn bg-brutal-white w-fit flex items-center gap-2 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`${CATEGORY_COLORS[article.category]} brutal-tag`}>
            {CATEGORY_LABELS[article.category]}
          </span>
          <span className="font-bold text-sm">{article.sourceName}</span>
          {showBias && <BiasTag bias={article.sourceBias} size="md" />}
          <span className="text-xs font-mono text-brutal-black/60 ml-auto">{formatTimeAgo(article.publishedAt)}</span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl leading-tight">{article.title}</h1>

        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt=""
            className="w-full h-64 object-cover border-3 border-brutal-black"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {article.summary && (
          <p className="text-base font-mono leading-relaxed text-brutal-black/80">{article.summary}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn bg-brutal-yellow text-sm flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" /> Read at Source
          </a>
          <button
            onClick={() => onToggleBookmark(article)}
            className="brutal-btn bg-brutal-white text-sm flex items-center gap-2"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleDeepRead}
            disabled={loadingDeep}
            className="brutal-btn bg-brutal-cyan text-sm flex items-center gap-2"
          >
            {loadingDeep ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Deep Read {activeProvider === 'tinyfish' && <Fish className="w-3 h-3" />}
            {activeProvider === 'firecrawl' && <Flame className="w-3 h-3" />}
          </button>
          <button
            onClick={handleFindRelated}
            disabled={loadingRelated}
            className="brutal-btn text-sm flex items-center gap-2"
          >
            {loadingRelated ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
            Find Related
          </button>
          <button
            onClick={handleDownloadPDF}
            className="brutal-btn text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handleShare}
            className="brutal-btn text-sm flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        {deepError && (
          <div className="brutal-card bg-brutal-red p-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brutal-white" />
            <p className="text-sm text-brutal-white font-mono">{deepError}</p>
          </div>
        )}

        {deepContent && (
          <div className="border-3 border-brutal-black bg-brutal-cream p-4 max-h-96 overflow-y-auto">
            <h3 className="font-display text-lg mb-2 border-b-2 border-brutal-black pb-1">Full Article Content</h3>
            <div className="prose-sm font-mono text-sm whitespace-pre-wrap leading-relaxed">
              {deepContent.slice(0, 5000)}
              {deepContent.length > 5000 && (
                <p className="mt-2 text-brutal-black/60 italic">
                  ... ({deepContent.length - 5000} more characters)
                </p>
              )}
            </div>
          </div>
        )}

        {relatedResults.length > 0 && (
          <div className="border-3 border-brutal-black bg-brutal-lime/20 p-4">
            <h3 className="font-display text-lg mb-2 border-b-2 border-brutal-black pb-1">Related Coverage</h3>
            <div className="flex flex-col gap-2">
              {relatedResults.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-brutal-black bg-brutal-white p-2 hover:bg-brutal-yellow/30 transition-all block"
                >
                  <p className="font-bold text-sm">{r.title}</p>
                  {r.description && <p className="text-xs font-mono text-brutal-black/60 mt-1 line-clamp-2">{r.description}</p>}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {story && story.articles.length > 1 && (
        <div className="brutal-card bg-brutal-pink/20 p-4 flex flex-col gap-3">
          <h3 className="font-display text-lg">Coverage from Other Sources</h3>
          {showBias && (
            <div>
              <span className="text-xs font-bold uppercase mb-1 block">Bias Distribution</span>
              <CoverageBar coverage={story.coverage} totalSources={story.totalSources} showLabels />
            </div>
          )}
          <div className="flex flex-col gap-2">
            {story.articles
              .filter((a) => a.id !== article.id)
              .map((a) => (
                <div
                  key={a.id}
                  onClick={() => onOpenArticle(a)}
                  className="border-2 border-brutal-black bg-brutal-white p-3 cursor-pointer hover:bg-brutal-yellow/20 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="text-sm font-bold truncate">{a.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">{a.sourceName}</span>
                      {showBias && <BiasTag bias={a.sourceBias} />}
                      <span className="text-xs font-mono text-brutal-black/50">{formatTimeAgo(a.publishedAt)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                </div>
              ))}
          </div>
        </div>
      )}

      {story && story.isBlindSpot && (
        <div className="brutal-card bg-brutal-red p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-brutal-white" />
          <div>
            <p className="font-bold text-brutal-white">Blind Spot Detected</p>
            <p className="text-sm text-brutal-white/90">
              This story is only covered by {story.blindSpotSide === 'right' ? 'left-leaning' : 'right-leaning'} sources.
              The {story.blindSpotSide === 'right' ? 'right' : 'left'} may be missing this story.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
