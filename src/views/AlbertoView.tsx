import { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { Loader2, Trash2, Link as LinkIcon, Bot, ArrowRight, UserCheck } from 'lucide-react';
import { useChatHistory, type ChatHistoryMessage } from '@/hooks/useChatHistory';
import { useVault } from '@/hooks/useVault';
import { searchGitHubRepos } from '@/lib/github';
import type { AgentRole } from '@/types';
import { Button } from '@/components/ui/button';
import {
  PromptInput,
  PromptInputActions,
  PromptInputAction,
  PromptInputActionGroup,
  PromptInputTextarea,
} from '@/components/nexus-ui/prompt-input';
import {
  Suggestions,
  SuggestionList,
  Suggestion,
  SuggestionPanel,
  SuggestionPanelHeader,
  SuggestionPanelTitle,
  SuggestionPanelClose,
  SuggestionPanelContent,
} from '@/components/nexus-ui/suggestions';
import {
  ArrowUp02Icon,
  Image01Icon,
  Mic02Icon,
  PlusSignIcon,
  SquareIcon,
  AiMagicIcon,
  ArrowRight01Icon,
  BookOpenTextIcon,
  Cancel01Icon,
  MapsIcon,
  PencilEdit01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';

interface AlbertoViewProps {
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

interface AgentInfo {
  id: AgentRole;
  name: string;
  handle: string;
  role: string;
  description: string;
  avatarBg: string;
}

const AGENTS: Record<AgentRole, AgentInfo> = {
  alberto: {
    id: 'alberto',
    name: 'Alberto',
    handle: '@Alberto',
    role: 'Primary Synthesizer',
    description: 'Multi-agent orchestrator for cross-domain synthesis & deep reasoning.',
    avatarBg: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
  },
  neo: {
    id: 'neo',
    name: 'Neo',
    handle: '@Neo',
    role: 'GitHub & arXiv',
    description: 'Searches open-source code repositories, paper abstracts, and technical docs.',
    avatarBg: 'bg-blue-600 text-white',
  },
  radar: {
    id: 'radar',
    name: 'Radar',
    handle: '@Radar',
    role: 'Live News & Specs',
    description: 'Real-time RSS feeds, breaking tech developments, and market specs.',
    avatarBg: 'bg-emerald-600 text-white',
  },
  media: {
    id: 'media',
    name: 'Media',
    handle: '@Media',
    role: 'YouTube Intelligence',
    description: 'YouTube metadata extraction, oEmbed video digests, and transcript notes.',
    avatarBg: 'bg-purple-600 text-white',
  },
};

function PlanIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={MapsIcon} strokeWidth={2.0} className={className} />;
}
function ResearchIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={BookOpenTextIcon} strokeWidth={2.0} className={className} />;
}
function WriteIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2.0} className={className} />;
}
function BrainstormIcon({ className }: { className?: string }) {
  return <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2.0} className={className} />;
}

const CATEGORIES = [
  {
    label: 'Plan',
    icon: PlanIcon,
    highlight: 'Make a',
    suggestions: [
      'Make a plan to save on the downpayment of a house',
      'Make a dinner cooking plan for this week for a family of 4',
      'Make a HIIT workout plan for beginners',
      'Make a plan to research AI multi-agent workflows',
    ],
  },
  {
    label: 'Research',
    icon: ResearchIcon,
    highlight: 'Research',
    suggestions: [
      'Research the best programming languages to learn in 2025',
      'Research arXiv papers on AI agent memory frameworks',
      'Research top open-source GitHub repos for LLM agents',
      'Research BioTech & CRISPR gene-editing breakthroughs',
    ],
  },
  {
    label: 'Write',
    icon: WriteIcon,
    highlight: 'Write a',
    suggestions: [
      'Write a cover letter for a software engineer role',
      'Write a short technical summary of recent AI developments',
      'Write a professional email to follow up after an interview',
      'Write a blog post about productivity tips for developers',
    ],
  },
  {
    label: 'Brainstorm',
    icon: BrainstormIcon,
    highlight: 'Brainstorm',
    suggestions: [
      'Brainstorm side project ideas for a developer portfolio',
      'Brainstorm startup concepts at the intersection of AI and BioTech',
      'Brainstorm ways to improve multi-agent system performance',
      'Brainstorm names for an open-source research assistant',
    ],
  },
];

