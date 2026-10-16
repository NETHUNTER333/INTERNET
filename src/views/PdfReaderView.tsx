import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FileText, ExternalLink, Download, Bot, Send, Loader2, Wrench, Sparkles, Users, Quote, Github, Star } from 'lucide-react';
import type { ArxivPaperRich } from '@/lib/arxiv';
import { formatArxivDate } from '@/lib/arxiv';
import { formatStars } from '@/lib/github';

interface PdfReaderViewProps {
  paper: ArxivPaperRich;
  onBack: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  toolLogs?: string[];
}

export function PdfReaderView({ paper, onBack }: PdfReaderViewProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `I'm Alberto, your AI research assistant. I can see you're reading "${paper.title}". I can search for related papers, find GitHub implementations, explain methodology, or answer any questions about this paper. I have 9 research tools at my disposal. What would you like to know?`,
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const handleSendChat = async (question?: string) => {
    const q = question || chatInput.trim();
    if (!q || chatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: q };
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
          context: {
            currentView: 'pdf-reader',
            paperTitle: paper.title,
            paperAbstract: paper.summary,
            paperArxivId: paper.arxivId,
          },
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

  const quickQuestions = [
    'Explain this paper in plain English',
    'What are the key findings?',
    'Find related GitHub implementations',
    'Search for similar papers',
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar with back button */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="prisma-btn-ghost flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Papers
        </button>
      </div>

      {/* Paper info header */}
      <div className="prisma-card p-5 flex flex-col gap-3 bg-gradient-to-r from-zeno-sky/10 via-prisma-accentLight to-zeno-mint/10 border-prisma-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="prisma-chip bg-prisma-accentLight text-prisma-accent text-[10px]">
                {paper.arxivId}
              </span>
              <span className="text-xs text-prisma-textMuted">{formatArxivDate(paper.publishedAt)}</span>
              {paper.citationCount !== undefined && paper.citationCount > 0 && (
                <span className="prisma-chip bg-blue-50 text-blue-600 text-[10px] gap-1">
                  <Quote className="w-3 h-3" /> {paper.citationCount} citations
                </span>
              )}
            </div>
            <h1 className="font-display text-xl md:text-2xl leading-tight text-prisma-text">
              {paper.title}
            </h1>
            {paper.authorList.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Users className="w-3.5 h-3.5 text-prisma-textMuted" />
                <span className="text-sm text-prisma-textSecondary">
                  {paper.authorList.join(', ')}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {paper.pdfUrl && (
              <a
                href={paper.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="prisma-chip bg-prisma-surfaceAlt text-prisma-textSecondary text-xs gap-1 hover:bg-prisma-border"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </a>
            )}
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="prisma-chip bg-prisma-surfaceAlt text-prisma-textSecondary text-xs gap-1 hover:bg-prisma-border"
            >
              <ExternalLink className="w-3.5 h-3.5" /> arXiv
            </a>
          </div>
        </div>
      </div>

      {/* Main layout: PDF reader + Alberto side panel */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* PDF Reader */}
        <div className="flex-1 min-w-0">
          <div className="prisma-card overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[500px] sticky top-4">
            <div className="border-b border-prisma-border px-4 py-2.5 flex items-center gap-2 bg-prisma-surfaceAlt">
              <FileText className="w-4 h-4 text-prisma-accent" />
              <span className="text-sm font-medium text-prisma-textSecondary truncate">
                {paper.arxivId}.pdf
              </span>
            </div>
            <div className="flex-1 bg-gray-100">
              {paper.pdfUrl ? (
                <iframe
                  src={paper.pdfUrl}
                  className="w-full h-full border-0"
                  title={`PDF: ${paper.title}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-prisma-textMuted text-sm">
                  No PDF available for this paper
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alberto AI Panel */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col">
          <div className="prisma-card flex flex-col h-[calc(100vh-280px)] min-h-[500px] lg:sticky lg:top-4">
            {/* Header */}
            <div className="bg-prisma-text p-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-zeno-coral to-zeno-mint rounded-xl flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white leading-none flex items-center gap-1">
                    Alberto <Sparkles className="w-3 h-3 text-zeno-sun" />
                  </h3>
                  <p className="text-[10px] text-white/50 mt-1">AI Research Agent · 9 tools</p>
                </div>
              </div>
            </div>

            {/* Tool badges */}
            <div className="bg-prisma-surfaceAlt border-b border-prisma-border px-3 py-1.5 flex items-center gap-1 flex-wrap">
              {['arXiv', 'GitHub', 'News', 'URL', 'Reddit'].map((t) => (
                <span key={t} className="text-[9px] font-medium bg-prisma-surface border border-prisma-border text-prisma-textSecondary px-1.5 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>

            {/* Messages */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.toolLogs && msg.toolLogs.length > 0 && (
                    <div className="flex flex-col gap-1 max-w-[95%]">
                      {msg.toolLogs.map((log, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-[10px] text-prisma-textMuted bg-prisma-surfaceAlt border border-prisma-border rounded-md px-2 py-1">
                          <Wrench className="w-3 h-3 text-prisma-accent" />
                          <span className="font-mono">{log}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className={`max-w-[90%] px-3 py-2 text-[13px] leading-relaxed rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-prisma-accent text-white rounded-br-md'
                        : 'bg-prisma-surfaceAlt text-prisma-text border border-prisma-border rounded-bl-md'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-prisma-surfaceAlt border border-prisma-border rounded-2xl rounded-bl-md px-3 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-prisma-accent" />
                    <span className="text-[13px] text-prisma-textMuted">Alberto is researching...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions */}
            {chatMessages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-prisma-textMuted px-1">Quick Questions</span>
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendChat(q)}
                    disabled={chatLoading}
                    className="text-left text-xs text-prisma-textSecondary bg-prisma-surfaceAlt border border-prisma-border rounded-lg px-3 py-2 hover:border-prisma-accent hover:text-prisma-accent transition-all disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-prisma-border p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Alberto about this paper..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  disabled={chatLoading}
                  className="brutal-input flex-1 text-sm rounded-full"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-prisma-accent text-white rounded-full p-2.5 disabled:opacity-40 hover:bg-prisma-accentHover transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked GitHub repos */}
      {paper.githubRepos && paper.githubRepos.length > 0 && (
        <div className="prisma-card p-4 flex flex-col gap-3">
          <h3 className="font-display text-base flex items-center gap-2">
            <Github className="w-5 h-5 text-prisma-accent" /> Linked GitHub Repos
          </h3>
          <div className="flex flex-col gap-2">
            {paper.githubRepos.map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-prisma-border hover:border-prisma-accent transition-all group"
              >
                <img src={repo.ownerAvatar} alt={repo.owner} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-prisma-text group-hover:text-prisma-accent truncate">
                    {repo.fullName}
                  </p>
                  <p className="text-xs text-prisma-textMuted truncate">{repo.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {formatStars(repo.stars)}
                  </span>
                  <span className="text-[10px] font-mono bg-prisma-surface border border-prisma-border px-1 rounded">{repo.language}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
