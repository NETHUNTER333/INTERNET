import type { AgentResearchResult } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function agentResearch(
  query: string,
  sources?: { reddit?: boolean; arxiv?: boolean; github?: boolean; news?: boolean; twitter?: boolean }
): Promise<AgentResearchResult> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ query, sources, limit: 10 }),
  });

  if (!response.ok) {
    throw new Error(`Research failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) throw new Error(data.error);

  return data as AgentResearchResult;
}