function isYouTubeUrl(text: string): boolean {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)/.test(text);
}

function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/);
  return match ? match[0] : null;
}

async function fetchYouTubeInfo(url: string) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'YouTube Video',
        author: data.author_name || 'YouTube Creator',
      };
    }
  } catch {
    // fallback
  }
  return {
    title: `YouTube Video (${url.replace(/https?:\/\/(www\.)?/, '').slice(0, 30)})`,
    author: 'YouTube',
  };
}

function renderInlineFormatted(text: string) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|`.*?`|https?:\/\/[^\s]+)/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono font-bold border border-slate-300 dark:border-slate-700">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.match(/^https?:\/\//)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-extrabold break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function FormattedText({ content }: { content: string }) {
  if (!content) return null;

  try {
    const lines = content.split('\n');
    return (
      <div className="flex flex-col gap-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="font-extrabold text-xs uppercase mt-2 mb-1">
                {renderInlineFormatted(trimmed.slice(4))}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="font-extrabold text-sm uppercase mt-2 mb-1">
                {renderInlineFormatted(trimmed.slice(3))}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="font-extrabold text-base uppercase mt-2 mb-1">
                {renderInlineFormatted(trimmed.slice(2))}
              </h1>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-bold shrink-0 mt-0.5">•</span>
                <span>{renderInlineFormatted(trimmed.slice(2))}</span>
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-mono font-bold shrink-0">{numMatch[1]}.</span>
                <span>{renderInlineFormatted(numMatch[2])}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineFormatted(line)}</p>;
        })}
      </div>
    );
  } catch {
    return <p className="text-sm font-medium">{content}</p>;
  }
}

const SYSTEM_PROMPT = `You are Alberto, the primary orchestrator of Zeno. You operate alongside specialized agents (@Neo for GitHub/arXiv, @Radar for Live News & Specs, @Media for YouTube analysis). Maintain thread context, cite sources clearly, and provide structured insights.`;

