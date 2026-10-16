import { useState } from 'react';
import {
  Search, Loader2, AlertTriangle, ExternalLink, Star,
  MessageCircle, ArrowUp, FileText, Newspaper, Github, BookOpen,
  Bot, Sparkles, AtSign,
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
  const [sources, setSources] = useState({ reddit: true, arxiv: true, github: true, news: true, twitter: true });
  const [activeTab, setActiveTab] = useState<'all' | 'reddit' | 'arxiv' | 'github' | 'news' | 'twitter'>('all');

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
        reddit: result.reddit?.length || 0,
        arxiv: result.arxiv?.length || 0,
        github: result.github?.length || 0,
        news: result.news?.length || 0,
        twitter: result.twitter?.length || 0,
      }
    : { reddit: 0, arxiv: 0, github: 0, news: 0, twitter: 0 };

  const totalAll = totalCounts.reddit + totalCounts.arxiv + totalCounts.github + totalCounts.news + totalCounts.twitter;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-teal-600" /> Agent Research
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Agent-Reach enabled: Search across X (Twitter), Reddit, arXiv, GitHub, and News feeds
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Research any topic across social & scientific feeds..."
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
            className="prisma-btn-primary flex items-center gap-2 !rounded-xl !px-5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Research</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Feeds:</span>
          {([
            { key: 'twitter', label: 'X (Twitter)', icon: AtSign },
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 ${
                  enabled
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{src.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-xs font-semibold text-rose-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white/60 border border-slate-200/80 rounded-2xl">
          <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          <p className="font-medium text-sm text-slate-600">Agent-Reach is fetching feeds across all platforms...</p>
        </div>
      )}

      {!loading && result && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {([
              { key: 'all', label: `All (${totalAll})`, icon: Sparkles },
              { key: 'twitter', label: `X / Twitter (${totalCounts.twitter})`, icon: AtSign },
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
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-150 ${
                    active
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                      : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* X (Twitter) Results */}
          {(activeTab === 'all' || activeTab === 'twitter') && result.twitter && result.twitter.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <AtSign className="w-5 h-5 text-sky-500" /> X (Twitter) Feeds & Posts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.twitter.map((post, i) => (
                  <a
                    key={`tw-${i}`}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md hover:border-sky-300/80 transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/60">
                        {post.author}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{formatTimeAgo(post.publishedAt)}</span>
                    </div>
                    <p className="font-semibold text-sm text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-3">
                      {post.title}
                    </p>
                    {post.snippet && <p className="text-xs text-slate-500 line-clamp-2">{post.snippet}</p>}
                    <div className="flex items-center gap-1 text-xs text-sky-600 font-semibold mt-auto pt-2 border-t border-slate-100">
                      <span>View post on X</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400 group-hover:text-sky-600" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reddit Results */}
          {(activeTab === 'all' || activeTab === 'reddit') && result.reddit && result.reddit.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-500" /> Reddit Discussions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.reddit.map((post, i) => (
                  <a
                    key={`reddit-${i}`}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-start gap-3 hover:shadow-md hover:border-orange-300/80 transition-all group"
                  >
                    <div className="flex flex-col items-center shrink-0 bg-orange-50 border border-orange-200 rounded-xl px-2 py-1 text-orange-700">
                      <ArrowUp className="w-4 h-4" />
                      <span className="text-xs font-bold">{post.score}</span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">{post.title}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">r/{post.subreddit}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                          <MessageCircle className="w-3 h-3" /> {post.comments} comments
                        </span>
                        <span className="text-xs text-slate-400">{formatTimeAgo(post.publishedAt)}</span>
                      </div>
                      {post.snippet && <p className="text-xs text-slate-500 line-clamp-2 mt-1">{post.snippet}</p>}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-600 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* arXiv Results */}
          {(activeTab === 'all' || activeTab === 'arxiv') && result.arxiv && result.arxiv.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-rose-600" /> arXiv Research Papers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.arxiv.map((paper, i) => (
                  <a
                    key={`arxiv-${i}`}
                    href={paper.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md hover:border-rose-300/80 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 flex-1">{paper.title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
                    </div>
                    {paper.authors && <span className="text-xs font-medium text-slate-500">{paper.authors}</span>}
                    {paper.summary && <p className="text-xs text-slate-500 line-clamp-2">{paper.summary}</p>}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
                      {paper.categories && <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">{paper.categories}</span>}
                      <span className="text-xs text-slate-400 ml-auto">{formatTimeAgo(paper.publishedAt)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* GitHub Results */}
          {(activeTab === 'all' || activeTab === 'github') && result.github && result.github.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Github className="w-5 h-5 text-slate-900" /> GitHub Repos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.github.map((repo, i) => (
                  <a
                    key={`gh-${i}`}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center gap-3 hover:shadow-md hover:border-slate-300 transition-all group"
                  >
                    <img src={repo.ownerAvatar} alt={repo.owner} className="w-9 h-9 rounded-xl border border-slate-200 shrink-0" loading="lazy" />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-teal-600 transition-colors truncate">{repo.fullName}</span>
                      <span className="text-xs text-slate-500 line-clamp-1">{repo.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{formatStars(repo.stars)}
                        </span>
                        <span className="text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{repo.language}</span>
                        <span className="text-xs text-slate-400">Updated {formatRelativeTime(repo.updatedAt)}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* News Results */}
          {(activeTab === 'all' || activeTab === 'news') && result.news && result.news.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600" /> News Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.news.map((article, i) => (
                  <a
                    key={`news-${i}`}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md hover:border-blue-300/80 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">{article.title}</span>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </div>
                    {article.snippet && <p className="text-xs text-slate-500 line-clamp-2">{article.snippet}</p>}
                    <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{article.source}</span>
                      <span className="text-xs text-slate-400 ml-auto">{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && result && totalAll === 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center shadow-sm">
              <p className="font-display text-lg font-bold text-slate-800">No results found</p>
              <p className="text-xs text-slate-500 mt-1">Try a different research query</p>
            </div>
          )}
        </>
      )}

      {!loading && !result && !error && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200/80 rounded-2xl flex items-center justify-center text-teal-600">
            <Bot className="w-8 h-8" />
          </div>
          <p className="font-display text-lg font-bold text-slate-900">Agent-Reach Search Engine</p>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Enter any topic above. The agent will fetch live posts from X (Twitter), Reddit, arXiv, GitHub, and major news sources simultaneously.
          </p>
        </div>
      )}
    </div>
  );
}
