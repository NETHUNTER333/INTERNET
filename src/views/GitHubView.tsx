import { useState, useEffect } from 'react';
import { Star, GitBranch, Loader2, AlertTriangle, ExternalLink, Search } from 'lucide-react';
import type { GitHubRepo } from '@/types';
import { searchGitHubRepos, GITHUB_TOPICS, formatStars, formatRelativeTime } from '@/lib/github';

export function GitHubView() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState(GITHUB_TOPICS[0]);
  const [searchInput, setSearchInput] = useState('');

  const loadRepos = async (query: string, sort: 'stars' | 'updated') => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchGitHubRepos(query, sort, 24);
      setRepos(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search GitHub');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos(activeTopic.query, activeTopic.sort);
  }, [activeTopic]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      loadRepos(searchInput.trim(), 'stars');
    }
  };

  const languageDotColors: Record<string, string> = {
    JavaScript: 'bg-amber-400',
    TypeScript: 'bg-blue-500',
    Python: 'bg-cyan-500',
    Go: 'bg-sky-400',
    Rust: 'bg-orange-500',
    Ruby: 'bg-rose-500',
    Java: 'bg-red-500',
    'C++': 'bg-purple-500',
    Unknown: 'bg-slate-400',
  };

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* Header Banner */}
      <div className="brutal-card bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 p-5 flex flex-col gap-4 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-sketch text-2xl uppercase tracking-wider font-black flex items-center gap-2">
              <GitBranch className="w-7 h-7" /> GITHUB REPOSITORIES
            </h2>
            <p className="text-xs font-mono font-bold opacity-80 mt-0.5">
              Discover top open-source repositories across AI, BioTech, Robotics, and Web Infrastructure
            </p>
          </div>

          <span className="brutal-tag bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-mono font-black text-xs">
            {repos.length} REPOSITORIES
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search GitHub repos (e.g. llm, genomics, robotics)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="brutal-input w-full pl-9 text-xs font-bold !bg-white !text-slate-900"
            />
          </div>
          <button
            onClick={handleSearch}
            className="prisma-btn-primary !bg-white !text-slate-900 dark:!bg-slate-900 dark:!text-white font-black uppercase text-xs"
          >
            SEARCH
          </button>
        </div>

        {/* Topic Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {GITHUB_TOPICS.map((topic) => {
            const active = activeTopic.label === topic.label;
            return (
              <button
                key={topic.label}
                onClick={() => {
                  setActiveTopic(topic);
                  setSearchInput('');
                }}
                className={`brutal-tag cursor-pointer text-xs uppercase font-extrabold transition-all ${
                  active
                    ? '!bg-white !text-slate-900 dark:!bg-slate-900 dark:!text-white shadow-[2px_2px_0px_0px_#FFF]'
                    : 'bg-slate-800 text-slate-200 dark:bg-slate-200 dark:text-slate-800 hover:bg-slate-700'
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="brutal-card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-900 dark:text-slate-100" />
          <p className="font-mono text-xs font-bold uppercase">Searching GitHub Repositories...</p>
        </div>
      )}

      {error && (
        <div className="brutal-card p-4 bg-rose-100 border-2 border-rose-900 text-rose-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-mono font-bold">{error}</span>
          </div>
          <button
            onClick={() => loadRepos(activeTopic.query, activeTopic.sort)}
            className="prisma-btn-primary text-xs uppercase font-bold !px-3 !py-1"
          >
            RETRY
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 px-1 uppercase">
            SHOWING {repos.length} REPOSITORIES FOR "{activeTopic.label}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-card bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 border-b-2 border-slate-900/10 dark:border-slate-100/10 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={repo.ownerAvatar}
                        alt={repo.owner}
                        className="w-6 h-6 rounded-md border border-slate-900 dark:border-slate-100 shrink-0"
                        loading="lazy"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 truncate">
                        {repo.fullName}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 shrink-0" />
                  </div>

                  <h3 className="font-extrabold text-base leading-snug text-slate-900 dark:text-slate-100 group-hover:underline">
                    {repo.name}
                  </h3>

                  <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {repo.description || 'Open-source software repository.'}
                  </p>
                </div>

                <div className="pt-2 border-t-2 border-slate-900/10 dark:border-slate-100/10 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span className={`w-2.5 h-2.5 rounded-full ${languageDotColors[repo.language] || 'bg-slate-400'}`} />
                        {repo.language}
                      </span>

                      <span className="flex items-center gap-1 text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                        <Star className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                        {formatStars(repo.stars)}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {formatRelativeTime(repo.updatedAt)}
                    </span>
                  </div>

                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {repo.topics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