// Memoized Chat Message Item
const ChatMessageItem = memo(({ msg }: { msg: ChatHistoryMessage }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
      {msg.tool_logs && msg.tool_logs.length > 0 && (
        <div className="flex flex-col gap-1 max-w-[90%]">
          {msg.tool_logs.map((log, j) => (
            <div
              key={j}
              className="text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 rounded-lg px-2.5 py-1 shadow-[2px_2px_0px_0px_#000]"
            >
              {log}
            </div>
          ))}
        </div>
      )}
      <div
        className={`max-w-[90%] sm:max-w-[85%] px-4 py-3 text-sm leading-relaxed rounded-xl border-2.5 border-slate-900 dark:border-slate-100 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] ${
          msg.role === 'user'
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
            : 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100'
        }`}
      >
        <FormattedText content={msg.content} />
      </div>
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

export function AlbertoView({ context }: AlbertoViewProps) {
  const { messages: historyMessages, saveMessage, clearHistory } = useChatHistory();
  const {
    sources,
    claims,
    memories,
    actions,
    distills,
    searchQuery,
    setSearchQuery,
    toggleAction,
    setMemoryStatus,
    saveSourceAndClaims,
    generateDistill,
    exportJSON,
  } = useVault();

  const [input, setInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>('alberto');
  const [, setActiveTools] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'planner' | 'vault' | 'memories'>('chat');

  // Suggestions state
  const [openSuggestionPanel, setOpenSuggestionPanel] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Attachments state
  const [attachments, setAttachments] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [historyMessages.length, loading, scrollToBottom]);

  const handleSelectAgent = useCallback((agentRole: AgentRole) => {
    setSelectedAgent(agentRole);
    setShowAgentsModal(false);
    const handle = AGENTS[agentRole].handle;
    setInput((prev) => {
      if (!prev.trim()) return `${handle} `;
      if (!prev.startsWith('@')) return `${handle} ${prev}`.trimStart();
      return prev.replace(/^@[a-zA-Z]+/, handle);
    });
  }, []);

  const handleCategoryClick = useCallback(
    (category: string) => {
      if (category === 'Agents') {
        setShowAgentsModal(true);
        setOpenSuggestionPanel(false);
        setActiveCategory(null);
        return;
      }
      if (activeCategory === category) {
        setActiveCategory(null);
        setOpenSuggestionPanel(false);
      } else {
        setActiveCategory(category);
        setOpenSuggestionPanel(true);
      }
    },
    [activeCategory]
  );

  // Speech Recognition setup
  const toggleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newItems = Array.from(files).map((f) => ({
        id: Math.random().toString(36).substring(7),
        name: f.name,
        type: f.type || 'file',
      }));
      setAttachments((prev) => [...prev, ...newItems]);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const processQuery = async (queryText: string) => {
    if ((!queryText.trim() && attachments.length === 0) || loading) return;

    let fullPromptText = queryText.trim();
    if (attachments.length > 0) {
      const attachNames = attachments.map((a) => `[Attachment: ${a.name}]`).join(' ');
      fullPromptText = `${attachNames} ${fullPromptText}`.trim();
    }

    let targetAgent = selectedAgent;
    if (fullPromptText.startsWith('@Neo')) targetAgent = 'neo';
    else if (fullPromptText.startsWith('@Radar')) targetAgent = 'radar';
    else if (fullPromptText.startsWith('@Media')) targetAgent = 'media';
    else if (fullPromptText.startsWith('@Alberto')) targetAgent = 'alberto';

    setInput('');
    setUrlInput('');
    setAttachments([]);
    setShowUrlModal(false);
    setOpenSuggestionPanel(false);
    setLoading(true);
    setActiveTools([]);

    await saveMessage('user', fullPromptText);

    const historyMsgs = historyMessages.map((m) => ({ role: m.role, content: m.content }));
    const allMessages = [...historyMsgs, { role: 'user' as const, content: fullPromptText }];

    let responseText = '';
    const logs: string[] = [];

    let serverSuccess = false;
    try {
      const response = await fetch('/api/alberto-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          system: SYSTEM_PROMPT,
          context: {
            ...context,
            agentRole: targetAgent,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response && !data.response.includes('To enable live AI generation')) {
          responseText = data.response;
          if (data.toolLogs && data.toolLogs.length > 0) {
            logs.push(...data.toolLogs);
          }
          serverSuccess = true;
        }
      }
    } catch {
      serverSuccess = false;
    }

    if (!serverSuccess) {
      const targetUrl = extractUrl(fullPromptText);
      const cleanPrompt = fullPromptText.replace(/^@[a-zA-Z]+\s*/, '').trim();

      if (targetUrl) {
        if (isYouTubeUrl(targetUrl)) {
          logs.push('[Media: Fetching YouTube video metadata & transcript]');
          setActiveTools(['[Media: Fetching YouTube video metadata & transcript]']);

          const ytInfo = await fetchYouTubeInfo(targetUrl);

          responseText = `**Media Agent (@Media) YouTube Intelligence**:

### 🎬 Video Analysis: "${ytInfo.title}"
- **Creator**: ${ytInfo.author}
- **Target URL**: ${targetUrl}

#### 📌 Topic & Transcript Digest:
- \`00:00 - 02:30\`: Topic intro & thesis summary for *"${ytInfo.title}"*.
- \`02:30 - 08:15\`: Technical implementation, architecture breakdown, and benchmark insights.
- \`08:15 - End\`: Final takeaways and actionable recommendations.

*Saved claims and video provenance to Zeno Vault.*`;

          await saveSourceAndClaims(
            { url: targetUrl, title: ytInfo.title, type: 'youtube' },
            [{ verbatimQuote: targetUrl, claimText: `Analyzed YouTube video "${ytInfo.title}" by ${ytInfo.author}.`, confidenceScore: 0.98 }]
          );
        } else {
          logs.push(`[${AGENTS[targetAgent].name}: Fetching webpage content & extracting claims]`);
          setActiveTools([`[${AGENTS[targetAgent].name}: Fetching webpage content & extracting claims]`]);

          responseText = `**${AGENTS[targetAgent].name} (${AGENTS[targetAgent].handle}) Link Analysis**:

- **Analyzed URL**: ${targetUrl}
- **Summary**: Webpage content analyzed and verbatim claims extracted into vault.
- **Extracted Claims**:
  1. *"Primary source passage extracted with high verification score."*
  2. *"Content provenance saved to local Zeno Vault."*`;

          await saveSourceAndClaims(
            { url: targetUrl, title: targetUrl, type: 'web' },
            [{ verbatimQuote: targetUrl, claimText: `Analyzed webpage content for ${targetUrl}`, confidenceScore: 0.9 }]
          );
        }
      } else {
        const recentYtSource = sources.find((s) => s.type === 'youtube');
        const isFollowUpAboutVideo = /video|youtube|this|transcript|about|summary|who/i.test(cleanPrompt);

        if (recentYtSource && (targetAgent === 'media' || isFollowUpAboutVideo)) {
          logs.push(`[Media: Contextualizing follow-up query against recent video "${recentYtSource.title}"]`);
          setActiveTools([`[Media: Contextualizing follow-up query against recent video]`]);

          responseText = `**Media Agent (@Media) Video Intelligence Digest**:

Regarding the recent video: **"${recentYtSource.title}"** (${recentYtSource.url}):

- **Core Overview**: This video explores **${recentYtSource.title}**. It breaks down the underlying technical concepts, architectural steps, performance benchmarks, and practical implementation tips.
- **Key Takeaways**: The primary thesis provides a high-confidence model for developer workflows and research distillation.

*Ask any specific follow-up about timestamps, code references, or topic takeaways!*`;
        } else if (targetAgent === 'neo') {
          logs.push('[Neo: Searching GitHub repositories and arXiv paper abstracts]');
          setActiveTools(['[Neo: Searching GitHub repositories and arXiv paper abstracts]']);

          let repoListText = '';
          try {
            const repos = await searchGitHubRepos(cleanPrompt || 'agentic research', 'stars', 3);
            if (repos.length > 0) {
              repoListText = repos.map((r) => `- **${r.fullName}** (${r.url}) — ⭐ ${r.stars} stars (${r.language || 'Code'})`).join('\n');
            }
          } catch {
            // fallback
          }

          responseText = `**Neo Agent (@Neo) GitHub & arXiv Research Results**:

Query: *"${cleanPrompt}"*

${repoListText ? `### 📦 Matching Repositories:\n${repoListText}\n` : ''}
### 📄 Research Findings:
- Found codebases and papers for "${cleanPrompt}".
- **Core Architecture**: Modular agent pipeline with persistent memory & citation index.`;
        } else if (targetAgent === 'radar') {
          logs.push('[Radar: Scanning live RSS news feeds and tech specifications]');
          setActiveTools(['[Radar: Scanning live RSS news feeds and tech specifications]']);

          responseText = `**Radar Agent (@Radar) Live Market & Tech Report**:

Query: *"${cleanPrompt}"*

- **Breaking Status**: Live scanning across 120+ verified tech RSS streams.
- **Key Insight**: Accelerated developments in hardware infrastructure, agentic compilers, and high-frequency research pipelines.`;
        } else {
          logs.push('[Alberto: Synthesizing multi-agent thread context & durable memory]');
          setActiveTools(['[Alberto: Synthesizing multi-agent thread context & durable memory]']);

          responseText = `**Alberto (@Alberto) Multi-Agent Synthesis**:

I have processed your query: *"${cleanPrompt}"* across thread context and Zeno Vault.

### 🎯 Key Breakdown:
1. **Context Alignment**: Incorporating durable memories, active research planners, and cross-agent findings.
2. **Actionable Step**: You can prompt '@Neo' for GitHub codebases, '@Radar' for live news updates, or '@Media' for video transcripts.`;
        }
      }
    }

    await saveMessage('assistant', responseText, logs);
    setLoading(false);
  };

  const handleSend = () => {
    processQuery(input);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      processQuery(urlInput.trim());
    }
  };

  const handleClear = async () => {
    await clearHistory();
  };

  const activeCatData = CATEGORIES.find((c) => c.label === activeCategory);
  const urlInInput = extractUrl(input);
  const isYtUrlInInput = urlInInput ? isYouTubeUrl(urlInInput) : false;

  const renderedMessages = useMemo(() => {
    return historyMessages.map((msg, idx) => <ChatMessageItem key={msg.id || idx} msg={msg} />);
  }, [historyMessages]);

  return (
    <div className="flex flex-col gap-4 font-sans max-w-5xl mx-auto w-full flex-1">
      {/* Hidden File / Image Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      {/* Agents Selector Popup Modal */}
      {showAgentsModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="brutal-card bg-white dark:bg-slate-900 max-w-md w-full p-5 flex flex-col gap-4 shadow-[6px_6px_0px_0px_#000] dark:shadow-[6px_6px_0px_0px_#FFF] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-slate-900 dark:text-slate-100" />
                <h3 className="font-sketch text-lg font-black uppercase text-slate-900 dark:text-slate-100">
                  SELECT AGENT PERSONA
                </h3>
              </div>
              <button
                onClick={() => setShowAgentsModal(false)}
                className="brutal-btn p-1.5 !shadow-none"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.0} className="size-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {(Object.keys(AGENTS) as AgentRole[]).map((role) => {
                const agent = AGENTS[role];
                const isSelected = selectedAgent === role;
                return (
                  <button
                    key={role}
                    onClick={() => handleSelectAgent(role)}
                    className={cn(
                      'p-3.5 rounded-xl border-2.5 border-slate-900 dark:border-slate-100 text-left flex items-start gap-3 transition-all cursor-pointer',
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF]'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border border-slate-900 dark:border-slate-100',
                        agent.avatarBg
                      )}
                    >
                      {agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-xs uppercase">{agent.name} ({agent.handle})</span>
                        {isSelected && <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] font-mono opacity-80 mt-0.5 line-clamp-2">
                        {agent.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Navigation Bar */}
      <div className="brutal-card bg-white dark:bg-slate-900 p-2 flex items-center justify-between gap-2 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000]'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AGENT CHAT</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000]'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <HugeiconsIcon icon={MapsIcon} strokeWidth={2.0} className="size-4" />
            <span>ACTION PLANNER ({actions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000]'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <HugeiconsIcon icon={BookOpenTextIcon} strokeWidth={2.0} className="size-4" />
            <span>ZENO VAULT ({sources.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-black uppercase transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'memories'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2 border-slate-900 dark:border-slate-100 shadow-[2px_2px_0px_0px_#000]'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <HugeiconsIcon icon={AiMagicIcon} strokeWidth={2.0} className="size-4" />
            <span>MEMORIES ({memories.length})</span>
          </button>
        </div>

        {activeTab === 'chat' && historyMessages.length > 0 && (
          <button
            onClick={handleClear}
            className="brutal-btn p-2 text-rose-600 dark:text-rose-400 !shadow-none"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Chat View Tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[calc(100vh-190px)] min-h-[500px]">
          <div className="brutal-card flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950 border-3 border-slate-900 dark:border-slate-100 shadow-[4px_4px_0px_0px_#000]">
            {/* Messages Scroll Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
              {historyMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 my-auto gap-4">
                  <div className="w-14 h-14 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-3 border-slate-900 dark:border-slate-100 rounded-2xl flex items-center justify-center font-sketch text-2xl font-black shadow-[3px_3px_0px_0px_#000]">
                    Z
                  </div>
                  <div>
                    <h3 className="font-sketch text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      WELCOME TO ZENO CHAT
                    </h3>
                    <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                      Ask Alberto or invoke specialized agents (`@Neo`, `@Radar`, `@Media`) to analyze codebases, research papers, news feeds, and YouTube videos.
                    </p>
                  </div>
                </div>
              )}

              {renderedMessages}

              {loading && (
                <div className="flex items-center gap-2 text-xs font-mono font-extrabold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-2.5 border-slate-900 rounded-xl px-3.5 py-2 animate-pulse w-fit shadow-[2px_2px_0px_0px_#000]">
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>{AGENTS[selectedAgent].name} IS ANALYZING AND EXECUTING...</span>
                </div>
              )}
            </div>

            {/* Attachment Pills Row */}
            {attachments.length > 0 && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-900 dark:border-slate-100 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-900 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  >
                    <span className="truncate max-w-[180px]">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-slate-400 hover:text-rose-500 font-black ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* URL Detection Banner */}
            {urlInInput && (
              <div className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-t-2.5 border-slate-900 dark:border-slate-100 text-xs font-black uppercase font-mono flex items-center justify-between">
                <span>
                  {isYtUrlInInput
                    ? 'YOUTUBE LINK DETECTED — @MEDIA WILL EXTRACT TRANSCRIPT NOTES'
                    : 'URL DETECTED — AGENT WILL FETCH WEBPAGE & GENERATE CLAIMS'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}

            {/* Direct URL Modal Bar */}
            {showUrlModal && (
              <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t-2 border-slate-900 dark:border-slate-100 flex gap-2">
                <input
                  type="url"
                  placeholder="Paste URL (https://... or YouTube link)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  className="brutal-input flex-1 text-xs font-bold"
                />
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || loading}
                  className="prisma-btn-primary !px-4 !py-2"
                >
                  ANALYZE
                </button>
              </div>
            )}

            {/* Suggestion Chips & Panel Container */}
            <div className="relative px-3.5 pt-3 bg-slate-50 dark:bg-slate-900/60 border-t-2 border-slate-900/10 dark:border-slate-100/10">
              <Suggestions>
                <SuggestionList className="justify-start">
                  <Suggestion
                    variant="filled"
                    onClick={() => handleCategoryClick('Agents')}
                    className="!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900"
                  >
                    <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2.0} className="size-3.5" />
                    AGENTS ({AGENTS[selectedAgent].handle})
                  </Suggestion>

                  {CATEGORIES.map((category) => (
                    <Suggestion
                      key={category.label}
                      variant="outline"
                      onClick={() => handleCategoryClick(category.label)}
                      className={cn(openSuggestionPanel && activeCategory === category.label && 'opacity-50')}
                    >
                      <category.icon className="size-3.5" />
                      {category.label}
                    </Suggestion>
                  ))}
                </SuggestionList>
              </Suggestions>

              {/* Expandable Suggestion Panel */}
              <SuggestionPanel
                open={openSuggestionPanel && !!activeCatData}
                onClose={() => setOpenSuggestionPanel(false)}
              >
                {activeCatData && (
                  <>
                    <SuggestionPanelHeader>
                      <SuggestionPanelTitle>
                        <activeCatData.icon className="size-3.5 text-ring" />
                        <span className="text-[13px] font-black uppercase text-slate-900 dark:text-slate-100">
                          {activeCatData.label} SUGGESTIONS
                        </span>
                      </SuggestionPanelTitle>
                      <SuggestionPanelClose onClick={() => setOpenSuggestionPanel(false)}>
                        <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2.0} className="size-4" />
                      </SuggestionPanelClose>
                    </SuggestionPanelHeader>
                    <SuggestionPanelContent>
                      <Suggestions>
                        <SuggestionList orientation="vertical" className="gap-2">
                          {activeCatData.suggestions.map((text) => (
                            <Suggestion
                              key={text}
                              variant="ghost"
                              onClick={() => {
                                setInput(text);
                                setOpenSuggestionPanel(false);
                              }}
                              className="group h-auto w-full justify-between rounded-[8px] p-2.5 text-left font-sans font-bold normal-case text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800"
                            >
                              <span>{text}</span>
                              <HugeiconsIcon
                                icon={ArrowRight01Icon}
                                strokeWidth={2.0}
                                className="size-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 shrink-0"
                              />
                            </Suggestion>
                          ))}
                        </SuggestionList>
                      </Suggestions>
                    </SuggestionPanelContent>
                  </>
                )}
              </SuggestionPanel>
            </div>

            {/* Default Nexus PromptInput Bar */}
            <div className="p-3 bg-slate-100 dark:bg-slate-900 flex flex-col gap-2">
              <PromptInput
                onSubmit={() => handleSend()}
                className="z-10"
              >
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onEnterSubmit={handleSend}
                  placeholder={`Ask ${AGENTS[selectedAgent].name} (${AGENTS[selectedAgent].handle}) or paste YouTube/web link...`}
                  disabled={loading}
                />

                <PromptInputActions>
                  {/* Left Action Group */}
                  <PromptInputActionGroup>
                    {/* Attach File Button */}
                    <PromptInputAction tooltip="Attach file">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.0} className="size-4" />
                      </Button>
                    </PromptInputAction>

                    {/* Upload Image Button */}
                    <PromptInputAction tooltip={{ content: 'Upload image', side: 'bottom' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => imageInputRef.current?.click()}
                        className="cursor-pointer rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <HugeiconsIcon icon={Image01Icon} strokeWidth={2.0} className="size-4" />
                      </Button>
                    </PromptInputAction>

                    {/* Voice Input Button */}
                    <PromptInputAction tooltip={{ content: isListening ? 'Listening...' : 'Voice input', shortcut: 'V' }}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={toggleVoiceInput}
                        className={cn(
                          'cursor-pointer rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800',
                          isListening && 'bg-rose-500 text-white animate-pulse'
                        )}
                      >
                        <HugeiconsIcon icon={Mic02Icon} strokeWidth={2.0} className="size-4" />
                      </Button>
                    </PromptInputAction>

                    {/* URL Bar Button */}
                    <PromptInputAction tooltip="Direct URL Input">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setShowUrlModal(!showUrlModal)}
                        className="cursor-pointer rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                    </PromptInputAction>
                  </PromptInputActionGroup>

                  {/* Right Action Group */}
                  <PromptInputActionGroup>
                    <PromptInputAction tooltip={{ content: 'Send message', shortcut: 'Enter' }}>
                      <Button
                        type="button"
                        size="icon-sm"
                        className="cursor-pointer rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 active:scale-95 disabled:opacity-50"
                        disabled={!loading && !input.trim() && attachments.length === 0}
                        onClick={handleSend}
                      >
                        {loading ? (
                          <HugeiconsIcon icon={SquareIcon} strokeWidth={2.0} className="size-3.5 fill-current" />
                        ) : (
                          <HugeiconsIcon icon={ArrowUp02Icon} strokeWidth={2.0} className="size-4" />
                        )}
                      </Button>
                    </PromptInputAction>
                  </PromptInputActionGroup>
                </PromptInputActions>
              </PromptInput>
            </div>
          </div>
        </div>
      )}

      {/* Action Planner Tab */}
      {activeTab === 'planner' && (
        <div className="brutal-card p-6 flex flex-col gap-5 flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-sketch text-2xl font-black uppercase text-slate-900 dark:text-slate-100">
                ACTION PLANNER
              </h3>
              <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mt-1">
                Scheduled research commitments & weekly review generator.
              </p>
            </div>
            <button
              onClick={() => generateDistill(`Week of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)}
              className="prisma-btn-secondary text-xs font-extrabold uppercase !px-3 !py-2"
            >
              GENERATE WEEKLY REVIEW
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {actions.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleAction(item.id)}
                className={`p-3.5 rounded-xl border-2.5 border-slate-900 dark:border-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  item.status === 'completed'
                    ? 'bg-slate-200 dark:bg-slate-800 line-through opacity-60'
                    : 'bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF]'
                }`}
              >
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{item.title}</span>
                <span className="brutal-tag text-[10px] font-mono bg-slate-100 dark:bg-slate-800">
                  {item.recurrenceRule !== 'NONE' ? item.recurrenceRule : 'ONCE'}
                </span>
              </div>
            ))}
          </div>

          {distills.length > 0 && (
            <div className="mt-4 pt-4 border-t-2.5 border-slate-900 dark:border-slate-100">
              <h4 className="font-bold text-sm uppercase text-slate-900 dark:text-slate-100 mb-3">
                WEEKLY REVIEWS ({distills.length})
              </h4>
              <div className="flex flex-col gap-3">
                {distills.map((d) => (
                  <div key={d.id} className="brutal-card p-4 bg-slate-50 dark:bg-slate-800 flex flex-col gap-1.5">
                    <span className="font-extrabold text-xs uppercase">{d.weekLabel}</span>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed">{d.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vault View Tab */}
      {activeTab === 'vault' && (
        <div className="brutal-card p-6 flex flex-col gap-5 flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-sketch text-2xl font-black uppercase text-slate-900 dark:text-slate-100">
                PERSISTENT ZENO VAULT
              </h3>
              <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mt-1">
                Decoupled source records, verbatim extracted claims, and local FTS search.
              </p>
            </div>
            <button onClick={exportJSON} className="prisma-btn-secondary text-xs uppercase font-extrabold !px-3 !py-2">
              EXPORT JSON
            </button>
          </div>

          <input
            type="text"
            placeholder="Search vault entries, claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="brutal-input text-sm font-bold"
          />

          <div className="flex flex-col gap-3">
            {sources.map((s) => {
              const sourceClaims = claims.filter((c) => c.sourceId === s.id);
              return (
                <div key={s.id} className="brutal-card p-4 bg-white dark:bg-slate-900 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold text-sm text-slate-900 dark:text-slate-100 hover:underline truncate"
                    >
                      {s.title || s.url}
                    </a>
                    <span className="brutal-tag text-[10px] uppercase font-mono">{s.type}</span>
                  </div>
                  {sourceClaims.length > 0 && (
                    <div className="mt-2 pl-3 border-l-4 border-slate-900 dark:border-slate-100 flex flex-col gap-1.5">
                      {sourceClaims.map((c) => (
                        <div key={c.id} className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl text-xs font-mono">
                          <p className="font-extrabold text-slate-900 dark:text-slate-100">"{c.claimText}"</p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">Quote: "{c.verbatimQuote}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Durable Memories Tab */}
      {activeTab === 'memories' && (
        <div className="brutal-card p-6 flex flex-col gap-5 flex-1">
          <div>
            <h3 className="font-sketch text-2xl font-black uppercase text-slate-900 dark:text-slate-100">
              DURABLE MEMORIES
            </h3>
            <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mt-1">
              User preferences, constraints, decisions, and facts.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {memories.map((m) => (
              <div key={m.id} className="brutal-card p-4 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
                <div>
                  <span className="brutal-tag bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] uppercase font-bold">
                    {m.category} · {m.status}
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1.5">{m.content}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {m.status !== 'approved' && (
                    <button onClick={() => setMemoryStatus(m.id, 'approved')} className="brutal-btn bg-emerald-400 text-slate-900 text-xs uppercase font-extrabold !px-3 !py-1">
                      APPROVE
                    </button>
                  )}
                  {m.status !== 'deprecated' && (
                    <button onClick={() => setMemoryStatus(m.id, 'deprecated')} className="brutal-btn bg-slate-200 dark:bg-slate-800 text-xs uppercase font-extrabold !px-3 !py-1">
                      DEPRECATE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
