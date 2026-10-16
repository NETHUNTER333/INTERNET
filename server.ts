import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── XML & HTML Helpers ───

function decodeXmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
  };
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replaceAll(entity, char);
  }
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  return decoded.trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractThumbnail(itemXml: string): string | undefined {
  const mediaContent = itemXml.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaContent) return mediaContent[1];

  const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaThumbnail) return mediaThumbnail[1];

  const enclosure = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  if (enclosure) return enclosure[1];

  const contentMatch =
    itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i) ||
    itemXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i) ||
    itemXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
    itemXml.match(/<description>([\s\S]*?)<\/description>/i);
  if (contentMatch) {
    const imgMatch = contentMatch[1].match(/<img[^>]*src="([^"]+)"/i);
    if (imgMatch) return imgMatch[1];
  }

  return undefined;
}

interface ParsedFeedItem {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
  thumbnail?: string;
}

function parseFeedXml(xml: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const seenLinks = new Set<string>();

  // RSS <item> tags
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi);
  if (itemMatches) {
    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch =
        itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i) ||
        itemXml.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i) ||
        itemXml.match(/<link>([^<]+)/i);
      const descMatch =
        itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
        itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
      const dateMatch =
        itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) ||
        itemXml.match(/<published>([\s\S]*?)<\/published>/i) ||
        itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i) ||
        itemXml.match(/<updated>([\s\S]*?)<\/updated>/i);

      const title = titleMatch ? decodeXmlEntities(stripHtml(titleMatch[1])) : '';
      let link = '';
      if (linkMatch) {
        link = (linkMatch[1] || linkMatch[0] || '').trim();
        link = link.replace(/^\s+|\s+$/g, '');
      }
      const description = descMatch ? decodeXmlEntities(stripHtml(descMatch[1])) : '';
      const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      const thumbnail = extractThumbnail(itemXml);

      if (title && link) {
        const fullLink = link.startsWith('http') ? link : `https://${link}`;
        if (!seenLinks.has(fullLink)) {
          seenLinks.add(fullLink);
          items.push({
            title,
            link: fullLink,
            summary: description.slice(0, 400),
            publishedAt,
            thumbnail,
          });
        }
      }
    }
  }

  // Atom <entry> tags (YouTube / arXiv / blogs)
  const entryMatches = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi);
  if (entryMatches) {
    for (const entryXml of entryMatches) {
      const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch =
        entryXml.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i) ||
        entryXml.match(/<link[^>]*href="([^"]+)"/i);
      const descMatch =
        entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
        entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
      const dateMatch =
        entryXml.match(/<published>([\s\S]*?)<\/published>/i) ||
        entryXml.match(/<updated>([\s\S]*?)<\/updated>/i);

      const title = titleMatch ? decodeXmlEntities(stripHtml(titleMatch[1])) : '';
      const link = linkMatch ? linkMatch[1].trim() : '';
      const description = descMatch ? decodeXmlEntities(stripHtml(descMatch[1])) : '';
      const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      const thumbnail = extractThumbnail(entryXml);

      if (title && link) {
        const fullLink = link.startsWith('http') ? link : `https://${link}`;
        if (!seenLinks.has(fullLink)) {
          seenLinks.add(fullLink);
          items.push({
            title,
            link: fullLink,
            summary: description.slice(0, 400),
            publishedAt,
            thumbnail,
          });
        }
      }
    }
  }

  return items;
}

interface SourceRequest {
  url: string;
  sourceName: string;
  category: string;
  bias: string;
}

async function fetchFeed(source: SourceRequest) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(source.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        sourceName: source.sourceName,
        category: source.category,
        bias: source.bias,
        items: [],
        error: `HTTP ${response.status}`,
      };
    }

    const text = await response.text();
    const items = parseFeedXml(text).slice(0, 20);

    return { sourceName: source.sourceName, category: source.category, bias: source.bias, items };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return { sourceName: source.sourceName, category: source.category, bias: source.bias, items: [], error: errMsg };
  }
}

// ─── API Routes ───

