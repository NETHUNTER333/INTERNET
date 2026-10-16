import type { ArxivPaper } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const ARXIV_CATEGORIES = [
  { label: 'All', query: '' },
  { label: 'AI / ML', query: 'cat:cs.AI OR cat:cs.LG OR cat:cs.CL' },
  { label: 'Computer Science', query: 'cat:cs.*' },
  { label: 'Physics', query: 'cat:physics.*' },
  { label: 'Mathematics', query: 'cat:math.*' },
  { label: 'Biology', query: 'cat:q-bio.*' },
  { label: 'Economics', query: 'cat:econ.*' },
  { label: 'Statistics', query: 'cat:stat.*' },
  { label: 'Quantum', query: 'cat:quant-ph' },
  { label: 'Neural Nets', query: 'abs:neural network' },
];

export interface ArxivPaperRich extends ArxivPaper {
  arxivId: string;
  authorList: string[];
  categoryList: string[];
  citationCount?: number;
  githubRepos?: { name: string; fullName: string; url: string; stars: number; description: string; language: string; owner: string; ownerAvatar: string }[];
  pdfUrl?: string;
}

interface RssFeedResponse {
  feeds: {
    sourceName: string;
    category: string;
    bias: string;
    items: {
      title: string;
      link: string;
      summary: string;
      publishedAt: string;
      thumbnail?: string;
    }[];
  }[];
}

function extractArxivId(link: string): string {
  const match = link.match(/abs\/([\d.]+|[\w]+\/[\d]+)/);
  return match ? match[1] : link.split('/').pop() || '';
}

async function fetchCitationCounts(arxivIds: string[]): Promise<Record<string, number>> {
  if (arxivIds.length === 0) return {};
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        ids: arxivIds.map((id) => `ARXIV:${id}`),
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) return {};
    const data = await response.json();
    const counts: Record<string, number> = {};
    if (Array.isArray(data)) {
      for (let i = 0; i < arxivIds.length; i++) {
        const paper = data[i];
        if (paper && paper.citationCount !== undefined) {
          counts[arxivIds[i]] = paper.citationCount;
        }
      }
    }
    return counts;
  } catch {
    return {};
  }
}

async function searchGithubForPaper(title: string): Promise<ArxivPaperRich['githubRepos']> {
  try {
    const cleanTitle = title.replace(/[^\w\s]/g, '').slice(0, 80);
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(cleanTitle)}&sort=stars&order=desc&per_page=3`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const data = await response.json();

    return (data.items || []).map((item: {
      name: string; full_name: string; html_url: string; stargazers_count: number;
      description: string | null; language: string | null;
      owner: { login: string; avatar_url: string };
    }) => ({
      name: item.name,
      fullName: item.full_name,
      url: item.html_url,
      stars: item.stargazers_count,
      description: item.description || 'No description',
      language: item.language || 'Unknown',
      owner: item.owner.login,
      ownerAvatar: item.owner.avatar_url,
    }));
  } catch {
    return [];
  }
}

export async function fetchArxivPapers(searchQuery?: string, categoryFilter?: string): Promise<ArxivPaperRich[]> {
  let query: string;
  if (searchQuery && searchQuery.trim()) {
    query = `all:${encodeURIComponent(searchQuery.trim())}`;
  } else if (categoryFilter) {
    query = encodeURIComponent(categoryFilter);
  } else {
    query = 'cat:cs.*';
  }

  const arxivUrl = `http://export.arxiv.org/api/query?search_query=${query}&start=0&max_results=20&sortBy=submittedDate&sortOrder=descending`;

  // Fetch directly from arXiv (Atom XML) via our RSS proxy
  const response = await fetch(`${SUPABASE_URL}/functions/v1/rss-feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      sources: [{
        url: arxivUrl,
        sourceName: 'arXiv',
        category: 'science',
        bias: 'center',
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch arXiv: ${response.status}`);
  }

  const data: RssFeedResponse = await response.json();

  const papers: ArxivPaperRich[] = [];
  for (const feed of data.feeds) {
    for (const item of feed.items) {
      const arxivId = extractArxivId(item.link);
      const summary = item.summary || '';

      // arXiv Atom entries have authors in the summary or we can try to parse
      // The RSS proxy strips XML tags, so authors may be in the description
      const authorMatch = summary.match(/Authors?:\s*(.+?)(?:\n|Categories:|$)/i);
      const authors = authorMatch ? authorMatch[1].trim() : '';
      const authorList = authors ? authors.split(',').map((a) => a.trim()).filter(Boolean) : [];

      const catMatch = summary.match(/Categories:\s*(.+)/i);
      const categories = catMatch ? catMatch[1].trim() : '';
      const categoryList = categories ? categories.split(/\s+/).filter(Boolean) : [];

      papers.push({
        id: item.link,
        arxivId,
        title: item.title.replace(/\s+/g, ' ').trim(),
        authors,
        authorList,
        summary: summary.slice(0, 300),
        link: item.link,
        publishedAt: item.publishedAt,
        categories,
        categoryList,
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
        citationCount: undefined,
        githubRepos: undefined,
      });
    }
  }

  // Fetch citation counts in bulk
  const arxivIds = papers.map((p) => p.arxivId).filter(Boolean);
  if (arxivIds.length > 0) {
    const citationCounts = await fetchCitationCounts(arxivIds);
    for (const paper of papers) {
      if (paper.arxivId && citationCounts[paper.arxivId] !== undefined) {
        paper.citationCount = citationCounts[paper.arxivId];
      }
    }
  }

  return papers;
}

export async function loadGithubForPaper(title: string): Promise<NonNullable<ArxivPaperRich['githubRepos']>> {
  return await searchGithubForPaper(title) ?? [];
}

export function formatArxivDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = Date.now();
    const diff = Math.max(0, now - d.getTime());
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}
