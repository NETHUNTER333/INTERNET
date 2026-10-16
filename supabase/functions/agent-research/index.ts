const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  subreddit: string;
  created_utc: number;
  selftext?: string;
  preview?: string;
}

interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  link: string;
  categories: string[];
}

interface GitHubResult {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  owner: { login: string; avatar_url: string };
}

interface ResearchResult {
  query: string;
  reddit: {
    title: string;
    url: string;
    score: number;
    comments: number;
    subreddit: string;
    publishedAt: string;
    snippet: string;
  }[];
  arxiv: {
    title: string;
    authors: string;
    summary: string;
    link: string;
    publishedAt: string;
    categories: string;
  }[];
  github: {
    name: string;
    fullName: string;
    description: string;
    url: string;
    stars: number;
    language: string;
    updatedAt: string;
    owner: string;
    ownerAvatar: string;
  }[];
  news: {
    title: string;
    link: string;
    snippet: string;
    source: string;
    publishedAt: string;
  }[];
}

async function searchReddit(query: string, limit: number): Promise<ResearchResult["reddit"]> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=month&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GroundTruth/1.0; +https://groundtruth.app)",
      },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const posts = (data?.data?.children || []) as Array<{ data: RedditPost }>;

    return posts.map((p) => ({
      title: p.data.title,
      url: p.data.url.startsWith("http") ? p.data.url : `https://www.reddit.com${p.data.permalink}`,
      score: p.data.score,
      comments: p.data.num_comments,
      subreddit: p.data.subreddit,
      publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
      snippet: (p.data.selftext || "").slice(0, 200) || `r/${p.data.subreddit} - ${p.data.score} points`,
    }));
  } catch {
    return [];
  }
}

async function searchArxiv(query: string, limit: number): Promise<ResearchResult["arxiv"]> {
  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}&sortBy=relevance`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GroundTruth/1.0; +https://groundtruth.app)",
      },
    });
    if (!response.ok) return [];

    const xml = await response.text();
    const entries: ResearchResult["arxiv"] = [];
    const entryRegex = /<entry[\s>][\s\S]*?<\/entry>/gi;
    const entryMatches = xml.match(entryRegex);

    if (!entryMatches) return [];

    for (const entryXml of entryMatches) {
      const idMatch = entryXml.match(/<id>([\s\S]*?)<\/id>/i);
      const titleMatch = entryXml.match(/<title>([\s\S]*?)<\/title>/i);
      const summaryMatch = entryXml.match(/<summary>([\s\S]*?)<\/summary>/i);
      const publishedMatch = entryXml.match(/<published>([\s\S]*?)<\/published>/i);
      const authorMatches = entryXml.matchAll(/<name>([\s\S]*?)<\/name>/gi);
      const categoryMatches = entryXml.matchAll(/<category[^>]*term="([^"]+)"/gi);

      const authors = Array.from(authorMatches).map((m) => m[1].trim()).slice(0, 5);
      const categories = Array.from(categoryMatches).map((m) => m[1].trim()).slice(0, 3);

      const id = idMatch ? idMatch[1].trim() : "";
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";
      const summary = summaryMatch ? summaryMatch[1].replace(/\s+/g, " ").trim() : "";

      if (title && id) {
        entries.push({
          title,
          authors: authors.join(", "),
          summary: summary.slice(0, 300),
          link: id,
          publishedAt: publishedMatch ? publishedMatch[1].trim() : new Date().toISOString(),
          categories: categories.join(", "),
        });
      }
    }

    return entries;
  } catch {
    return [];
  }
}

async function searchGitHub(query: string, limit: number): Promise<ResearchResult["github"]> {
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (compatible; GroundTruth/1.0)",
      },
    });
    if (!response.ok) return [];

    const data = await response.json();
    const items = (data?.items || []) as GitHubResult[];

    return items.map((item) => ({
      name: item.name,
      fullName: item.full_name,
      description: item.description || "No description",
      url: item.html_url,
      stars: item.stargazers_count,
      language: item.language || "Unknown",
      updatedAt: item.updated_at,
      owner: item.owner.login,
      ownerAvatar: item.owner.avatar_url,
    }));
  } catch {
    return [];
  }
}

async function searchNewsRss(query: string, limit: number): Promise<ResearchResult["news"]> {
  try {
    const newsFeeds = [
      { url: "https://news.google.com/rss/search?q=" + encodeURIComponent(query) + "&hl=en-US&gl=US&ceid=US:en", source: "Google News" },
    ];

    const results: ResearchResult["news"] = [];

    for (const feed of newsFeeds) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const response = await fetch(feed.url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        clearTimeout(timeout);

        if (!response.ok) continue;

        const xml = await response.text();
        const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
        const items = xml.match(itemRegex);

        if (!items) continue;

        for (const itemXml of items.slice(0, limit)) {
          const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
          const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
          const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
          const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
          const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);

          const title = titleMatch ? titleMatch[1].trim() : "";
          const link = linkMatch ? linkMatch[1].trim() : "";
          const desc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";
          const source = sourceMatch ? sourceMatch[1].trim() : feed.source;

          if (title && link) {
            results.push({
              title,
              link,
              snippet: desc.slice(0, 200),
              source,
              publishedAt: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
            });
          }
        }
      } catch {
        // skip this feed
      }
    }

    return results.slice(0, limit);
  } catch {
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { query, sources } = body;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const enabledSources = sources || { reddit: true, arxiv: true, github: true, news: true };
    const limit = body.limit || 10;

    const tasks: Promise<unknown>[] = [];
    const taskNames: string[] = [];

    if (enabledSources.reddit) {
      tasks.push(searchReddit(query, limit));
      taskNames.push("reddit");
    }
    if (enabledSources.arxiv) {
      tasks.push(searchArxiv(query, limit));
      taskNames.push("arxiv");
    }
    if (enabledSources.github) {
      tasks.push(searchGitHub(query, limit));
      taskNames.push("github");
    }
    if (enabledSources.news) {
      tasks.push(searchNewsRss(query, limit));
      taskNames.push("news");
    }

    const results = await Promise.allSettled(tasks);

    const researchResult: ResearchResult = {
      query,
      reddit: [],
      arxiv: [],
      github: [],
      news: [],
    };

    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        const key = taskNames[i] as keyof ResearchResult;
        (researchResult[key] as unknown[]) = r.value;
      }
    });

    return new Response(
      JSON.stringify(researchResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
