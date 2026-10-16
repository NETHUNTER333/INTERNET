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

  const languageColors: Record<string, string> = {
    JavaScript: 'bg-brutal-yellow',
    TypeScript: 'bg-brutal-blue',
    Python: 'bg-brutal-lime',
    Go: 'bg-brutal-cyan',
    Rust: 'bg-brutal-orange',
    Ruby: 'bg-brutal-red',
    Java: 'bg-brutal-pink',
    Unknown: 'bg-brutal-gray',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="brutal-card bg-brutal-cyan p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl flex items-center gap-2">
              <GitBranch className="w-7 h-7" /> GitHub Repos
            </h2>
            <p className="text-sm font-mono">Discover open-source news, journalism, and media tools</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-black/60" />
            <input
              type="text"
              placeholder="Search repos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="brutal-input w-full pl-9 text-sm"
            />
          </div>
          <button onClick={handleSearch} className="brutal-btn bg-brutal-black text-brutal-yellow text-sm">
            Search
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {GITHUB_TOPICS.map((topic) => (
            <button
              key={topic.label}
              onClick={() => {
                setActiveTopic(topic);
                setSearchInput('');
              }}
              className={`brutal-tag ${
                activeTopic.label === topic.label ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'
              }`}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-brutal-black" />
          <p className="font-mono text-sm">Searching GitHub...</p>
        </div>
      )}

      {error && (
        <div className="brutal-card bg-brutal-red p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-brutal-white" />
          <p className="text-sm text-brutal-white font-mono">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="text-sm font-mono text-brutal-black/60 px-1">
            Showing {repos.length} repos for "{activeTopic.label}"
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="brutal-card bg-brutal-white p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={repo.ownerAvatar}
                      alt={repo.owner}
                      className="w-8 h-8 border-2 border-brutal-black"
                      loading="lazy"
                    />
                    <span className="text-xs font-mono text-brutal-black/60 truncate">{repo.fullName}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-brutal-black/40 shrink-0" />
                </div>

                <h3 className="font-display text-base leading-tight">{repo.name}</h3>

                <p className="text-sm font-mono text-brutal-black/70 line-clamp-3 flex-1">
                  {repo.description}
                </p>

                <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-brutal-black/20">
                  <div className="flex items-center gap-2">
                    <span className={`brutal-tag ${languageColors[repo.language] || 'bg-brutal-gray'}`}>
                      {repo.language}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold">
                      <Star className="w-3 h-3 fill-brutal-yellow text-brutal-yellow" />
                      {formatStars(repo.stars)}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-brutal-black/50">
                    {formatRelativeTime(repo.updatedAt)}
                  </span>
                </div>

                {repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {repo.topics.slice(0, 3).map((topic) => (
                      <span key={topic} className="text-[10px] font-mono bg-brutal-cream border border-brutal-black/30 px-1 py-0.5">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
