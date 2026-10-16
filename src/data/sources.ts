import type { NewsSource, BiasRating, Language, Category } from '@/types';

// Google News RSS helper - reliable for every language/country
function googleNews(query: string, lang: string, country: string, ceid?: string): string {
  const ceidParam = ceid || `${country}:${lang}`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${country}&ceid=${ceidParam}`;
}

export const NEWS_SOURCES: NewsSource[] = [
  // ===== ENGLISH - US/UK/Global =====
  { name: 'NPR', rssUrl: 'https://feeds.npr.org/1001/feed.xml', category: 'politics', bias: 'lean_left', ownership: 'NPR (Public)', country: 'US', language: 'en', subCategory: 'us-politics' },
  { name: 'Politico', rssUrl: 'https://rss.politico.com/politics-news.xml', category: 'politics', bias: 'lean_left', ownership: 'Allbritton', country: 'US', language: 'en', subCategory: 'us-politics' },
  { name: 'The Hill', rssUrl: 'https://thehill.com/feed/', category: 'politics', bias: 'center', ownership: 'Nexstar', country: 'US', language: 'en', subCategory: 'congress' },
  { name: 'Fox News Politics', rssUrl: 'https://feeds.foxnews.com/fox-news/politics', category: 'politics', bias: 'right', ownership: 'Fox Corp', country: 'US', language: 'en', subCategory: 'us-politics' },
  { name: 'CNN Politics', rssUrl: 'http://rss.cnn.com/rss/cnn_allpolitics.rss', category: 'politics', bias: 'lean_left', ownership: 'Warner Bros Discovery', country: 'US', language: 'en', subCategory: 'us-politics' },
  { name: 'Breitbart', rssUrl: 'https://feeds.feedburner.com/breitbart', category: 'politics', bias: 'far_right', ownership: 'Breitbart', country: 'US', language: 'en', subCategory: 'conservative' },
  { name: 'Daily Kos', rssUrl: 'https://www.dailykos.com/rss/index.rdf', category: 'politics', bias: 'left', ownership: 'Daily Kos', country: 'US', language: 'en', subCategory: 'progressive' },
  { name: 'The Federalist', rssUrl: 'https://thefederalist.com/feed/', category: 'politics', bias: 'right', country: 'US', language: 'en', subCategory: 'conservative' },
  { name: 'Google News Politics US', rssUrl: googleNews('politics', 'en', 'US'), category: 'politics', bias: 'center', country: 'US', language: 'en', subCategory: 'us-politics' },

  // Technology
  { name: 'Ars Technica', rssUrl: 'https://feeds.arstechnica.com/arstechnica/index', category: 'technology', bias: 'lean_left', ownership: 'Condé Nast', country: 'US', language: 'en', subCategory: 'software' },
  { name: 'TechCrunch', rssUrl: 'https://techcrunch.com/feed/', category: 'technology', bias: 'center', ownership: 'Yahoo', country: 'US', language: 'en', subCategory: 'startups' },
  { name: 'The Verge', rssUrl: 'https://www.theverge.com/rss/index.xml', category: 'technology', bias: 'lean_left', ownership: 'Vox Media', country: 'US', language: 'en', subCategory: 'gadgets' },
  { name: 'Wired', rssUrl: 'https://www.wired.com/feed/rss', category: 'technology', bias: 'lean_left', ownership: 'Condé Nast', country: 'US', language: 'en', subCategory: 'ai-ml' },
  { name: 'Engadget', rssUrl: 'https://www.engadget.com/rss.xml', category: 'technology', bias: 'center', ownership: 'Yahoo', country: 'US', language: 'en', subCategory: 'gadgets' },
  { name: 'NYT Tech', rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', category: 'technology', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'software' },
  { name: 'VentureBeat', rssUrl: 'https://venturebeat.com/feed/', category: 'technology', bias: 'center', country: 'US', language: 'en', subCategory: 'ai-ml' },
  { name: 'MIT Tech Review', rssUrl: 'https://www.technologyreview.com/feed/', category: 'technology', bias: 'center', country: 'US', language: 'en', subCategory: 'ai-ml' },
  { name: 'Hacker News', rssUrl: 'https://hnrss.org/frontpage', category: 'technology', bias: 'center', country: 'US', language: 'en', subCategory: 'programming' },
  { name: 'Google News Tech', rssUrl: googleNews('technology', 'en', 'US'), category: 'technology', bias: 'center', country: 'US', language: 'en', subCategory: 'software' },

  // World
  { name: 'BBC News', rssUrl: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'world', bias: 'center', ownership: 'BBC (Public)', country: 'UK', language: 'en', subCategory: 'europe' },
  { name: 'Al Jazeera', rssUrl: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world', bias: 'lean_left', ownership: 'Al Jazeera', country: 'QA', language: 'en', subCategory: 'middle-east' },
  { name: 'The Guardian World', rssUrl: 'https://www.theguardian.com/world/rss', category: 'world', bias: 'left', ownership: 'Scott Trust', country: 'UK', language: 'en', subCategory: 'europe' },
  { name: 'DW News', rssUrl: 'https://rss.dw.com/rdf/rss-en-world', category: 'world', bias: 'center', ownership: 'DW (Public)', country: 'DE', language: 'en', subCategory: 'europe' },
  { name: 'NYT World', rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'asia' },
  { name: 'The Independent', rssUrl: 'https://www.independent.co.uk/news/world/rss', category: 'world', bias: 'lean_left', country: 'UK', language: 'en', subCategory: 'europe' },
  { name: 'Google News World', rssUrl: googleNews('world news', 'en', 'US'), category: 'world', bias: 'center', country: 'US', language: 'en' },
  { name: 'Google News Africa', rssUrl: googleNews('Africa', 'en', 'US'), category: 'world', bias: 'center', country: 'US', language: 'en', subCategory: 'africa' },
  { name: 'Google News Middle East', rssUrl: googleNews('Middle East', 'en', 'US'), category: 'world', bias: 'center', country: 'US', language: 'en', subCategory: 'middle-east' },

  // Business
  { name: 'CNBC', rssUrl: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=forrs&affiliateId=RSSRSS&suid=2492&sort=pubDate&timeType=time&range=1day&maxResults=20', category: 'business', bias: 'center', ownership: 'NBCUniversal', country: 'US', language: 'en', subCategory: 'markets' },
  { name: 'MarketWatch', rssUrl: 'https://feeds.content.dowjones.io/public/rss/mw_topstories', category: 'business', bias: 'center', ownership: 'Dow Jones', country: 'US', language: 'en', subCategory: 'stocks' },
  { name: 'NYT Business', rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', category: 'business', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'economy' },
  { name: 'The Economist', rssUrl: 'https://www.economist.com/rss/the-economist-rss.xml', category: 'business', bias: 'center', country: 'UK', language: 'en', subCategory: 'economy' },
  { name: 'Google News Business', rssUrl: googleNews('business', 'en', 'US'), category: 'business', bias: 'center', country: 'US', language: 'en', subCategory: 'markets' },

  // Science
  { name: 'Science Daily', rssUrl: 'https://www.sciencedaily.com/rss/all.xml', category: 'science', bias: 'center', country: 'US', language: 'en', subCategory: 'biology' },
  { name: 'Phys.org', rssUrl: 'https://phys.org/rss-feed/', category: 'science', bias: 'center', country: 'US', language: 'en', subCategory: 'physics' },
  { name: 'NYT Science', rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', category: 'science', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'astronomy' },
  { name: 'Space.com', rssUrl: 'https://www.space.com/feeds/all', category: 'science', bias: 'center', country: 'US', language: 'en', subCategory: 'space-exploration' },
  { name: 'Google News Science', rssUrl: googleNews('science', 'en', 'US'), category: 'science', bias: 'center', country: 'US', language: 'en', subCategory: 'biology' },

  // Health
  { name: 'Stat News', rssUrl: 'https://www.statnews.com/feed/', category: 'health', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'pharma' },
  { name: 'NYT Health', rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', category: 'health', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'public-health' },
  { name: 'Google News Health', rssUrl: googleNews('health', 'en', 'US'), category: 'health', bias: 'center', country: 'US', language: 'en', subCategory: 'public-health' },

  // Sports
  { name: 'ESPN', rssUrl: 'https://www.espn.com/espn/rss/news', category: 'sports', bias: 'center', ownership: 'Disney', country: 'US', language: 'en', subCategory: 'football' },
  { name: 'BBC Sport', rssUrl: 'https://feeds.bbci.co.uk/sport/rss.xml', category: 'sports', bias: 'center', country: 'UK', language: 'en', subCategory: 'soccer' },
  { name: 'Sky Sports', rssUrl: 'https://www.skysports.com/rss/12040', category: 'sports', bias: 'center', country: 'UK', language: 'en', subCategory: 'soccer' },
  { name: 'Cricket ESPN', rssUrl: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', category: 'sports', bias: 'center', country: 'IN', language: 'en', subCategory: 'cricket' },
  { name: 'Google News Sports', rssUrl: googleNews('sports', 'en', 'US'), category: 'sports', bias: 'center', country: 'US', language: 'en', subCategory: 'football' },
  { name: 'Google News Cricket', rssUrl: googleNews('cricket', 'en', 'IN'), category: 'sports', bias: 'center', country: 'IN', language: 'en', subCategory: 'cricket' },
  { name: 'Google News Soccer', rssUrl: googleNews('soccer football', 'en', 'GB'), category: 'sports', bias: 'center', country: 'UK', language: 'en', subCategory: 'soccer' },
  { name: 'Google News NBA', rssUrl: googleNews('NBA basketball', 'en', 'US'), category: 'sports', bias: 'center', country: 'US', language: 'en', subCategory: 'basketball' },
  { name: 'Google News F1', rssUrl: googleNews('Formula 1 racing', 'en', 'GB'), category: 'sports', bias: 'center', country: 'UK', language: 'en', subCategory: 'f1' },
  { name: 'Google News Tennis', rssUrl: googleNews('tennis', 'en', 'US'), category: 'sports', bias: 'center', country: 'US', language: 'en', subCategory: 'tennis' },

  // Entertainment
  { name: 'Variety', rssUrl: 'https://variety.com/feed/', category: 'entertainment', bias: 'center', country: 'US', language: 'en', subCategory: 'movies' },
  { name: 'Deadline', rssUrl: 'https://deadline.com/feed/', category: 'entertainment', bias: 'center', country: 'US', language: 'en', subCategory: 'tv' },
  { name: 'Rolling Stone', rssUrl: 'https://www.rollingstone.com/feed/', category: 'entertainment', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'music' },
  { name: 'IGN', rssUrl: 'https://feeds.ign.com/ign/all', category: 'entertainment', bias: 'center', country: 'US', language: 'en', subCategory: 'gaming' },
  { name: 'Google News Entertainment', rssUrl: googleNews('entertainment', 'en', 'US'), category: 'entertainment', bias: 'center', country: 'US', language: 'en', subCategory: 'movies' },

  // Environment
  { name: 'Grist', rssUrl: 'https://grist.org/feed/', category: 'environment', bias: 'left', country: 'US', language: 'en', subCategory: 'climate-change' },
  { name: 'Inside Climate News', rssUrl: 'https://insideclimatenews.org/feed/', category: 'environment', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'climate-change' },
  { name: 'Google News Environment', rssUrl: googleNews('environment climate', 'en', 'US'), category: 'environment', bias: 'center', country: 'US', language: 'en', subCategory: 'climate-change' },

  // Opinion
  { name: 'NYT Opinion', rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/opinion.xml', category: 'opinion', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'op-eds' },
  { name: 'National Review', rssUrl: 'https://www.nationalreview.com/feed/', category: 'opinion', bias: 'right', country: 'US', language: 'en', subCategory: 'columns' },
  { name: 'The Atlantic', rssUrl: 'https://www.theatlantic.com/feed/all/', category: 'opinion', bias: 'lean_left', country: 'US', language: 'en', subCategory: 'essays' },
  { name: 'Slate', rssUrl: 'https://slate.com/feeds/all.rss', category: 'opinion', bias: 'left', country: 'US', language: 'en', subCategory: 'commentary' },
  { name: 'Reason', rssUrl: 'https://reason.com/feed/', category: 'opinion', bias: 'lean_right', country: 'US', language: 'en', subCategory: 'analysis' },

  // Education
  { name: 'Google News Education', rssUrl: googleNews('education', 'en', 'US'), category: 'education', bias: 'center', country: 'US', language: 'en', subCategory: 'k-12' },

  // Culture
  { name: 'Google News Culture', rssUrl: googleNews('culture arts', 'en', 'US'), category: 'culture', bias: 'center', country: 'US', language: 'en', subCategory: 'art' },

  // Space
  { name: 'Space.com', rssUrl: 'https://www.space.com/feeds/all', category: 'space', bias: 'center', country: 'US', language: 'en' },
  { name: 'Google News Space', rssUrl: googleNews('space exploration NASA', 'en', 'US'), category: 'space', bias: 'center', country: 'US', language: 'en' },
  { name: 'NASA Breaking News', rssUrl: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'space', bias: 'center', country: 'US', language: 'en' },

  // AI & ML
  { name: 'Google News AI', rssUrl: googleNews('artificial intelligence AI', 'en', 'US'), category: 'ai', bias: 'center', country: 'US', language: 'en' },
  { name: 'Google News Machine Learning', rssUrl: googleNews('machine learning LLM', 'en', 'US'), category: 'ai', bias: 'center', country: 'US', language: 'en' },
  { name: 'Hacker News AI', rssUrl: 'https://hnrss.org/frontpage', category: 'ai', bias: 'center', country: 'US', language: 'en' },

  // Crypto
  { name: 'Google News Crypto', rssUrl: googleNews('cryptocurrency bitcoin blockchain', 'en', 'US'), category: 'crypto', bias: 'center', country: 'US', language: 'en' },
  { name: 'Google News Crypto Global', rssUrl: googleNews('crypto web3', 'en', 'GB'), category: 'crypto', bias: 'center', country: 'UK', language: 'en' },

  // Startups
  { name: 'Google News Startups', rssUrl: googleNews('startup venture funding', 'en', 'US'), category: 'startup', bias: 'center', country: 'US', language: 'en' },
  { name: 'Google News Startup India', rssUrl: googleNews('startup India', 'en', 'IN'), category: 'startup', bias: 'center', country: 'IN', language: 'en' },

  // Design
  { name: 'Google News Design', rssUrl: googleNews('design architecture UX', 'en', 'US'), category: 'design', bias: 'center', country: 'US', language: 'en' },
  { name: 'Google News Design Europe', rssUrl: googleNews('design architecture', 'en', 'GB'), category: 'design', bias: 'center', country: 'UK', language: 'en' },

  // ===== SPANISH =====
  { name: 'El País', rssUrl: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', category: 'world', bias: 'lean_left', country: 'ES', language: 'es', subCategory: 'europe' },
  { name: 'BBC Mundo', rssUrl: 'https://feeds.bbci.co.uk/mundo/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'es', subCategory: 'americas' },
  { name: 'El Mundo', rssUrl: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', category: 'world', bias: 'center', country: 'ES', language: 'es', subCategory: 'europe' },
  { name: 'Infobae', rssUrl: 'https://www.infobae.com/rss/1/', category: 'world', bias: 'center', country: 'AR', language: 'es', subCategory: 'americas' },
  { name: 'Google News Spanish', rssUrl: googleNews('noticias', 'es', 'ES'), category: 'world', bias: 'center', country: 'ES', language: 'es' },
  { name: 'Google News Mexico', rssUrl: googleNews('noticias', 'es', 'MX'), category: 'world', bias: 'center', country: 'MX', language: 'es', subCategory: 'americas' },

  // ===== FRENCH =====
  { name: 'Le Monde', rssUrl: 'https://www.lemonde.fr/rss/une.xml', category: 'world', bias: 'lean_left', country: 'FR', language: 'fr', subCategory: 'europe' },
  { name: 'Le Figaro', rssUrl: 'https://www.lefigaro.fr/rss/figaro_actualites.xml', category: 'world', bias: 'center', country: 'FR', language: 'fr', subCategory: 'europe' },
  { name: 'RFI', rssUrl: 'https://www.rfi.fr/fr/rss', category: 'world', bias: 'center', country: 'FR', language: 'fr', subCategory: 'africa' },
  { name: 'France24', rssUrl: 'https://www.france24.com/fr/rss', category: 'world', bias: 'center', country: 'FR', language: 'fr', subCategory: 'europe' },
  { name: 'Google News French', rssUrl: googleNews('actualités', 'fr', 'FR'), category: 'world', bias: 'center', country: 'FR', language: 'fr' },

  // ===== GERMAN =====
  { name: 'Der Spiegel', rssUrl: 'https://www.spiegel.de/index.rss', category: 'world', bias: 'lean_left', country: 'DE', language: 'de', subCategory: 'europe' },
  { name: 'Die Zeit', rssUrl: 'https://www.zeit.de/index.xml', category: 'world', bias: 'center', country: 'DE', language: 'de', subCategory: 'europe' },
  { name: 'FAZ', rssUrl: 'https://www.faz.net/rss/aktuell/', category: 'world', bias: 'center', country: 'DE', language: 'de', subCategory: 'europe' },
  { name: 'Tagesschau', rssUrl: 'https://www.tagesschau.de/xml/rss2', category: 'world', bias: 'center', country: 'DE', language: 'de', subCategory: 'europe' },
  { name: 'Google News German', rssUrl: googleNews('nachrichten', 'de', 'DE'), category: 'world', bias: 'center', country: 'DE', language: 'de' },

  // ===== ARABIC =====
  { name: 'Al Jazeera Arabic', rssUrl: 'https://www.aljazeera.net/aljazeerarss/3e76b4a6-105e-471d-89a8-d4f2b25a5d92/73b08b24-6d4c-4397-9473-7fbf5f3c0d65', category: 'world', bias: 'lean_left', country: 'QA', language: 'ar', subCategory: 'middle-east' },
  { name: 'BBC Arabic', rssUrl: 'https://feeds.bbci.co.uk/arabic/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'ar', subCategory: 'middle-east' },
  { name: 'Google News Arabic', rssUrl: googleNews('أخبار', 'ar', 'EG'), category: 'world', bias: 'center', country: 'EG', language: 'ar' },
  { name: 'Google News Saudi', rssUrl: googleNews('أخبار', 'ar', 'SA'), category: 'world', bias: 'center', country: 'SA', language: 'ar', subCategory: 'middle-east' },

  // ===== JAPANESE =====
  { name: 'NHK News', rssUrl: 'https://www.nhk.or.jp/rss/news/cat0.xml', category: 'world', bias: 'center', country: 'JP', language: 'ja', subCategory: 'asia' },
  { name: 'Yomiuri', rssUrl: 'https://www.yomiuri.co.jp/feed/', category: 'world', bias: 'center', country: 'JP', language: 'ja', subCategory: 'asia' },
  { name: 'Google News Japanese', rssUrl: googleNews('ニュース', 'ja', 'JP'), category: 'world', bias: 'center', country: 'JP', language: 'ja' },

  // ===== PORTUGUESE =====
  { name: 'Folha de S.Paulo', rssUrl: 'https://feeds.folha.uol.com.br/poder/rss091.xml', category: 'politics', bias: 'center', country: 'BR', language: 'pt', subCategory: 'latin-america-politics' },
  { name: 'G1 Globo', rssUrl: 'https://g1.globo.com/rss/g1/', category: 'world', bias: 'center', country: 'BR', language: 'pt', subCategory: 'americas' },
  { name: 'Google News Portuguese', rssUrl: googleNews('notícias', 'pt', 'BR'), category: 'world', bias: 'center', country: 'BR', language: 'pt' },

  // ===== ITALIAN =====
  { name: 'Corriere della Sera', rssUrl: 'https://www.corriere.it/rss/home.xml', category: 'world', bias: 'center', country: 'IT', language: 'it', subCategory: 'europe' },
  { name: 'La Repubblica', rssUrl: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', category: 'world', bias: 'lean_left', country: 'IT', language: 'it', subCategory: 'europe' },
  { name: 'ANSA', rssUrl: 'https://www.ansa.it/sito/ansait_rss.xml', category: 'world', bias: 'center', country: 'IT', language: 'it', subCategory: 'europe' },
  { name: 'Google News Italian', rssUrl: googleNews('notizie', 'it', 'IT'), category: 'world', bias: 'center', country: 'IT', language: 'it' },

  // ===== RUSSIAN =====
  { name: 'RIA Novosti', rssUrl: 'https://ria.ru/export/rss2/archive/index.xml', category: 'world', bias: 'lean_right', country: 'RU', language: 'ru', subCategory: 'europe' },
  { name: 'TASS', rssUrl: 'https://tass.ru/rss/v2.xml', category: 'world', bias: 'lean_right', country: 'RU', language: 'ru', subCategory: 'europe' },
  { name: 'Google News Russian', rssUrl: googleNews('новости', 'ru', 'RU'), category: 'world', bias: 'center', country: 'RU', language: 'ru' },

  // ===== CHINESE =====
  { name: 'BBC Chinese', rssUrl: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'zh', subCategory: 'asia' },
  { name: 'Google News Chinese', rssUrl: googleNews('新闻', 'zh-CN', 'CN'), category: 'world', bias: 'center', country: 'CN', language: 'zh' },

  // ===== HINDI =====
  { name: 'BBC Hindi', rssUrl: 'https://feeds.bbci.co.uk/hindi/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'hi', subCategory: 'asia' },
  { name: 'Google News Hindi', rssUrl: googleNews('समाचार', 'hi', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'hi', subCategory: 'indian-politics' },
  { name: 'Google News Hindi India', rssUrl: googleNews('भारत', 'hi', 'IN', 'IN:hi'), category: 'politics', bias: 'center', country: 'IN', language: 'hi', subCategory: 'indian-politics' },

  // ===== TURKISH =====
  { name: 'TRT World', rssUrl: 'https://www.trtworld.com/rss', category: 'world', bias: 'center', country: 'TR', language: 'tr', subCategory: 'middle-east' },
  { name: 'Anadolu Agency', rssUrl: 'https://www.aa.com.tr/tr/rss/default.xml', category: 'world', bias: 'center', country: 'TR', language: 'tr', subCategory: 'middle-east' },
  { name: 'Google News Turkish', rssUrl: googleNews('haberler', 'tr', 'TR'), category: 'world', bias: 'center', country: 'TR', language: 'tr' },

  // ===== TELUGU =====
  { name: 'Google News Telugu', rssUrl: googleNews('వార్తలు', 'te', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'te' },
  { name: 'Google News Telugu India', rssUrl: googleNews('ఆంధ్రప్రదేశ్', 'te', 'IN', 'IN:te'), category: 'world', bias: 'center', country: 'IN', language: 'te' },

  // ===== TAMIL =====
  { name: 'Google News Tamil', rssUrl: googleNews('செய்திகள்', 'ta', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'ta' },
  { name: 'Google News Tamil India', rssUrl: googleNews('தமிழ்நாடு', 'ta', 'IN', 'IN:ta'), category: 'world', bias: 'center', country: 'IN', language: 'ta' },

  // ===== BENGALI =====
  { name: 'Google News Bengali', rssUrl: googleNews('সংবাদ', 'bn', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'bn' },
  { name: 'Google News Bengali India', rssUrl: googleNews('পশ্চিমবঙ্গ', 'bn', 'IN', 'IN:bn'), category: 'world', bias: 'center', country: 'IN', language: 'bn' },

  // ===== MARATHI =====
  { name: 'Google News Marathi', rssUrl: googleNews('बातम्या', 'mr', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'mr' },
  { name: 'Google News Marathi India', rssUrl: googleNews('महाराष्ट्र', 'mr', 'IN', 'IN:mr'), category: 'world', bias: 'center', country: 'IN', language: 'mr' },

  // ===== GUJARATI =====
  { name: 'Google News Gujarati', rssUrl: googleNews('સમાચાર', 'gu', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'gu' },
  { name: 'Google News Gujarati India', rssUrl: googleNews('ગુજરાત', 'gu', 'IN', 'IN:gu'), category: 'world', bias: 'center', country: 'IN', language: 'gu' },

  // ===== PUNJABI =====
  { name: 'Google News Punjabi', rssUrl: googleNews('ਖ਼ਬਰਾਂ', 'pa', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'pa' },
  { name: 'Google News Punjabi India', rssUrl: googleNews('ਪੰਜਾਬ', 'pa', 'IN', 'IN:pa'), category: 'world', bias: 'center', country: 'IN', language: 'pa' },

  // ===== URDU =====
  { name: 'BBC Urdu', rssUrl: 'https://feeds.bbci.co.uk/urdu/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'ur' },
  { name: 'Google News Urdu', rssUrl: googleNews('خبریں', 'ur', 'PK'), category: 'world', bias: 'center', country: 'PK', language: 'ur' },

  // ===== KANNADA =====
  { name: 'Google News Kannada', rssUrl: googleNews('ಸುದ್ದಿಗಳು', 'kn', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'kn' },
  { name: 'Google News Kannada India', rssUrl: googleNews('ಕರ್ನಾಟಕ', 'kn', 'IN', 'IN:kn'), category: 'world', bias: 'center', country: 'IN', language: 'kn' },

  // ===== MALAYALAM =====
  { name: 'Google News Malayalam', rssUrl: googleNews('വാർത്തകൾ', 'ml', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'ml' },
  { name: 'Google News Malayalam India', rssUrl: googleNews('കേരളം', 'ml', 'IN', 'IN:ml'), category: 'world', bias: 'center', country: 'IN', language: 'ml' },

  // ===== ODIA =====
  { name: 'Google News Odia', rssUrl: googleNews('ଖଣ', 'or', 'IN'), category: 'world', bias: 'center', country: 'IN', language: 'or' },
  { name: 'Google News Odia India', rssUrl: googleNews('ଓଡିଶା', 'or', 'IN', 'IN:or'), category: 'world', bias: 'center', country: 'IN', language: 'or' },

  // ===== VIETNAMESE =====
  { name: 'VnExpress', rssUrl: 'https://vnexpress.net/rss/tin-moi-nhat.rss', category: 'world', bias: 'center', country: 'VN', language: 'vi', subCategory: 'asia' },
  { name: 'Google News Vietnamese', rssUrl: googleNews('tin tức', 'vi', 'VN'), category: 'world', bias: 'center', country: 'VN', language: 'vi' },

  // ===== KOREAN =====
  { name: 'Google News Korean', rssUrl: googleNews('뉴스', 'ko', 'KR'), category: 'world', bias: 'center', country: 'KR', language: 'ko' },
  { name: 'Google News Korea Tech', rssUrl: googleNews('기술', 'ko', 'KR'), category: 'technology', bias: 'center', country: 'KR', language: 'ko' },

  // ===== INDONESIAN =====
  { name: 'Google News Indonesian', rssUrl: googleNews('berita', 'id', 'ID'), category: 'world', bias: 'center', country: 'ID', language: 'id' },

  // ===== THAI =====
  { name: 'Google News Thai', rssUrl: googleNews('ข่าว', 'th', 'TH'), category: 'world', bias: 'center', country: 'TH', language: 'th' },

  // ===== PERSIAN =====
  { name: 'BBC Persian', rssUrl: 'https://feeds.bbci.co.uk/persian/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'fa', subCategory: 'middle-east' },
  { name: 'Google News Persian', rssUrl: googleNews('اخبار', 'fa', 'IR'), category: 'world', bias: 'center', country: 'IR', language: 'fa' },

  // ===== POLISH =====
  { name: 'Google News Polish', rssUrl: googleNews('wiadomości', 'pl', 'PL'), category: 'world', bias: 'center', country: 'PL', language: 'pl' },

  // ===== DUTCH =====
  { name: 'NU.nl', rssUrl: 'https://www.nu.nl/rss/algemeen', category: 'world', bias: 'center', country: 'NL', language: 'nl', subCategory: 'europe' },
  { name: 'Google News Dutch', rssUrl: googleNews('nieuws', 'nl', 'NL'), category: 'world', bias: 'center', country: 'NL', language: 'nl' },

  // ===== SWEDISH =====
  { name: 'Google News Swedish', rssUrl: googleNews('nyheter', 'sv', 'SE'), category: 'world', bias: 'center', country: 'SE', language: 'sv' },

  // ===== UKRAINIAN =====
  { name: 'Google News Ukrainian', rssUrl: googleNews('новини', 'uk', 'UA'), category: 'world', bias: 'center', country: 'UA', language: 'uk' },

  // ===== HEBREW =====
  { name: 'Google News Hebrew', rssUrl: googleNews('חדשות', 'he', 'IL'), category: 'world', bias: 'center', country: 'IL', language: 'he' },

  // ===== SWAHILI =====
  { name: 'BBC Swahili', rssUrl: 'https://feeds.bbci.co.uk/swahili/rss.xml', category: 'world', bias: 'center', country: 'UK', language: 'sw', subCategory: 'africa' },
  { name: 'Google News Swahili', rssUrl: googleNews('habari', 'sw', 'KE'), category: 'world', bias: 'center', country: 'KE', language: 'sw' },
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
  politics: 'Politics', technology: 'Technology', world: 'World', business: 'Business',
  science: 'Science', health: 'Health', sports: 'Sports',
  entertainment: 'Entertainment', education: 'Education', environment: 'Environment',
  culture: 'Culture', opinion: 'Opinion',
  space: 'Space', ai: 'AI & ML', crypto: 'Crypto', startup: 'Startups', design: 'Design',
};

export const CATEGORY_COLORS: Record<string, string> = {
  politics: 'bg-brutal-pink', technology: 'bg-brutal-cyan', world: 'bg-brutal-blue',
  business: 'bg-brutal-lime', science: 'bg-brutal-orange', health: 'bg-brutal-red',
  sports: 'bg-brutal-yellow', entertainment: 'bg-brutal-pink', education: 'bg-brutal-cyan',
  environment: 'bg-brutal-lime', culture: 'bg-brutal-orange', opinion: 'bg-brutal-white',
  space: 'bg-brutal-blue', ai: 'bg-brutal-cyan', crypto: 'bg-brutal-lime', startup: 'bg-brutal-orange', design: 'bg-brutal-pink',
};

export const ALL_CATEGORIES: Category[] = [
  'politics', 'technology', 'world', 'business', 'science', 'health', 'sports',
  'entertainment', 'education', 'environment', 'culture', 'opinion',
  'space', 'ai', 'crypto', 'startup', 'design',
];

export const BIAS_LABELS: Record<BiasRating, string> = {
  far_left: 'Far Left', left: 'Left', lean_left: 'Lean Left', center: 'Center',
  lean_right: 'Lean Right', right: 'Right', far_right: 'Far Right',
};

export const BIAS_COLORS: Record<BiasRating, string> = {
  far_left: 'bg-bias-farleft', left: 'bg-bias-left', lean_left: 'bg-bias-leanleft',
  center: 'bg-bias-center', lean_right: 'bg-bias-leanright',
  right: 'bg-bias-right', far_right: 'bg-bias-farright',
};

export const BIAS_ORDER: BiasRating[] = ['far_left', 'left', 'lean_left', 'center', 'lean_right', 'right', 'far_right'];

export const NEWS_SOURCES_COUNT = NEWS_SOURCES.length;
