import { useState } from 'react';
import {
  Search, Loader2, AlertTriangle, ExternalLink, Star,
  MessageCircle, ArrowUp, FileText, Newspaper, Github, BookOpen,
  Bot, Sparkles,
} from 'lucide-react';
import type { AgentResearchResult } from '@/types';
import { agentResearch } from '@/lib/research';
import { formatTimeAgo } from '@/lib/news';
import { formatStars, formatRelativeTime } from '@/lib/github';

export function ResearchView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentResearchResult | null>(null);
  const [sources, setSources] = useState({ reddit: true, arxiv: true, github: true, news: true });
  const [activeTab, setActiveTab] = useState<'all' | 'reddit' | 'arxiv' | 'github' | 'news'>('all');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await agentResearch(query.trim(), sources);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const totalCounts = result
    ? {
        reddit: result.reddit.length,
        arxiv: result.arxiv.length,
        github: result.github.length,
        news: result.news.length,
      }
    : { reddit: 0, arxiv: 0, github: 0, news: 0 };

  return (
    <div className="flex flex-col gap-4">
      <div className="brutal-card bg-brutal-lime p-4 flex flex-col gap-3">
        <div>
          <h2 className="font-display text-2xl flex items-center gap-2">
            <Bot className="w-7 h-7" /> Agent Research
          </h2>
          <p className="text-sm font-mono">Search across Reddit, arXiv, GitHub, and News simultaneously</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-black/60" />
            <input
              type="text"
              placeholder="Research any topic..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="brutal-input w-full pl-9 text-sm"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="brutal-btn bg-brutal-black text-brutal-yellow text-sm flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Research
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase">Sources:</span>
          {([
            { key: 'reddit', label: 'Reddit', icon: MessageCircle },
            { key: 'arxiv', label: 'arXiv', icon: BookOpen },
            { key: 'github', label: 'GitHub', icon: Github },
            { key: 'news', label: 'News', icon: Newspaper },
          ] as const).map((src) => {
            const Icon = src.icon;
            const enabled = sources[src.key];
            return (
              <button
                key={src.key}
                onClick={() => setSources((prev) => ({ ...prev, [src.key]: !prev[src.key] }))}
                className={`brutal-tag flex items-center gap-1 ${enabled ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
              >
                <Icon className="w-3 h-3" />
                {src.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="brutal-card bg-brutal-red p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-brutal-white" />
          <p className="text-sm text-brutal-white font-mono">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-brutal-black" />
          <p className="font-mono text-sm">Agent is researching across all sources...</p>
        </div>
      )}

      {!loading && result && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase">Results:</span>
            {([
              { key: 'all', label: `All (${totalCounts.reddit + totalCounts.arxiv + totalCounts.github + totalCounts.news})`, icon: Sparkles },
              { key: 'reddit', label: `Reddit (${totalCounts.reddit})`, icon: MessageCircle },
              { key: 'arxiv', label: `arXiv (${totalCounts.arxiv})`, icon: BookOpen },
              { key: 'github', label: `GitHub (${totalCounts.github})`, icon: Github },
              { key: 'news', label: `News (${totalCounts.news})`, icon: Newspaper },
            ] as const).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`brutal-tag flex items-center gap-1 ${active ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Reddit Results */}
          {(activeTab === 'all' || activeTab === 'reddit') && result.reddit.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brutal-orange" /> Reddit Discussions
              </h3>
              {result.reddit.map((post, i) => (
                <a
                  key={`reddit-${i}`}
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-card bg-brutal-white p-3 flex items-start gap-3"
                >
                  <div className="flex flex-col items-center shrink-0 bg-brutal-orange border-2 border-brutal-black px-2 py-1">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-xs font-bold">{post.score}</span>
                  </div>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-bold text-sm line-clamp-2">{post.title}</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="brutal-tag bg-brutal-orange text-[10px]">r/{post.subreddit}</span>
                      <span className="text-xs font-mono text-brutal-black/50 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {post.comments} comments
                      </span>
                      <span className="text-xs font-mono text-brutal-black/40">{formatTimeAgo(post.publishedAt)}</span>
                    </div>
                    {post.snippet && <p className="text-xs font-mono text-brutal-black/60 line-clamp-2">{post.snippet}</p>}
                  </div>
                  <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* arXiv Results */}
          {(activeTab === 'all' || activeTab === 'arxiv') && result.arxiv.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brutal-red" /> arXiv Papers
              </h3>
              {result.arxiv.map((paper, i) => (
                <a
                  key={`arxiv-${i}`}
                  href={paper.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-card bg-brutal-white p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brutal-red shrink-0" />
                    <span className="font-bold text-sm line-clamp-2 flex-1">{paper.title}</span>
                    <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                  </div>
                  {paper.authors && <span className="text-xs font-mono text-brutal-black/50">{paper.authors}</span>}
                  {paper.summary && <p className="text-xs font-mono text-brutal-black/60 line-clamp-2">{paper.summary}</p>}
                  <div className="flex items-center gap-2">
                    {paper.categories && <span className="brutal-tag bg-brutal-red text-brutal-white text-[10px]">{paper.categories}</span>}
                    <span className="text-xs font-mono text-brutal-black/40">{formatTimeAgo(paper.publishedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* GitHub Results */}
          {(activeTab === 'all' || activeTab === 'github') && result.github.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Github className="w-5 h-5 text-brutal-black" /> GitHub Repos
              </h3>
              {result.github.map((repo, i) => (
                <a
                  key={`gh-${i}`}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-card bg-brutal-white p-3 flex items-center gap-3"
                >
                  <img src={repo.ownerAvatar} alt={repo.owner} className="w-8 h-8 border-2 border-brutal-black shrink-0" loading="lazy" />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <span className="font-bold text-sm truncate">{repo.fullName}</span>
                    <span className="text-xs font-mono text-brutal-black/60 line-clamp-1">{repo.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-brutal-yellow text-brutal-yellow" />{formatStars(repo.stars)}
                      </span>
                      <span className="brutal-tag bg-brutal-cyan text-[10px]">{repo.language}</span>
                      <span className="text-xs font-mono text-brutal-black/40">Updated {formatRelativeTime(repo.updatedAt)}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* News Results */}
          {(activeTab === 'all' || activeTab === 'news') && result.news.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-brutal-blue" /> News Articles
              </h3>
              {result.news.map((article, i) => (
                <a
                  key={`news-${i}`}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-card bg-brutal-white p-3 flex flex-col gap-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm line-clamp-2 flex-1">{article.title}</span>
                    <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                  </div>
                  {article.snippet && <p className="text-xs font-mono text-brutal-black/60 line-clamp-2">{article.snippet}</p>}
                  <div className="flex items-center gap-2">
                    <span className="brutal-tag bg-brutal-blue text-brutal-white text-[10px]">{article.source}</span>
                    <span className="text-xs font-mono text-brutal-black/40">{formatTimeAgo(article.publishedAt)}</span>
                  </div>
                </a>
              ))}
            </div>
          )}

          {!loading && result && totalCounts.reddit + totalCounts.arxiv + totalCounts.github + totalCounts.news === 0 && (
            <div className="brutal-card bg-brutal-white p-8 text-center">
              <p className="font-display text-lg">No results found</p>
              <p className="text-sm font-mono text-brutal-black/60 mt-1">Try a different search query</p>
            </div>
          )}
        </>
      )}

      {!loading && !result && !error && (
        <div className="brutal-card bg-brutal-white p-12 text-center flex flex-col items-center gap-3">
          <Bot className="w-12 h-12 text-brutal-black/30" />
          <p className="font-display text-lg">Agent Research Ready</p>
          <p className="text-sm font-mono text-brutal-black/60 max-w-md">
            Enter any topic above and the agent will search Reddit, arXiv, GitHub, and news sources
            simultaneously to give you a complete picture.
          </p>
        </div>
      )}
    </div>
  );
}
