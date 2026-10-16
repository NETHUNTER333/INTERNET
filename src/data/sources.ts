import type { NewsSource, BiasRating, Language, Category } from '@/types';

function googleNews(query: string, lang: string, country: string, ceid?: string): string {
  const ceidParam = ceid || `${country}:${lang}`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${ceidParam}`;
}

export const NEWS_SOURCES: NewsSource[] = [
  // ===== AI, ML & LLMS =====
  { name: 'OpenAI Research', rssUrl: googleNews('OpenAI research LLM GPT-4 artificial intelligence', 'en', 'US'), category: 'ai', bias: 'center', country: 'US', language: 'en', subCategory: 'llm-research' },
  { name: 'Google DeepMind', rssUrl: googleNews('Google DeepMind AI research Gemini', 'en', 'US'), category: 'ai', bias: 'center', country: 'US', language: 'en', subCategory: 'llm-research' },
  { name: 'Hugging Face Papers', rssUrl: googleNews('Hugging Face AI models machine learning paper', 'en', 'US'), category: 'ai', bias: 'center', country: 'US', language: 'en', subCategory: 'open-source-ai' },
  { name: 'Anthropic AI', rssUrl: googleNews('Anthropic Claude AI research safety', 'en', 'US'), category: 'ai', bias: 'center', country: 'US', language: 'en', subCategory: 'ai-safety' },
  { name: 'MIT Tech Review AI', rssUrl: 'https://www.technologyreview.com/feed/', category: 'ai', bias: 'center', country: 'US', language: 'en', subCategory: 'ai-news' },
  { name: 'VentureBeat AI', rssUrl: 'https://venturebeat.com/category/ai/feed/', category: 'ai', bias: 'center', country: 'US', language: 'en', subCategory: 'ai-startups' },

  // ===== BIOTECH & COMPUTATIONAL BIO =====
  { name: 'Nature BioTech', rssUrl: googleNews('Nature Biotech computational biology genomics CRISPR', 'en', 'US'), category: 'biotech', bias: 'center', country: 'US', language: 'en', subCategory: 'genomics' },
  { name: 'BioRxiv Genomics', rssUrl: googleNews('BioRxiv genomics protein folding bio-ai bioinformatics', 'en', 'US'), category: 'biotech', bias: 'center', country: 'US', language: 'en', subCategory: 'computational-bio' },
  { name: 'MIT Bio Engineering', rssUrl: googleNews('MIT biological engineering synthetic biology', 'en', 'US'), category: 'biotech', bias: 'center', country: 'US', language: 'en', subCategory: 'synthetic-bio' },
  { name: 'GenomeWeb', rssUrl: googleNews('GenomeWeb sequencing CRISPR precision medicine', 'en', 'US'), category: 'biotech', bias: 'center', country: 'US', language: 'en', subCategory: 'genomics' },
  { name: 'Stat News Bio', rssUrl: 'https://www.statnews.com/feed/', category: 'biotech', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'pharma' },

  // ===== HARDWARE & SEMICONDUCTORS =====
  { name: 'AnandTech / Hardware', rssUrl: googleNews('semiconductors GPU AI chips TSMC Nvidia Intel', 'en', 'US'), category: 'hardware', bias: 'center', country: 'US', language: 'en', subCategory: 'chips' },
  { name: 'Tom\'s Hardware Chips', rssUrl: googleNews('processor GPU silicon semiconductor benchmark', 'en', 'US'), category: 'hardware', bias: 'center', country: 'US', language: 'en', subCategory: 'gpus' },
  { name: 'IEEE Spectrum Robotics', rssUrl: googleNews('IEEE Spectrum robotics edge AI embedded systems', 'en', 'US'), category: 'hardware', bias: 'center', country: 'US', language: 'en', subCategory: 'robotics' },
  { name: 'Semiconductor Engineering', rssUrl: googleNews('Semiconductor Engineering chip design lithography foundry', 'en', 'US'), category: 'hardware', bias: 'center', country: 'US', language: 'en', subCategory: 'chips' },

  // ===== TECH & DEVELOPER TOOLS =====
  { name: 'Ars Technica', rssUrl: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', bias: 'lean_left', ownership: 'Condé Nast', country: 'US', language: 'en', subCategory: 'software' },
  { name: 'TechCrunch Startups', rssUrl: 'https://techcrunch.com/feed/', category: 'technology', bias: 'center', ownership: 'Yahoo', country: 'US', language: 'en', subCategory: 'startups' },
  { name: 'The Verge Tech', rssUrl: 'https://www.theverge.com/rss/index.xml', category: 'technology', bias: 'lean_left', ownership: 'Vox Media', country: 'US', language: 'en', subCategory: 'gadgets' },
  { name: 'Wired Tech', rssUrl: 'https://www.wired.com/feed/rss', category: 'technology', bias: 'lean_left', ownership: 'Condé Nast', country: 'US', language: 'en', subCategory: 'ai-ml' },
  { name: 'Hacker News Frontpage', rssUrl: 'https://hnrss.org/frontpage', category: 'technology', bias: 'center', country: 'US', language: 'en', subCategory: 'programming' },
  { name: 'Google News Software', rssUrl: googleNews('open source software engineering webdev', 'en', 'US'), category: 'technology', bias: 'center', country: 'US', language: 'en', subCategory: 'programming' },

  // ===== CRYPTO & WEB3 =====
  { name: 'CoinDesk Web3', rssUrl: googleNews('cryptocurrency bitcoin ethereum web3 blockchain protocol', 'en', 'US'), category: 'crypto', bias: 'center', country: 'US', language: 'en', subCategory: 'protocols' },
  { name: 'Decrypt Media', rssUrl: googleNews('Decrypt crypto Web3 AI decentralization', 'en', 'US'), category: 'crypto', bias: 'center', country: 'US', language: 'en', subCategory: 'web3' },

  // ===== POLITICS & WORLD =====
  { name: 'NPR Politics', rssUrl: 'https://feeds.npr.org/1001/feed.xml', category: 'politics', bias: 'lean_left', ownership: 'NPR (Public)', country: 'US', language: 'en', subCategory: 'us-politics' },
  { name: 'Politico Congress', rssUrl: 'https://rss.politico.com/politics-news.xml', category: 'politics', bias: 'lean_left', ownership: 'Allbritton', country: 'US', language: 'en', subCategory: 'us-politics' },
  { name: 'BBC World News', rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world', bias: 'center', ownership: 'BBC (Public)', country: 'UK', language: 'en', subCategory: 'europe' },
  { name: 'Al Jazeera World', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', bias: 'lean_left', ownership: 'Al Jazeera', country: 'QA', language: 'en', subCategory: 'middle-east' },

  // ===== BUSINESS & SCIENCE =====
  { name: 'CNBC Markets', rssUrl: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=forrs&affiliateId=RSSRSS&suid=2492&sort=pubDate&timeType=time&range=1day&maxResults=20', category: 'business', bias: 'center', ownership: 'NBCUniversal', country: 'US', language: 'en', subCategory: 'markets' },
  { name: 'Science Daily All', rssUrl: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', bias: 'center', country: 'US', language: 'en', subCategory: 'physics' },
  { name: 'Phys.org Science', rssUrl: 'https://phys.org/rss-feed/', category: 'science', bias: 'center', country: 'US', language: 'en', subCategory: 'physics' },
  { name: 'Space.com Space', rssUrl: 'https://www.space.com/feeds/all', category: 'space', bias: 'center', country: 'US', language: 'en', subCategory: 'space-exploration' },
];

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', ar: 'Arabic', ja: 'Japanese',
  pt: 'Portuguese', it: 'Italian', ru: 'Russian', zh: 'Chinese', hi: 'Hindi', tr: 'Turkish',
  te: 'Telugu', ta: 'Tamil', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati', pa: 'Punjabi',
  ur: 'Urdu', kn: 'Kannada', ml: 'Malayalam', or: 'Odia',
  vi: 'Vietnamese', ko: 'Korean', id: 'Indonesian', th: 'Thai', fa: 'Persian',
  pl: 'Polish', nl: 'Dutch', sv: 'Swedish', uk: 'Ukrainian', he: 'Hebrew', sw: 'Swahili',
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: 'EN', es: 'ES', fr: 'FR', de: 'DE', ar: 'AR', ja: 'JP', pt: 'PT', it: 'IT',
  ru: 'RU', zh: 'CN', hi: 'IN', tr: 'TR', te: 'TE', ta: 'TA', bn: 'BN', mr: 'MR',
  gu: 'GU', pa: 'PA', ur: 'UR', kn: 'KN', ml: 'ML', or: 'OR', vi: 'VN', ko: 'KR',
  id: 'ID', th: 'TH', fa: 'IR', pl: 'PL', nl: 'NL', sv: 'SE', uk: 'UA', he: 'IL', sw: 'SW',
};

export const ALL_LANGUAGES: Language[] = [
  'en', 'es', 'fr', 'de', 'ar', 'ja', 'pt', 'it', 'ru', 'zh', 'hi', 'tr',
  'te', 'ta', 'bn', 'mr', 'gu', 'pa', 'ur', 'kn', 'ml', 'or',
  'vi', 'ko', 'id', 'th', 'fa', 'pl', 'nl', 'sv', 'uk', 'he', 'sw',
];

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Channels',
  ai: 'AI & ML',
  biotech: 'BioTech & Bio-AI',
  hardware: 'Hardware & Silicon',
  technology: 'Tech & Software',
  crypto: 'Crypto & Web3',
  github: 'GitHub Repos',
  arxiv: 'ArXiv Papers',
  politics: 'Politics',
  world: 'World',
  business: 'Business',
  science: 'Science',
  health: 'Health',
  sports: 'Sports',
  entertainment: 'Entertainment',
  environment: 'Environment',
  space: 'Space',
};

export const CATEGORY_COLORS: Record<string, string> = {
  politics: 'bg-rose-50 text-rose-700 border-rose-200/80',
  technology: 'bg-teal-50 text-teal-700 border-teal-200/80',
  world: 'bg-sky-50 text-sky-700 border-sky-200/80',
  business: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  science: 'bg-amber-50 text-amber-700 border-amber-200/80',
  health: 'bg-red-50 text-red-700 border-red-200/80',
  sports: 'bg-orange-50 text-orange-700 border-orange-200/80',
  entertainment: 'bg-purple-50 text-purple-700 border-purple-200/80',
  education: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  environment: 'bg-green-50 text-green-700 border-green-200/80',
  culture: 'bg-pink-50 text-pink-700 border-pink-200/80',
  opinion: 'bg-slate-100 text-slate-700 border-slate-200/80',
  space: 'bg-blue-50 text-blue-700 border-blue-200/80',
  ai: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
  biotech: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  hardware: 'bg-slate-100 text-slate-800 border-slate-200/80',
  crypto: 'bg-violet-50 text-violet-700 border-violet-200/80',
  startup: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/80',
  design: 'bg-yellow-50 text-yellow-800 border-yellow-200/80',
};

export const ALL_CATEGORIES: Category[] = [
  'ai', 'biotech', 'hardware', 'technology', 'github', 'arxiv', 'crypto',
  'politics', 'world', 'business', 'science', 'health', 'sports',
  'entertainment', 'environment', 'space',
];

export const BIAS_LABELS: Record<BiasRating, string> = {
  far_left: 'Far Left', left: 'Left', lean_left: 'Lean Left', center: 'Center',
  lean_right: 'Lean Right', right: 'Right', far_right: 'Far Right',
};

export const BIAS_COLORS: Record<BiasRating, string> = {
  far_left: 'bg-rose-100 text-rose-800', left: 'bg-rose-100 text-rose-800', lean_left: 'bg-slate-100 text-slate-800',
  center: 'bg-slate-100 text-slate-800', lean_right: 'bg-slate-100 text-slate-800',
  right: 'bg-indigo-100 text-indigo-800', far_right: 'bg-indigo-100 text-indigo-800',
};

export const BIAS_ORDER: BiasRating[] = ['far_left', 'left', 'lean_left', 'center', 'lean_right', 'right', 'far_right'];

export const NEWS_SOURCES_COUNT = NEWS_SOURCES.length;
