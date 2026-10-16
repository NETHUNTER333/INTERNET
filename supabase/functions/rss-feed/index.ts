const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FeedItem {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
  thumbnail?: string;
}

interface SourceRequest {
  url: string;
  sourceName: string;
  category: string;
  bias: string;
}

function decodeXmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&#8217;": "'",
    "&#8216;": "'",
    "&#8220;": '"',
    "&#8221;": '"',
  };
  let decoded = text;
  for (const [entity, char] of Object.entries(entities)) {
    decoded = decoded.replaceAll(entity, char);
  }
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
  return decoded.trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractThumbnail(itemXml: string): string | undefined {
  const mediaContent = itemXml.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaContent) return mediaContent[1];

  const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaThumbnail) return mediaThumbnail[1];

  const enclosure = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i);
  if (enclosure) return enclosure[1];

  const contentMatch = itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i) ||
    itemXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i) ||
    itemXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
    itemXml.match(/<description>([\s\S]*?)<\/description>/i);
  if (contentMatch) {
    const imgMatch = contentMatch[1].match(/<img[^>]*src="([^"]+)"/i);
    if (imgMatch) return imgMatch[1];
  }

  return undefined;
}

interface ParsedItem {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
  thumbnail?: string;
}

function parseFeedXml(xml: string): ParsedItem[] {
  const items: ParsedItem[] = [];

  // RSS <item> tags
  const itemRegex = /<item[\s>][\s\S]*?<\/item>/gi;
  const itemMatches = xml.match(itemRegex);

  if (itemMatches) {
    for (const itemXml of itemMatches) {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i) ||
        itemXml.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i) ||
        itemXml.match(/<link>([^<]+)/i);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i) ||
        itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/i);
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) ||
        itemXml.match(/<published>([\s\S]*?)<\/published>/i) ||
        itemXml.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i) ||
        itemXml.match(/<updated>([\s\S]*?)<\/updated>/i);

      const title = titleMatch ? decodeXmlEntities(stripHtml(titleMatch[1])) : "";
      let link = "";
      if (linkMatch) {
        link = (linkMatch[1] || linkMatch[0] || "").trim();
        // Some <link> tags have whitespace/newlines
        link = link.replace(/^\s+|\s+$/g, "");
      }
      const description = descMatch ? decodeXmlEntities(stripHtml(descMatch[1])) : "";
      const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      const thumbnail = extractThumbnail(itemXml);

      if (title && link) {
        items.push({
          title,
          link: link.startsWith("http") ? link : `https://${link}`,
          summary: description.slice(0, 400),
          publishedAt,
          thumbnail,
        });
      }
    }
  }

  // Atom <entry> tags (YouTube uses these)
  const entryRegex = /<entry[\s>][\s\S]*?<\/entry>/gi;
  const entryMatches = xml.match(entryRegex);

  if (entryMatches) {
    for (const entryXml of entryMatches) {
      const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = entryXml.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i) ||
        entryXml.match(/<link[^>]*href="([^"]+)"/i);
      const descMatch = entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) ||
        entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
      const dateMatch = entryXml.match(/<published>([\s\S]*?)<\/published>/i) ||
        entryXml.match(/<updated>([\s\S]*?)<\/updated>/i);

      const title = titleMatch ? decodeXmlEntities(stripHtml(titleMatch[1])) : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const description = descMatch ? decodeXmlEntities(stripHtml(descMatch[1])) : "";
      const publishedAt = dateMatch ? dateMatch[1].trim() : new Date().toISOString();
      const thumbnail = extractThumbnail(entryXml);

      if (title && link) {
        items.push({
          title,
          link,
          summary: description.slice(0, 400),
          publishedAt,
          thumbnail,
        });
      }
    }
  }

  return items;
}

async function fetchFeed(source: SourceRequest): Promise<{
  sourceName: string;
  category: string;
  bias: string;
  items: ParsedItem[];
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(source.url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, */*",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { sourceName: source.sourceName, category: source.category, bias: source.bias, items: [], error: `HTTP ${response.status}` };
    }

    const text = await response.text();
    const items = parseFeedXml(text).slice(0, 20);

    return { sourceName: source.sourceName, category: source.category, bias: source.bias, items };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Unknown error";
    return { sourceName: source.sourceName, category: source.category, bias: source.bias, items: [], error: errMsg };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const sources: SourceRequest[] = body.sources;

    if (!sources || !Array.isArray(sources)) {
      return new Response(
        JSON.stringify({ error: "Missing 'sources' array in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = await Promise.allSettled(
      sources.map((s) => fetchFeed(s))
    );

    const feeds = results.map((r) =>
      r.status === "fulfilled"
        ? r.value
        : { sourceName: "", category: "", bias: "", items: [], error: "rejected" }
    );

    const totalItems = feeds.reduce((sum, f) => sum + f.items.length, 0);

    return new Response(
      JSON.stringify({ feeds, totalItems }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
