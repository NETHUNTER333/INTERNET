import { useState, useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, FileText, ExternalLink, Search, BookOpen, Quote, Github, ChevronDown, ChevronUp, Users, Download, Star, X, Send, Bot, Wrench, Sparkles } from 'lucide-react';
import { fetchArxivPapers, loadGithubForPaper, ARXIV_CATEGORIES, formatArxivDate } from '@/lib/arxiv';
import type { ArxivPaperRich } from '@/lib/arxiv';
import { formatStars } from '@/lib/github';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolLogs?: string[];
}

export function ArxivView({ onOpenPdfReader }: { onOpenPdfReader: (paper: ArxivPaperRich) => void }) {
  const [papers, setPapers] = useState<ArxivPaperRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ARXIV_CATEGORIES[1]);
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [githubLoading, setGithubLoading] = useState<string | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const loadPapers = async (search?: string, catQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchArxivPapers(search, catQuery);
      setPapers(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPapers('', activeCategory.query);
  }, [activeCategory]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      setActiveSearch(searchInput.trim());
      loadPapers(searchInput.trim());
    }
  };

  const handleToggleExpand = async (paper: ArxivPaperRich) => {
    const id = paper.id;
    if (expandedPaper === id) {
      setExpandedPaper(null);
      return;
    }
    setExpandedPaper(id);

    if (!paper.githubRepos) {
      setGithubLoading(id);
      try {
        const repos = await loadGithubForPaper(paper.title);
        setPapers((prev) =>
          prev.map((p) => p.id === id ? { ...p, githubRepos: repos } : p)
        );
      } catch {
        // silently fail
      } finally {
        setGithubLoading(null);
      }
    }
  };

  const handleAskAlberto = async (paper: ArxivPaperRich, question?: string) => {
    const q = question || `Summarize this paper in plain English: "${paper.title}". Key findings and why it matters.`;
    setChatOpen(true);
    setChatLoading(true);

    const userMsg: ChatMessage = { role: 'user', content: q };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/alberto-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: q }],
          context: {
            currentView: 'arxiv',
            paperTitle: paper.title,
            paperAbstract: paper.summary,
            paperArxivId: paper.arxivId,
          },
        }),
      });

      if (!response.ok) throw new Error(`Chat failed: ${response.status}`);
      const data = await response.json();
      const toolLogs: string[] = data.toolLogs || [];
      const reply = data.response || data.content || 'I could not generate a response.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply, toolLogs: toolLogs.length > 0 ? toolLogs : undefined }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errMsg}. Make sure the Alberto API key is configured.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/alberto-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          context: { currentView: 'arxiv' },
        }),
      });

      if (!response.ok) throw new Error(`Chat failed: ${response.status}`);
      const data = await response.json();
      const toolLogs: string[] = data.toolLogs || [];
      const reply = data.response || data.content || 'I could not process that.';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply, toolLogs: toolLogs.length > 0 ? toolLogs : undefined }]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setChatMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const categoryColors: Record<string, string> = {
    'AI & ML': 'bg-brutal-cyan',
    'Computer Science': 'bg-brutal-blue',
    'Physics': 'bg-brutal-lime',
    'Math': 'bg-brutal-yellow',
    'Biology': 'bg-brutal-orange',
    'Statistics': 'bg-brutal-pink',
    'Economics': 'bg-brutal-red',
    'All': 'bg-brutal-gray',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="brutal-card bg-brutal-cyan p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl flex items-center gap-2">
              <BookOpen className="w-7 h-7" /> Research Papers
            </h2>
            <p className="text-sm font-mono">arXiv papers with citations, authors, linked repos & AI assistant</p>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`brutal-tag ${chatOpen ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'} gap-1`}
          >
            <Bot className="w-3.5 h-3.5" /> Alberto AI
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutal-black/60" />
            <input
              type="text"
              placeholder="Search papers..."
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
          {ARXIV_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(cat);
                setActiveSearch('');
                setSearchInput('');
              }}
              className={`brutal-tag ${
                activeCategory.label === cat.label ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`flex gap-4 ${chatOpen ? 'flex-col lg:flex-row' : ''}`}>
        {/* Main papers grid */}
        <div className={`flex flex-col gap-3 ${chatOpen ? 'flex-1 min-w-0' : 'w-full'}`}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-brutal-black" />
              <p className="font-mono text-sm">Fetching papers from arXiv...</p>
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
                Showing {papers.length} papers {activeSearch && `for "${activeSearch}"`}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {papers.map((paper) => {
                  const isExpanded = expandedPaper === paper.id;
                  return (
                    <div key={paper.id} className="brutal-card bg-brutal-white p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="brutal-tag bg-brutal-cyan text-[10px]">
                            {paper.arxivId}
                          </span>
                          {paper.citationCount !== undefined && paper.citationCount > 0 && (
                            <span className="brutal-tag bg-brutal-yellow text-[10px] gap-0.5">
                              <Quote className="w-2.5 h-2.5" /> {paper.citationCount}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-brutal-black/50 shrink-0">
                          {formatArxivDate(paper.publishedAt)}
                        </span>
                      </div>

                      <h3 className="font-display text-base leading-tight">{paper.title}</h3>

                      {paper.authorList.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Users className="w-3 h-3 text-brutal-black/40" />
                          <span className="text-[10px] font-mono text-brutal-black/60">
                            {paper.authorList.slice(0, 2).join(', ')}
                            {paper.authorList.length > 2 && ` +${paper.authorList.length - 2}`}
                          </span>
                        </div>
                      )}

                      <p className="text-sm font-mono text-brutal-black/70 line-clamp-3 flex-1">
                        {paper.summary || 'No abstract available'}
                      </p>

                      {paper.categoryList.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {paper.categoryList.slice(0, 3).map((cat) => (
                            <span key={cat} className="text-[10px] font-mono bg-brutal-cream border border-brutal-black/30 px-1 py-0.5">
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-brutal-black/20">
                        <div className="flex items-center gap-1.5">
                          {paper.pdfUrl && (
                            <button
                              onClick={() => onOpenPdfReader(paper)}
                              className="brutal-tag bg-emerald-100 text-emerald-700 text-[10px] gap-0.5 hover:bg-emerald-200"
                            >
                              <FileText className="w-2.5 h-2.5" /> Read
                            </button>
                          )}
                          {paper.pdfUrl && (
                            <a
                              href={paper.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="brutal-tag bg-brutal-white text-[10px] gap-0.5"
                            >
                              <Download className="w-2.5 h-2.5" /> PDF
                            </a>
                          )}
                          <button
                            onClick={() => handleAskAlberto(paper)}
                            className="brutal-tag bg-brutal-black text-brutal-yellow text-[10px] gap-0.5"
                          >
                            <Bot className="w-2.5 h-2.5" /> Ask
                          </button>
                        </div>
                        <button
                          onClick={() => handleToggleExpand(paper)}
                          className="flex items-center gap-0.5 text-[10px] font-bold text-brutal-black/60 hover:text-brutal-black"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          Code
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="border-t-2 border-brutal-black/20 pt-2 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5">
                            <Github className="w-3.5 h-3.5 text-brutal-black" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brutal-black/60">GitHub Repos</span>
                          </div>

                          {githubLoading === paper.id && (
                            <div className="flex items-center gap-2 py-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-brutal-black" />
                              <span className="text-[10px] font-mono text-brutal-black/50">Searching GitHub...</span>
                            </div>
                          )}

                          {paper.githubRepos && paper.githubRepos.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              {paper.githubRepos.map((repo) => (
                                <a
                                  key={repo.url}
                                  href={repo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="border-2 border-brutal-black/30 bg-brutal-cream p-2 flex items-center gap-2 hover:border-brutal-black transition-all"
                                >
                                  <img src={repo.ownerAvatar} alt={repo.owner} className="w-6 h-6 border border-brutal-black/30" loading="lazy" />
                                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <span className="font-bold text-[10px] truncate">{repo.fullName}</span>
                                    <span className="text-[9px] font-mono text-brutal-black/50 line-clamp-1">{repo.description}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold flex items-center gap-0.5">
                                        <Star className="w-2 h-2 fill-brutal-yellow text-brutal-yellow" />
                                        {formatStars(repo.stars)}
                                      </span>
                                      <span className="text-[9px] font-mono bg-brutal-white border border-brutal-black/30 px-1">{repo.language}</span>
                                    </div>
                                  </div>
                                  <ExternalLink className="w-2.5 h-2.5 text-brutal-black/40 shrink-0" />
                                </a>
                              ))}
                            </div>
                          )}

                          {paper.githubRepos && paper.githubRepos.length === 0 && githubLoading !== paper.id && (
                            <p className="text-[10px] font-mono text-brutal-black/50">No matching GitHub repos found.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && !error && papers.length === 0 && (
            <div className="brutal-card bg-brutal-white p-8 text-center">
              <p className="font-display text-lg">No papers found</p>
              <p className="text-sm font-mono text-brutal-black/60 mt-1">Try a different search or category</p>
            </div>
          )}
        </div>

        {/* Alberto AI side panel */}
        {chatOpen && (
          <div className="w-full lg:w-96 shrink-0 flex flex-col">
            <div className="brutal-card bg-brutal-white flex flex-col h-[600px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-4">
              <div className="bg-brutal-black p-4 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-brutal-yellow rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brutal-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-brutal-white leading-none flex items-center gap-1">
                      Alberto <Sparkles className="w-3 h-3 text-brutal-yellow" />
                    </h3>
                    <p className="text-[10px] text-brutal-white/50 mt-0.5 font-mono">AI Research Agent · 9 tools</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-brutal-white/60 hover:text-brutal-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-brutal-cream border-b-2 border-brutal-black/20 px-3 py-1.5 flex items-center gap-1 flex-wrap">
                {['arXiv', 'GitHub', 'News', 'URL', 'Reddit'].map((t) => (
                  <span key={t} className="text-[9px] font-mono bg-brutal-white border border-brutal-black/30 px-1.5 py-0.5">
                    {t}
                  </span>
                ))}
              </div>

              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
                    <Bot className="w-10 h-10 text-brutal-black/20" />
                    <p className="text-sm font-bold text-brutal-black">Ask Alberto about any paper</p>
                    <p className="text-xs font-mono text-brutal-black/50 max-w-[240px]">
                      Click "Ask" on any paper, or type a question below.
                    </p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.toolLogs && msg.toolLogs.length > 0 && (
                      <div className="flex flex-col gap-1 max-w-[90%]">
                        {msg.toolLogs.map((log, j) => (
                          <div key={j} className="flex items-center gap-1.5 text-[10px] text-brutal-black/50 bg-brutal-cream border border-brutal-black/20 px-2 py-1 font-mono">
                            <Wrench className="w-3 h-3 text-brutal-black" />
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-brutal-black text-brutal-yellow rounded-br-md'
                          : 'bg-brutal-cream text-brutal-black border-2 border-brutal-black/20 rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-brutal-cream border-2 border-brutal-black/20 rounded-xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-brutal-black" />
                      <span className="text-sm font-mono text-brutal-black/50">Alberto is researching...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-brutal-black/20 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask Alberto anything..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                    disabled={chatLoading}
                    className="brutal-input flex-1 text-sm"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-brutal-black text-brutal-yellow rounded-lg p-2.5 disabled:opacity-40 hover:bg-brutal-black/80 transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
