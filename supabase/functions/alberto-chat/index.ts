import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  messages: { role: string; content: string }[];
  system?: string;
  context?: {
    currentView?: string;
    paperTitle?: string;
    paperAbstract?: string;
    paperArxivId?: string;
    articleTitle?: string;
    articleSummary?: string;
    articleSource?: string;
  };
}

// ─── Tool implementations ───

async function toolSearchArxiv(query: string, maxResults = 8): Promise<string> {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${maxResults}&sortBy=relevance`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Zeno/1.0)" },
    });
    if (!response.ok) return "arXiv search failed.";
    const xml = await response.text();
    const entries: string[] = [];
    const entryMatches = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi);
    if (!entryMatches) return "No arXiv papers found.";

    for (const entryXml of entryMatches) {
      const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/i);
      const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/i);
      const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/i);
      const authorMatches = entryXml.matchAll(/<name>([\s\S]*?)<\/name>/gi);
      const authors = Array.from(authorMatches).map((m) => m[1].trim()).slice(0, 5).join(", ");
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";
      const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, " ").trim().slice(0, 200) : "";
      const link = idMatch ? idMatch[1].trim() : "";
      const arxivId = link.match(/abs\/([\d.]+|[\w]+\/[\d]+)/)?.[1] || "";
      entries.push(`**${title}**\nAuthors: ${authors}\narXiv ID: ${arxivId}\nAbstract: ${summary}\nLink: ${link}\nPDF: https://arxiv.org/pdf/${arxivId}.pdf\n`);
    }
    return `Found ${entries.length} arXiv papers:\n\n${entries.join("\n---\n")}`;
  } catch (e) {
    return `arXiv search error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolSearchGitHub(query: string, perPage = 8): Promise<string> {
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${perPage}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (compatible; PRISMA/1.0)",
      },
    });
    if (!response.ok) return `GitHub search failed (${response.status}).`;
    const data = await response.json();
    const items = (data?.items || []).slice(0, perPage);
    if (items.length === 0) return "No GitHub repos found.";

    const repos = items.map((item: {
      name: string; full_name: string; description: string | null;
      html_url: string; stargazers_count: number; language: string | null;
      updated_at: string; owner: { login: string }; topics: string[];
    }) => (
      `**${item.full_name}** (${item.stargazers_count} stars)\n` +
      `Language: ${item.language || "Unknown"}\n` +
      `Description: ${item.description || "No description"}\n` +
      `Topics: ${(item.topics || []).join(", ") || "none"}\n` +
      `URL: ${item.html_url}\n` +
      `Last updated: ${item.updated_at}`
    ));
    return `Found ${items.length} GitHub repos:\n\n${repos.join("\n---\n")}`;
  } catch (e) {
    return `GitHub search error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolGetGitHubReadme(owner: string, repo: string): Promise<string> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3.raw",
        "User-Agent": "Mozilla/5.0 (compatible; PRISMA/1.0)",
      },
    });
    if (!response.ok) return `Could not fetch README for ${owner}/${repo} (${response.status}).`;
    const text = await response.text();
    return `README for ${owner}/${repo}:\n\n${text.slice(0, 3000)}${text.length > 3000 ? "\n...(truncated)" : ""}`;
  } catch (e) {
    return `GitHub README error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolGetGitHubContents(owner: string, repo: string, path = ""): Promise<string> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (compatible; PRISMA/1.0)",
      },
    });
    if (!response.ok) return `Could not fetch contents for ${owner}/${repo}/${path} (${response.status}).`;
    const data = await response.json();
    if (Array.isArray(data)) {
      const listing = data.map((item: { name: string; type: string; size: number }) =>
        `[${item.type}] ${item.name} (${item.size} bytes)`
      );
      return `Contents of ${owner}/${repo}/${path || "root"}:\n\n${listing.join("\n")}`;
    }
    if (data.content && data.encoding === "base64") {
      const decoded = atob(data.content.replace(/\n/g, ""));
      return `File: ${data.name} (${data.size} bytes)\n\n${decoded.slice(0, 3000)}${decoded.length > 3000 ? "\n...(truncated)" : ""}`;
    }
    return `Contents: ${JSON.stringify(data).slice(0, 1000)}`;
  } catch (e) {
    return `GitHub contents error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolSearchNews(query: string, maxResults = 8): Promise<string> {
  try {
    const feedUrl = "https://news.google.com/rss/search?q=" + encodeURIComponent(query) + "&hl=en-US&gl=US&ceid=US:en";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    clearTimeout(timeout);
    if (!response.ok) return "News search failed.";
    const xml = await response.text();
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi);
    if (!items) return "No news articles found.";

    const articles: string[] = [];
    for (const itemXml of items.slice(0, maxResults)) {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const title = titleMatch ? titleMatch[1].trim() : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const source = sourceMatch ? sourceMatch[1].trim() : "Google News";
      const date = dateMatch ? dateMatch[1].trim() : "";
      articles.push(`**${title}**\nSource: ${source}\nDate: ${date}\nLink: ${link}`);
    }
    return `Found ${articles.length} news articles:\n\n${articles.join("\n---\n")}`;
  } catch (e) {
    return `News search error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolFetchUrl(url: string): Promise<string> {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "Invalid URL. Must start with http:// or https://";
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Zeno/1.0)" },
    });
    clearTimeout(timeout);
    if (!response.ok) return `Fetch failed: ${response.status}`;
    const text = await response.text();
    const stripped = text.replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return `Content from ${url}:\n\n${stripped.slice(0, 4000)}${stripped.length > 4000 ? "\n...(truncated)" : ""}`;
  } catch (e) {
    return `Fetch error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolFetchArxivPdf(arxivId: string): Promise<string> {
  try {
    const absUrl = `https://arxiv.org/abs/${arxivId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(absUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Zeno/1.0)" },
    });
    clearTimeout(timeout);
    if (!response.ok) return `Could not fetch arXiv page for ${arxivId} (${response.status}).`;
    const html = await response.text();
    const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const abstractMatch = stripped.match(/Abstract:\s*(.*?)(?:Comments:|Subjects:|MSC|Cite as|$)/i);
    const abstract = abstractMatch ? abstractMatch[1].trim().slice(0, 2000) : stripped.slice(0, 2000);
    return `arXiv paper ${arxivId} details:\n\nAbstract: ${abstract}\n\nFull page: https://arxiv.org/abs/${arxivId}\nPDF: https://arxiv.org/pdf/${arxivId}.pdf`;
  } catch (e) {
    return `arXiv fetch error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolSearchReddit(query: string, limit = 5): Promise<string> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=month&limit=${limit}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Zeno/1.0)" },
    });
    if (!response.ok) return "Reddit search failed.";
    const data = await response.json();
    const posts = (data?.data?.children || []) as Array<{ data: { title: string; permalink: string; score: number; num_comments: number; subreddit: string; selftext?: string } }>;
    if (posts.length === 0) return "No Reddit posts found.";

    const results = posts.map((p) => {
      const d = p.data;
      const snippet = (d.selftext || "").slice(0, 200);
      return `**${d.title}**\nr/${d.subreddit} | ${d.score} points | ${d.num_comments} comments\nLink: https://www.reddit.com${d.permalink}${snippet ? `\nSnippet: ${snippet}` : ""}`;
    });
    return `Found ${results.length} Reddit posts:\n\n${results.join("\n---\n")}`;
  } catch (e) {
    return `Reddit search error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolFetchYouTube(url: string): Promise<string> {
  try {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
    if (!videoIdMatch) return `Could not extract YouTube video ID from URL: ${url}`;
    const videoId = videoIdMatch[1];

    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Zeno/1.0)" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return `Could not fetch YouTube video info for ${videoId}. The video may be private or unavailable.`;
    }

    const data = await response.json();
    const title = data.title || "Unknown title";
    const author = data.author_name || "Unknown channel";
    const thumbnail = data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const transcriptUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageController = new AbortController();
    const pageTimeout = setTimeout(() => pageController.abort(), 12000);
    const pageResponse = await fetch(transcriptUrl, {
      signal: pageController.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    clearTimeout(pageTimeout);

    let description = "";
    if (pageResponse.ok) {
      const html = await pageResponse.text();
      const descMatch = html.match(/"shortDescription":"([^"]*)"/);
      if (descMatch) description = descMatch[1].replace(/\\n/g, "\n").slice(0, 1000);
      const tagsMatch = html.match(/"keywords":\[([^\]]*)\]/);
      const tags = tagsMatch ? tagsMatch[1].replace(/"/g, "").split(",").filter(Boolean).slice(0, 10) : [];
      const viewMatch = html.match(/"viewCount":"(\d+)"/);
      const views = viewMatch ? viewMatch[1] : "unknown";
      const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
      const lengthSec = lengthMatch ? parseInt(lengthMatch[1]) : 0;
      const lengthStr = lengthSec > 0 ? `${Math.floor(lengthSec / 60)}:${String(lengthSec % 60).padStart(2, "0")}` : "unknown";

      return `YouTube Video Found:\n\n**Title:** ${title}\n**Channel:** ${author}\n**Views:** ${parseInt(views).toLocaleString()}\n**Duration:** ${lengthStr}\n**Thumbnail:** ${thumbnail}\n**Watch:** ${watchUrl}\n${tags.length > 0 ? `**Tags:** ${tags.join(", ")}\n` : ""}${description ? `\n**Description:**\n${description}` : ""}`;
    }

    return `YouTube Video Found:\n\n**Title:** ${title}\n**Channel:** ${author}\n**Thumbnail:** ${thumbnail}\n**Watch:** ${watchUrl}${description ? `\n**Description:** ${description.slice(0, 500)}` : ""}`;
  } catch (e) {
    return `YouTube fetch error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

async function toolGetBookmarks(supabaseUrl: string, supabaseServiceKey: string): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false }).limit(20);
    if (error) return `Error reading bookmarks: ${error.message}`;
    if (!data || data.length === 0) return "No bookmarks saved yet.";
    const listing = data.map((b: { title: string; source_name: string | null; link: string; category: string | null }) =>
      `**${b.title}**\nSource: ${b.source_name || "Unknown"} | Category: ${b.category || "N/A"}\nLink: ${b.link}`
    );
    return `User has ${data.length} bookmarks:\n\n${listing.join("\n---\n")}`;
  } catch (e) {
    return `Bookmarks error: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

// ─── Tool definitions for the AI ───

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "search_arxiv",
      description: "Search arXiv for research papers by keyword. Returns titles, authors, abstracts, and links.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Search query for academic papers" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_arxiv_paper",
      description: "Fetch the full abstract and details of a specific arXiv paper by its ID (e.g. 2401.12345).",
      parameters: {
        type: "object",
        properties: { arxiv_id: { type: "string", description: "The arXiv paper ID" } },
        required: ["arxiv_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_github",
      description: "Search GitHub for repositories by keyword. Returns repo names, stars, descriptions, and topics.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Search query for repos" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_github_readme",
      description: "Fetch the README file of a GitHub repository to understand what the project does.",
      parameters: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner (e.g. facebook)" },
          repo: { type: "string", description: "Repository name (e.g. react)" },
        },
        required: ["owner", "repo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_github_contents",
      description: "List files and directories in a GitHub repo, or fetch a specific file's content. Use this to review code.",
      parameters: {
        type: "object",
        properties: {
          owner: { type: "string", description: "Repository owner" },
          repo: { type: "string", description: "Repository name" },
          path: { type: "string", description: "Path within repo (empty string for root, e.g. 'src' for src dir)", default: "" },
        },
        required: ["owner", "repo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_news",
      description: "Search current news articles via Google News RSS. Returns titles, sources, dates, and links.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "News search query" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_url",
      description: "Fetch and read the text content of any web page URL. Use this to read articles, documentation, or any web content.",
      parameters: {
        type: "object",
        properties: { url: { type: "string", description: "The full URL to fetch" } },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_reddit",
      description: "Search Reddit for discussions on a topic. Returns post titles, scores, comment counts, and snippets.",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Search query" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_youtube",
      description: "Fetch details about a YouTube video from its URL. Returns title, channel, views, duration, description, and tags. Use this when the user pastes a YouTube link.",
      parameters: {
        type: "object",
        properties: { url: { type: "string", description: "The YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)" } },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_bookmarks",
      description: "Get the user's saved bookmarks from Zeno. No parameters needed.",
      parameters: { type: "object", properties: {} },
    },
  },
];

// ─── Tool executor ───

async function executeTool(name: string, args: Record<string, unknown>, supabaseUrl: string, supabaseServiceKey: string): Promise<string> {
  switch (name) {
    case "search_arxiv":
      return await toolSearchArxiv(String(args.query || ""));
    case "fetch_arxiv_paper":
      return await toolFetchArxivPdf(String(args.arxiv_id || ""));
    case "search_github":
      return await toolSearchGitHub(String(args.query || ""));
    case "get_github_readme":
      return await toolGetGitHubReadme(String(args.owner || ""), String(args.repo || ""));
    case "get_github_contents":
      return await toolGetGitHubContents(String(args.owner || ""), String(args.repo || ""), String(args.path || ""));
    case "search_news":
      return await toolSearchNews(String(args.query || ""));
    case "fetch_url":
      return await toolFetchUrl(String(args.url || ""));
    case "search_reddit":
      return await toolSearchReddit(String(args.query || ""));
    case "fetch_youtube":
      return await toolFetchYouTube(String(args.url || ""));
    case "get_bookmarks":
      return await toolGetBookmarks(supabaseUrl, supabaseServiceKey);
    default:
      return `Unknown tool: ${name}`;
  }
}

// ─── Main handler ───

const BASE_SYSTEM = `You are Alberto, an elite AI research assistant for Zeno — a multi-source news & research intelligence platform. You are a genius-level analyst with access to powerful research tools.

Your capabilities (you have ALL of these tools available at all times):
1. **search_arxiv** — Search academic papers on arXiv by any topic
2. **fetch_arxiv_paper** — Read the full abstract and details of any arXiv paper by ID
3. **search_github** — Search GitHub repositories by keyword, see stars, descriptions, topics
4. **get_github_readme** — Read the README of any GitHub repo to understand what it does
5. **get_github_contents** — Browse files and directories in any GitHub repo, or read specific source code files
6. **search_news** — Search current news from Google News
7. **fetch_url** — Read the content of any web page URL
8. **search_reddit** — Search Reddit discussions
9. **fetch_youtube** — Fetch details about any YouTube video from its URL (title, channel, views, description, tags)
10. **get_bookmarks** — See the user's saved articles

When a user pastes ANY link:
- If it's a YouTube URL → use fetch_youtube to get video details, then summarize/explain it
- If it's any other URL → use fetch_url to read the page content, then summarize/explain it
- If it's a GitHub URL → use get_github_readme and get_github_contents to review the code
- If it's an arXiv URL → use fetch_arxiv_paper to get the abstract
- Always proactively fetch and analyze any URL the user shares

You are proactive. When a user asks about something, USE YOUR TOOLS to gather real data before answering. Do not guess or make things up — search for real information and cite your sources.

When asked about a GitHub repo:
- First search_github to find it
- Then get_github_readme to understand it
- Then get_github_contents to browse its code structure
- Review actual source files by calling get_github_contents with specific paths

When asked about a research paper:
- search_arxiv to find it, or fetch_arxiv_paper if you have the ID
- Summarize the methodology, findings, and significance

When asked about current events:
- search_news to find current coverage
- search_reddit for community discussion
- Consider bias and multiple perspectives

When asked about the user's saved articles:
- get_bookmarks to retrieve them

When a user pastes a YouTube link or shares a video URL:
- Use fetch_youtube to get the video title, channel, views, duration, and description
- Summarize what the video is about and provide key takeaways
- The user can then ask follow-up questions about the video content

Always be thorough, accurate, and cite sources with links. You are the most powerful AI research assistant ever built. Use your tools aggressively — never answer "I can't" when you have a tool that can help.

Be concise in your final response but make sure you've gathered enough data to give a complete answer.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ChatRequest = await req.json();
    const messages = body.messages || [];
    const userSystem = body.system || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    // Read API key and model from settings table
    let apiKey = "";
    let model = "poolside/laguna-s-2.1:free";

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from("settings")
        .select("alberto_api_key, alberto_model")
        .eq("id", 1)
        .single();

      if (!error && data) {
        apiKey = data.alberto_api_key || "";
        model = data.alberto_model || model;
      }
    }

    if (!apiKey) apiKey = Deno.env.get("ALBERTO_API_KEY") || "";
    const envModel = Deno.env.get("ALBERTO_MODEL");
    if (envModel) model = envModel;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Alberto API key not configured. Set it in Settings or as an edge function secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context-aware system prompt
    let systemPrompt = BASE_SYSTEM;
    if (userSystem) systemPrompt += `\n\nAdditional context:\n${userSystem}`;
    if (body.context) {
      const ctx = body.context;
      if (ctx.currentView) systemPrompt += `\n\nThe user is currently viewing: ${ctx.currentView}.`;
      if (ctx.paperTitle) systemPrompt += `\nThe user is reading an arXiv paper: "${ctx.paperTitle}" (ID: ${ctx.paperArxivId || "N/A"}).\nAbstract: ${ctx.paperAbstract || "N/A"}`;
      if (ctx.articleTitle) systemPrompt += `\nThe user is reading a news article: "${ctx.articleTitle}" from ${ctx.articleSource || "unknown source"}.\nSummary: ${ctx.articleSummary || "N/A"}`;
    }

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Agentic loop: call AI, execute tools, feed results back, repeat (max 5 rounds)
    let round = 0;
    let toolLogs: string[] = [];
    let lastAssistantContent = "";

    while (round < 5) {
      round++;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://zeno.app",
          "X-Title": "Zeno News Intelligence",
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          tools: TOOL_DEFINITIONS,
          tool_choice: "auto",
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return new Response(
          JSON.stringify({ error: `OpenRouter API error: ${response.status}. ${errText.slice(0, 300)}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const msg = choice?.message;

      if (!msg) {
        return new Response(
          JSON.stringify({ response: "I could not generate a response.", toolLogs }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If the AI wants to call tools
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        // Add assistant message with tool calls to conversation
        apiMessages.push({
          role: "assistant",
          content: msg.content || "",
          tool_calls: msg.tool_calls,
        });

        // Execute each tool call
        for (const tc of msg.tool_calls) {
          const toolName = tc.function.name;
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments || "{}");
          } catch { /* empty args */ }

          toolLogs.push(`Using tool: ${toolName}(${JSON.stringify(args).slice(0, 80)})`);

          const result = await executeTool(toolName, args, supabaseUrl, supabaseServiceKey);

          apiMessages.push({
            role: "tool",
            content: result,
            tool_call_id: tc.id,
          });
        }

        // Continue the loop to let AI process tool results
        continue;
      }

      // No tool calls — this is the final answer
      lastAssistantContent = msg.content || "I could not generate a response.";
      break;
    }

    if (!lastAssistantContent) {
      lastAssistantContent = "I've gathered information from multiple sources but reached my processing limit. Here's what I found — please ask me a more specific question about the results.";
    }

    return new Response(
      JSON.stringify({ response: lastAssistantContent, toolLogs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
