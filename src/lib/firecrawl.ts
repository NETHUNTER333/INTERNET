import type { DeepReadProvider } from '@/hooks/useSettings';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface DeepReadSearchResult {
  title: string;
  url: string;
  description: string;
  markdown?: string;
}

export async function deepReadSearch(
  apiKey: string,
  query: string,
  provider: DeepReadProvider
): Promise<DeepReadSearchResult[]> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/firecrawl-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: 'search', provider, apiKey, query }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Search failed (${response.status})`);
  }

  const data = await response.json();

  if (data.error) throw new Error(data.error);

  const results: DeepReadSearchResult[] = (data.data || []).map((item: Record<string, unknown>) => ({
    title: (item.title as string) || 'Untitled',
    url: (item.url as string) || '',
    description: (item.description as string) || '',
  }));

  return results;
}

export async function deepReadScrape(
  apiKey: string,
  url: string,
  provider: DeepReadProvider
): Promise<{ markdown: string; title?: string }> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/firecrawl-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action: 'scrape', provider, apiKey, url }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Scrape failed (${response.status})`);
  }

  const data = await response.json();

  if (data.error) throw new Error(data.error);

  const scraped = data.data || {};
  return {
    markdown: (scraped.markdown as string) || '',
    title: (scraped.title as string) || undefined,
  };
}

// Backward-compatible wrappers
export const firecrawlSearch = (apiKey: string, query: string) => deepReadSearch(apiKey, query, 'firecrawl');
export const firecrawlScrape = (apiKey: string, url: string) => deepReadScrape(apiKey, url, 'firecrawl');

// Re-export the old type name for compatibility
export type FirecrawlSearchResult = DeepReadSearchResult;