// 1. RSS Feed Proxy
app.post(['/functions/v1/rss-feed', '/api/rss-feed'], async (req: Request, res: Response) => {
  try {
    const { sources } = req.body;
    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ error: "Missing 'sources' array in request body" });
    }

    const results = await Promise.allSettled(sources.map((s: SourceRequest) => fetchFeed(s)));
    const feeds = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { sourceName: '', category: '', bias: '', items: [], error: 'rejected' }
    );
    const totalItems = feeds.reduce((sum, f) => sum + f.items.length, 0);

    return res.json({ feeds, totalItems });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: errMsg });
  }
});

// 2. Agent Research Endpoint
app.post(['/functions/v1/agent-research', '/api/agent-research'], async (req: Request, res: Response) => {
  try {
    const { query, sources, limit = 8 } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const activeSources = sources || { reddit: true, arxiv: true, github: true, news: true };
    const tasks: Promise<any>[] = [];

    // Reddit
    if (activeSources.reddit !== false) {
      tasks.push(
        (async () => {
          try {
            const r = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=month&limit=${limit}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GroundTruth/1.0)' },
            });
            if (!r.ok) return { reddit: [] };
            const d = await r.json();
            const posts = (d?.data?.children || []).map((p: any) => ({
              title: p.data.title,
              url: p.data.url?.startsWith('http') ? p.data.url : `https://www.reddit.com${p.data.permalink}`,
              score: p.data.score,
              comments: p.data.num_comments,
              subreddit: p.data.subreddit,
              publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
              snippet: (p.data.selftext || '').slice(0, 200) || `r/${p.data.subreddit} - ${p.data.score} points`,
            }));
            return { reddit: posts };
          } catch {
            return { reddit: [] };
          }
        })()
      );
    }

    // Arxiv
    if (activeSources.arxiv !== false) {
      tasks.push(
        (async () => {
          try {
            const r = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=relevance`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GroundTruth/1.0)' },
            });
            if (!r.ok) return { arxiv: [] };
            const xml = await r.text();
            const entries: any[] = [];
            const matches = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
            for (const entryXml of matches) {
              const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/i);
              const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/i);
              const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/i);
              const publishedMatch = entryXml.match(/<published>([\s\S]*?)<\/published>/i);
              const authorMatches = entryXml.matchAll(/<name>([\s\S]*?)<\/name>/gi);
              const authors = Array.from(authorMatches).map((m) => m[1].trim()).slice(0, 5);

              if (idMatch && titleMatch) {
                entries.push({
                  title: titleMatch[1].replace(/\s+/g, ' ').trim(),
                  authors: authors.join(', '),
                  summary: (summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '').slice(0, 300),
                  link: idMatch[1].trim(),
                  publishedAt: publishedMatch ? publishedMatch[1].trim() : new Date().toISOString(),
                  categories: '',
                });
              }
            }
            return { arxiv: entries };
          } catch {
            return { arxiv: [] };
          }
        })()
      );
    }

    // GitHub
    if (activeSources.github !== false) {
      tasks.push(
        (async () => {
          try {
            const r = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`, {
              headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Mozilla/5.0 (compatible; GroundTruth/1.0)' },
            });
            if (!r.ok) return { github: [] };
            const d = await r.json();
            const items = (d?.items || []).map((item: any) => ({
              name: item.name,
              fullName: item.full_name,
              description: item.description || 'No description',
              url: item.html_url,
              stars: item.stargazers_count,
              language: item.language || 'Unknown',
              updatedAt: item.updated_at,
              owner: item.owner?.login || '',
              ownerAvatar: item.owner?.avatar_url || '',
            }));
            return { github: items };
          } catch {
            return { github: [] };
          }
        })()
      );
    }

    // News via Google News RSS
    if (activeSources.news !== false) {
      tasks.push(
        (async () => {
          try {
            const r = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });
            if (!r.ok) return { news: [] };
            const xml = await r.text();
            const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
            const news: any[] = [];
            for (const itemXml of items.slice(0, limit)) {
              const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
              const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
              const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
              const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
              const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

              if (titleMatch && linkMatch) {
                news.push({
                  title: titleMatch[1].trim(),
                  link: linkMatch[1].trim(),
                  snippet: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 200) : '',
                  source: sourceMatch ? sourceMatch[1].trim() : 'Google News',
                  publishedAt: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
                });
              }
            }
            return { news };
          } catch {
            return { news: [] };
          }
        })()
      );
    }

    // X / Twitter Posts via Agent-Reach / Google News RSS
    if (activeSources.twitter !== false && activeSources.x !== false) {
      tasks.push(
        (async () => {
          try {
            const twitterPosts: any[] = [];
            const gNewsUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}+site:x.com+OR+site:twitter.com&hl=en-US&gl=US&ceid=US:en`;
            const r1 = await fetch(gNewsUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });
            if (r1.ok) {
              const xml = await r1.text();
              const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
              for (const itemXml of items.slice(0, limit)) {
                const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
                const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
                const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
                const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
                const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

                if (titleMatch && linkMatch) {
                  const title = titleMatch[1].replace(/\s+-\s+(X|Twitter).*$/i, '').trim();
                  twitterPosts.push({
                    title,
                    url: linkMatch[1].trim(),
                    snippet: descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 240) : '',
                    author: sourceMatch ? `@${sourceMatch[1].trim().toLowerCase().replace(/\s+/g, '')}` : '@x_updates',
                    publishedAt: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
                  });
                }
              }
            }

            return { twitter: twitterPosts };
          } catch {
            return { twitter: [] };
          }
        })()
      );
    }

    const results = await Promise.all(tasks);
    const combined: Record<string, any> = { query, reddit: [], arxiv: [], github: [], news: [], twitter: [] };
    for (const resObj of results) {
      Object.assign(combined, resObj);
    }

    return res.json(combined);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: errMsg });
  }
});

// 3. Alberto Chat Assistant Endpoint
app.post(['/functions/v1/alberto-chat', '/api/alberto-chat'], async (req: Request, res: Response) => {
  try {
    const { messages = [], system = '', context = {} } = req.body;

    const apiKey = process.env.ALBERTO_API_KEY || process.env.OPENROUTER_API_KEY || '';
    const model = process.env.ALBERTO_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

    // If an OpenRouter/Alberto key is provided, execute full completion
    if (apiKey) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://zeno.app',
          'X-Title': 'Zeno News Intelligence',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `You are Alberto, an elite AI research assistant for Zeno. Answer questions thoughtfully, citing sources and providing clear analysis. ${system}`,
            },
            ...messages,
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'No response generated.';
        return res.json({ response: content, toolLogs: [] });
      }
    }

    // Helpful offline / fallback answer when key is not configured
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    let responseText = `I am Alberto, your Zeno research assistant.`;

    if (context.articleTitle) {
      responseText += `\n\nRegarding "${context.articleTitle}": ${context.articleSummary || 'You are reading an article from ' + (context.articleSource || 'news sources') + '.'}`;
    } else if (context.paperTitle) {
      responseText += `\n\nRegarding the paper "${context.paperTitle}": ${context.paperAbstract || 'You are exploring research on arXiv.'}`;
    }

    if (lastUserMessage) {
      responseText += `\n\nTo enable live AI generation and full web synthesis for questions like "${lastUserMessage}", please enter your OpenRouter or Alberto API key in Settings (gear icon in sidebar).`;
    } else {
      responseText += `\n\nHow can I help with your news and research intelligence today?`;
    }

    return res.json({ response: responseText, toolLogs: [] });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: errMsg });
  }
});

// 4. Firecrawl & TinyFish Proxy Endpoint
app.post(['/functions/v1/firecrawl-proxy', '/api/firecrawl-proxy'], async (req: Request, res: Response) => {
  try {
    const { action, provider, apiKey, query, url } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required. Add a Firecrawl or TinyFish key in Settings.' });
    }

    if (provider === 'tinyfish') {
      if (action === 'search') {
        const searchUrl = `https://api.search.tinyfish.ai/?q=${encodeURIComponent(query || '')}&limit=10`;
        const r = await fetch(searchUrl, {
          headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
        });
        const data = await r.json();
        return res.json(data);
      } else {
        const scrapeUrl = `https://api.tinyfish.ai/v1/scrape`;
        const r = await fetch(scrapeUrl, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const data = await r.json();
        return res.json(data);
      }
    } else {
      // Firecrawl
      const endpoint = action === 'search' ? 'https://api.firecrawl.dev/v1/search' : 'https://api.firecrawl.dev/v1/scrape';
      const body = action === 'search' ? { query, limit: 10 } : { url, formats: ['markdown'] };
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      return res.json(data);
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: errMsg });
  }
});

// ─── Frontend Serving (Vite in Dev, Static in Prod) ───

const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zeno server running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
