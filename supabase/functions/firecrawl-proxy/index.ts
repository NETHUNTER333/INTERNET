// Proxy for TinyFish and Firecrawl APIs - supports both providers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, provider, apiKey, query, url } = body;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key is required. Add a Firecrawl or TinyFish key in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (provider === "tinyfish") {
      return await handleTinyFish(action, apiKey, query, url);
    } else {
      return await handleFirecrawl(action, apiKey, query, url);
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleTinyFish(
  action: string,
  apiKey: string,
  query?: string,
  url?: string
): Promise<Response> {
  if (action === "search") {
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required for search action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchUrl = `https://api.search.tinyfish.ai/?q=${encodeURIComponent(query)}&limit=10`;
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Accept": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || data.message || `TinyFish search returned ${response.status}`;
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize results to match Firecrawl shape so frontend doesn't need to care
    const results = (data.results || data.data || []).map((item: Record<string, unknown>) => ({
      title: (item.title as string) || "Untitled",
      url: (item.url as string) || (item.link as string) || "",
      description: (item.description as string) || (item.snippet as string) || "",
    }));

    return new Response(
      JSON.stringify({ data: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (action === "scrape") {
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required for scrape action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.fetch.tinyfish.ai", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: [url],
        format: "markdown",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || data.message || `TinyFish fetch returned ${response.status}`;
      return new Response(
        JSON.stringify({ error: errorMsg }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize: TinyFish returns array of results
    const result = (data.results || [])[0] || data;
    const markdown = (result.text as string) || (result.markdown as string) || (result.content as string) || "";
    const title = (result.title as string) || undefined;

    return new Response(
      JSON.stringify({ data: { markdown, title } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ error: "Invalid action. Use 'search' or 'scrape'." }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleFirecrawl(
  action: string,
  apiKey: string,
  query?: string,
  url?: string
): Promise<Response> {
  let endpoint: string;
  let payload: Record<string, unknown>;

  if (action === "search") {
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query is required for search action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    endpoint = "https://api.firecrawl.dev/v1/search";
    payload = { query, limit: 10, scrapeOptions: { formats: ["markdown"] } };
  } else if (action === "scrape") {
    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required for scrape action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    endpoint = "https://api.firecrawl.dev/v1/scrape";
    payload = { url, formats: ["markdown"] };
  } else {
    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'search' or 'scrape'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Firecrawl API returned ${response.status}`;
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
