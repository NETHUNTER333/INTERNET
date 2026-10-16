import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Bot, Wrench, Sparkles, Trash2, Link2, Youtube } from 'lucide-react';
import { useChatHistory } from '@/hooks/useChatHistory';

interface AlbertoChatProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    currentView?: string;
    articleTitle?: string;
    articleSummary?: string;
    articleSource?: string;
    paperTitle?: string;
    paperAbstract?: string;
    paperArxivId?: string;
  };
}

function isUrl(text: string): boolean {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(text);
}

function isYouTubeUrl(text: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)/.test(text);
}

const SYSTEM_PROMPT = `You are Alberto, an elite AI research assistant for Zeno. You have powerful tools: search arXiv papers, search and browse GitHub repos (including reading code), search news, fetch any URL, fetch YouTube videos, search Reddit, and read the user's bookmarks. Always use your tools to gather real data before answering. Be thorough and cite sources. When a user pastes any link, automatically fetch and analyze it.`;

export function AlbertoChat({ isOpen, onClose, context }: AlbertoChatProps) {
  const { messages: historyMessages, saveMessage, clearHistory, loading: historyLoading } = useChatHistory();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historyMessages, loading, activeTools]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setLoading(true);
    setActiveTools([]);

    await saveMessage('user', userText);

    // Build messages from history + current
    const historyMsgs = historyMessages.map((m) => ({ role: m.role, content: m.content }));
    const allMessages = [...historyMsgs, { role: 'user' as const, content: userText }];

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/alberto-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          system: SYSTEM_PROMPT,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status}`);
      }

      const data = await response.json();
      const toolLogs: string[] = data.toolLogs || [];

      if (toolLogs.length > 0) {
        for (const log of toolLogs) {
          setActiveTools((prev) => [...prev, log]);
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      const reply = data.response || data.content || 'Sorry, I could not process that.';
      await saveMessage('assistant', reply, toolLogs.length > 0 ? toolLogs : undefined);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
      await saveMessage('assistant', `Sorry, I encountered an error: ${errorMsg}. Please try again.`);
    } finally {
      setLoading(false);
      setActiveTools([]);
    }
  };

  if (!isOpen) return null;

  const showWelcome = historyMessages.length === 0 && !loading && !historyLoading;

  return (
    <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 z-[60] w-full md:w-[440px] h-full md:h-[680px] md:max-h-[85vh] flex flex-col bg-prisma-surface md:rounded-2xl border border-prisma-border shadow-lg overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-prisma-text via-prisma-text to-prisma-text p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-zeno-coral via-zeno-mint to-zeno-sky rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-white leading-none flex items-center gap-1.5">
              Alberto <Sparkles className="w-3.5 h-3.5 text-zeno-sun" />
            </h3>
            <p className="text-[10px] text-white/50 mt-1">AI Research Agent · 10 tools · Chat History</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {historyMessages.length > 0 && (
            <button
              onClick={() => clearHistory()}
              className="text-white/40 hover:text-white transition-colors p-1"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tool badges */}
      <div className="bg-prisma-surfaceAlt border-b border-prisma-border px-4 py-2 flex items-center gap-1.5 flex-wrap min-h-[36px]">
        <span className="text-[10px] font-medium text-prisma-textMuted uppercase tracking-wider">Tools:</span>
        {['arXiv', 'GitHub', 'News', 'YouTube', 'URL', 'Reddit', 'Bookmarks'].map((t) => (
          <span key={t} className="text-[10px] font-medium bg-prisma-surface border border-prisma-border text-prisma-textSecondary px-1.5 py-0.5 rounded">
            {t}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {showWelcome && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="w-14 h-14 bg-gradient-to-br from-zeno-coral via-zeno-mint to-zeno-sky rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-prisma-text">Hey, I'm Alberto</p>
            <p className="text-xs text-prisma-textMuted max-w-[280px] leading-relaxed">
              I can search arXiv papers, browse GitHub repos and read their code, search news and Reddit, fetch any URL, analyze YouTube videos, and check your bookmarks. Paste a link and I'll analyze it instantly.
            </p>
            <div className="flex flex-col gap-1.5 mt-2 w-full max-w-[280px]">
              <button
                onClick={() => setInput('Summarize the latest AI research papers')}
                className="text-xs text-left bg-prisma-surfaceAlt border border-prisma-border rounded-lg px-3 py-2 hover:border-prisma-accent transition-all text-prisma-textSecondary"
              >
                <Sparkles className="w-3 h-3 inline mr-1.5 text-prisma-accent" /> Summarize latest AI research
              </button>
              <button
                onClick={() => setInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="text-xs text-left bg-prisma-surfaceAlt border border-prisma-border rounded-lg px-3 py-2 hover:border-prisma-accent transition-all text-prisma-textSecondary"
              >
                <Youtube className="w-3 h-3 inline mr-1.5 text-red-500" /> Paste a YouTube link to analyze
              </button>
              <button
                onClick={() => setInput('Find GitHub repos for news aggregation')}
                className="text-xs text-left bg-prisma-surfaceAlt border border-prisma-border rounded-lg px-3 py-2 hover:border-prisma-accent transition-all text-prisma-textSecondary"
              >
                <Link2 className="w-3 h-3 inline mr-1.5 text-prisma-accent" /> Search GitHub for news tools
              </button>
            </div>
          </div>
        )}

        {historyMessages.map((msg, i) => (
          <div key={msg.id || i} className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.tool_logs && msg.tool_logs.length > 0 && (
              <div className="flex flex-col gap-1 max-w-[90%]">
                {msg.tool_logs.map((log, j) => (
                  <div key={j} className="flex items-center gap-1.5 text-[10px] text-prisma-textMuted bg-prisma-surfaceAlt border border-prisma-border rounded-md px-2 py-1">
                    <Wrench className="w-3 h-3 text-prisma-accent" />
                    <span className="font-mono">{log}</span>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-prisma-accent text-white rounded-br-md'
                  : 'bg-prisma-surfaceAlt text-prisma-text border border-prisma-border rounded-bl-md'
              }`}
            >
              {msg.content.split(/(https?:\/\/[^\s]+)/).map((part, k) => {
                if (part.match(/^https?:\/\//)) {
                  return <a key={k} href={part} target="_blank" rel="noopener noreferrer" className="underline hover:text-prisma-accent">{part}</a>;
                }
                return <span key={k}>{part}</span>;
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col gap-2 items-start">
            {activeTools.length > 0 ? (
              activeTools.map((log, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-prisma-textMuted bg-prisma-surfaceAlt border border-prisma-border rounded-md px-2 py-1 animate-fade-in">
                  <Wrench className="w-3 h-3 text-prisma-accent animate-pulse" />
                  <span className="font-mono">{log}</span>
                </div>
              ))
            ) : (
              <div className="bg-prisma-surfaceAlt border border-prisma-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-prisma-accent" />
                <span className="text-sm text-prisma-textMuted">Alberto is thinking...</span>
              </div>
            )}
            {activeTools.length > 0 && (
              <div className="bg-prisma-surfaceAlt border border-prisma-border rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-prisma-accent" />
                <span className="text-sm text-prisma-textMuted">Processing results...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link detection hint */}
      {isUrl(input) && (
        <div className="px-4 py-1.5 bg-zeno-sky/10 border-t border-prisma-border flex items-center gap-1.5">
          {isYouTubeUrl(input) ? (
            <Youtube className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Link2 className="w-3.5 h-3.5 text-prisma-accent" />
          )}
          <span className="text-[11px] text-prisma-textSecondary">
            {isYouTubeUrl(input) ? 'YouTube link detected — Alberto will fetch video details' : 'URL detected — Alberto will fetch and analyze the page'}
          </span>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-prisma-border bg-prisma-surface">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste a link or ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1 rounded-lg border border-prisma-borderStrong bg-prisma-surface px-3.5 py-2.5 text-sm outline-none focus:border-prisma-accent focus:ring-2 focus:ring-prisma-accentLight transition-all placeholder:text-prisma-textMuted"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-prisma-accent text-white rounded-lg p-2.5 disabled:opacity-40 hover:bg-prisma-accentHover transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
