import { useState, useEffect } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Loader2, FileText, Flame, Fish, Download, Share2 } from 'lucide-react';
import type { Article, Story } from '@/types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/data/sources';
import { formatTimeAgo } from '@/lib/news';
import { deepReadScrape, deepReadSearch } from '@/lib/firecrawl';
import type { DeepReadProvider } from '@/hooks/useSettings';

interface ArticleViewProps {
  article: Article;
  story: Story | null;
  onBack: () => void;
  onOpenArticle: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
  firecrawlApiKey: string;
  tinyfishApiKey: string;
  activeProvider: DeepReadProvider;
  showBias?: boolean;
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
}: ArticleViewProps) {
  const [deepContent, setDeepContent] = useState<string | null>(null);
  const [loadingDeep, setLoadingDeep] = useState(false);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [relatedResults, setRelatedResults] = useState<{ title: string; url: string; description: string }[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    setDeepContent(null);
    setDeepError(null);
    setRelatedResults([]);
  }, [article.id]);

  const activeKey = activeProvider === 'tinyfish' ? tinyfishApiKey : firecrawlApiKey;
  const providerName = activeProvider === 'tinyfish' ? 'TinyFish' : 'Firecrawl';

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

        <div className="flex items-center gap-2 flex-wrap pt-2 border-t-2 border-brutal-black/20">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="brutal-btn bg-brutal-yellow flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" /> Read on {article.sourceName}
          </a>

          <button
            onClick={() => onToggleBookmark(article)}
            className="brutal-btn bg-brutal-white flex items-center gap-2 text-sm"
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-brutal-black fill-brutal-black" /> Saved
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" /> Save
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            className="brutal-btn bg-brutal-white flex items-center gap-2 text-sm"
            title="Download article text"
          >
            <Download className="w-4 h-4" /> Export
          </button>

          <button
            onClick={handleShare}
            className="brutal-btn bg-brutal-white flex items-center gap-2 text-sm"
            title="Share article link"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>

          <button
            onClick={handleDeepRead}
            disabled={loadingDeep}
            className={`brutal-btn flex items-center gap-2 text-sm ml-auto ${activeProvider === 'tinyfish' ? 'bg-brutal-lime' : 'bg-brutal-orange text-brutal-white'}`}
          >
            {loadingDeep ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : activeProvider === 'tinyfish' ? (
              <Fish className="w-4 h-4" />
            ) : (
              <Flame className="w-4 h-4" />
            )}
            Deep Read ({providerName})
          </button>

          <button
            onClick={handleFindRelated}
            disabled={loadingRelated}
            className="brutal-btn bg-brutal-blue text-brutal-white flex items-center gap-2 text-sm"
          >
            {loadingRelated ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Find Related
          </button>
        </div>

        {deepError && (
          <div className="brutal-card bg-brutal-red p-3 flex items-center gap-2">
            <p className="text-sm text-brutal-white font-mono">{deepError}</p>
          </div>
        )}

        {deepContent ? (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2 border-brutal-black/20">
            <span className="text-xs font-bold uppercase text-brutal-blue">
              Full Article Content ({providerName})
            </span>
            <div className="prose max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap bg-brutal-yellow/10 p-4 border-2 border-brutal-black">
              {deepContent}
            </div>
          </div>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold uppercase text-brutal-black/60">Summary</span>
              <p className="font-mono text-base leading-relaxed text-brutal-black/90">
                {article.summary}
              </p>
            </div>
          )
        )}

        {relatedResults.length > 0 && (
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2 border-brutal-black/20">
            <span className="text-xs font-bold uppercase text-brutal-blue">
              Related Coverage Found via {providerName}
            </span>
            <div className="flex flex-col gap-2">
              {relatedResults.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-2 border-brutal-black bg-brutal-yellow/10 p-3 hover:bg-brutal-yellow/30 transition-all flex flex-col gap-1"
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
                      <span className="text-xs font-mono text-brutal-black/50">{formatTimeAgo(a.publishedAt)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
