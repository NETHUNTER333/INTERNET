import { supabase } from '@/lib/supabase';
import type {
  VaultEntry,
  SourceRecord,
  ExtractedClaim,
  DurableMemory,
  PlannerActionItem,
  WeeklyDistill,
} from '@/types';

// Storage helper keys
const STORAGE_PREFIX = 'zeno_db_';

function readLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn('Failed to write vault local storage:', err);
  }
}

// 1. Vault Entries API
export async function getVaultEntries(filter?: { monthKey?: string; projectId?: string }): Promise<VaultEntry[]> {
  try {
    let query = supabase.from('vault_entries').select('*').order('created_at', { ascending: false });
    if (filter?.monthKey) query = query.eq('monthKey', filter.monthKey);
    if (filter?.projectId) query = query.eq('projectId', filter.projectId);
    const { data, error } = await query;
    if (!error && data && data.length > 0) return data as VaultEntry[];
  } catch {
    // Fallback to local storage
  }

  let local = readLocalStorage<VaultEntry[]>('vault_entries', [
    {
      id: 'entry-1',
      type: 'thought',
      content: 'Refining Distill multi-agent workflow architecture and local vault persistence',
      monthKey: '2026-12',
      createdAt: new Date().toISOString(),
      projectId: 'proj-ai',
    },
    {
      id: 'entry-2',
      type: 'url',
      content: 'Analyzed arXiv paper on agentic workflow distillation',
      monthKey: '2026-12',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sourceUrl: 'https://arxiv.org/abs/2401.00001',
      projectId: 'proj-ai',
    },
  ]);

  if (filter?.monthKey) local = local.filter((e) => e.monthKey === filter.monthKey);
  if (filter?.projectId) local = local.filter((e) => e.projectId === filter.projectId);
  return local;
}

export async function addVaultEntry(entry: Omit<VaultEntry, 'id' | 'createdAt'>): Promise<VaultEntry> {
  const newEntry: VaultEntry = {
    ...entry,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('vault_entries').insert(newEntry);
  } catch {
    // Local fallback
  }

  const list = readLocalStorage<VaultEntry[]>('vault_entries', []);
  writeLocalStorage('vault_entries', [newEntry, ...list]);
  return newEntry;
}

// 2. Sources & Claims API (Claims-first Provenance)
export async function saveSourceWithClaims(
  source: Omit<SourceRecord, 'id' | 'retrievedAt'>,
  claims: Array<{ verbatimQuote: string; claimText: string; confidenceScore: number }>
): Promise<{ source: SourceRecord; claims: ExtractedClaim[] }> {
  const sourceId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `src-${Date.now()}`;
  const newSource: SourceRecord = {
    ...source,
    id: sourceId,
    retrievedAt: new Date().toISOString(),
  };

  const newClaims: ExtractedClaim[] = claims.map((c, i) => ({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `claim-${Date.now()}-${i}`,
    sourceId,
    verbatimQuote: c.verbatimQuote,
    claimText: c.claimText,
    confidenceScore: c.confidenceScore,
    createdAt: new Date().toISOString(),
  }));

  try {
    await supabase.from('sources').insert(newSource);
    await supabase.from('claims').insert(newClaims);
  } catch {
    // Local fallback
  }

  const existingSources = readLocalStorage<SourceRecord[]>('sources', []);
  writeLocalStorage('sources', [newSource, ...existingSources]);

  const existingClaims = readLocalStorage<ExtractedClaim[]>('claims', []);
  writeLocalStorage('claims', [...newClaims, ...existingClaims]);

  return { source: newSource, claims: newClaims };
}

export async function getSourcesAndClaims(): Promise<{ sources: SourceRecord[]; claims: ExtractedClaim[] }> {
  let sources = readLocalStorage<SourceRecord[]>('sources', [
    {
      id: 'src-1',
      url: 'https://arxiv.org/abs/2401.00001',
      title: 'Agentic Reasoning and Context Compression',
      type: 'arxiv',
      retrievedAt: new Date().toISOString(),
      authorOrChannel: 'Research Group',
      rawSnippet: 'Agentic reasoning enables structured context distillation across multiple turns.',
    },
  ]);

  let claims = readLocalStorage<ExtractedClaim[]>('claims', [
    {
      id: 'claim-1',
      sourceId: 'src-1',
      verbatimQuote: 'Agentic reasoning enables structured context distillation across multiple turns.',
      claimText: 'Structured context distillation improves long-horizon multi-agent coordination.',
      confidenceScore: 0.95,
      createdAt: new Date().toISOString(),
    },
  ]);

  try {
    const sRes = await supabase.from('sources').select('*');
    if (!sRes.error && sRes.data && sRes.data.length > 0) sources = sRes.data as SourceRecord[];
    const cRes = await supabase.from('claims').select('*');
    if (!cRes.error && cRes.data && cRes.data.length > 0) claims = cRes.data as ExtractedClaim[];
  } catch {
    // use local
  }

  return { sources, claims };
}

// 3. Durable Memories API (With Approval Lifecycle)
export async function getMemories(): Promise<DurableMemory[]> {
  const local = readLocalStorage<DurableMemory[]>('memories', [
    {
      id: 'mem-1',
      category: 'preference',
      content: 'Prefers cited claims and structured technical bullet points over conversational prose',
      status: 'approved',
      createdAt: new Date().toISOString(),
      userApprovedAt: new Date().toISOString(),
    },
    {
      id: 'mem-2',
      category: 'fact',
      content: 'Radar scans 120+ live RSS news streams with zero political bias',
      status: 'approved',
      createdAt: new Date().toISOString(),
      userApprovedAt: new Date().toISOString(),
    },
  ]);
  return local;
}

export async function addProposedMemory(content: string, category: DurableMemory['category']): Promise<DurableMemory> {
  const newMem: DurableMemory = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mem-${Date.now()}`,
    category,
    content,
    status: 'proposed',
    createdAt: new Date().toISOString(),
  };

  const list = readLocalStorage<DurableMemory[]>('memories', []);
  writeLocalStorage('memories', [newMem, ...list]);
  return newMem;
}

export async function updateMemoryStatus(id: string, status: 'approved' | 'deprecated'): Promise<void> {
  const list = readLocalStorage<DurableMemory[]>('memories', []);
  const updated = list.map((m) => {
    if (m.id === id) {
      return {
        ...m,
        status,
        userApprovedAt: status === 'approved' ? new Date().toISOString() : m.userApprovedAt,
      };
    }
    return m;
  });
  writeLocalStorage('memories', updated);
}

// 4. Action Planner API (With Recurrence & Status)
export async function getPlannerActions(): Promise<PlannerActionItem[]> {
  const local = readLocalStorage<PlannerActionItem[]>('planner_actions', [
    {
      id: 'act-1',
      title: 'Review arXiv paper on agentic reasoning',
      dueAt: new Date().toISOString(),
      timezone: 'UTC',
      recurrenceRule: 'NONE',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'act-2',
      title: 'Check Radar live news & specs feed for new benchmark releases',
      dueAt: new Date(Date.now() + 86400000).toISOString(),
      timezone: 'UTC',
      recurrenceRule: 'FREQ=DAILY',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]);
  return local;
}

export async function addPlannerAction(
  title: string,
  options?: { dueAt?: string; recurrenceRule?: PlannerActionItem['recurrenceRule'] }
): Promise<PlannerActionItem> {
  const newAction: PlannerActionItem = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `act-${Date.now()}`,
    title,
    dueAt: options?.dueAt || new Date().toISOString(),
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
    recurrenceRule: options?.recurrenceRule || 'NONE',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const list = readLocalStorage<PlannerActionItem[]>('planner_actions', []);
  writeLocalStorage('planner_actions', [newAction, ...list]);
  return newAction;
}

export async function togglePlannerActionStatus(id: string): Promise<PlannerActionItem[]> {
  const list = readLocalStorage<PlannerActionItem[]>('planner_actions', []);
  const updated = list.map((item) => {
    if (item.id === id) {
      const isPending = item.status === 'pending';
      return {
        ...item,
        status: (isPending ? 'completed' : 'pending') as PlannerActionItem['status'],
        completedAt: isPending ? new Date().toISOString() : undefined,
      };
    }
    return item;
  });
  writeLocalStorage('planner_actions', updated);
  return updated;
}

// 5. Full-Text Local Search Index
export function searchVault(
  query: string,
  data: { entries: VaultEntry[]; sources: SourceRecord[]; claims: ExtractedClaim[]; memories: DurableMemory[] }
) {
  if (!query.trim()) return data;

  const q = query.toLowerCase().trim();

  const filteredEntries = data.entries.filter((e) => e.content.toLowerCase().includes(q));
  const filteredSources = data.sources.filter(
    (s) => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q) || (s.rawSnippet && s.rawSnippet.toLowerCase().includes(q))
  );
  const filteredClaims = data.claims.filter(
    (c) => c.claimText.toLowerCase().includes(q) || c.verbatimQuote.toLowerCase().includes(q)
  );
  const filteredMemories = data.memories.filter((m) => m.content.toLowerCase().includes(q));

  return {
    entries: filteredEntries,
    sources: filteredSources,
    claims: filteredClaims,
    memories: filteredMemories,
  };
}

// 6. Weekly Distill Generator
export async function generateWeeklyDistill(weekLabel: string): Promise<WeeklyDistill> {
  const actions = await getPlannerActions();
  const memories = await getMemories();
  const { sources } = await getSourcesAndClaims();

  const completed = actions.filter((a) => a.status === 'completed');
  const summary = `Weekly review for ${weekLabel}: Completed ${completed.length} actions, analyzed ${sources.length} sources, and approved ${memories.filter((m) => m.status === 'approved').length} durable memories.`;

  const newDistill: WeeklyDistill = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `distill-${Date.now()}`,
    weekLabel,
    summary,
    keyThemes: ['Multi-Agent Research', 'Live News & Specs', 'YouTube Video Intelligence'],
    actionItems: completed.map((c) => c.title),
    sourcesAnalyzed: sources.length,
    createdAt: new Date().toISOString(),
  };

  const list = readLocalStorage<WeeklyDistill[]>('weekly_distills', []);
  writeLocalStorage('weekly_distills', [newDistill, ...list]);
  return newDistill;
}

// 7. Export / Import Vault Data
export function exportVaultJSON(): string {
  const payload = {
    entries: readLocalStorage('vault_entries', []),
    sources: readLocalStorage('sources', []),
    claims: readLocalStorage('claims', []),
    memories: readLocalStorage('memories', []),
    actions: readLocalStorage('planner_actions', []),
    distills: readLocalStorage('weekly_distills', []),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importVaultJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.entries) writeLocalStorage('vault_entries', data.entries);
    if (data.sources) writeLocalStorage('sources', data.sources);
    if (data.claims) writeLocalStorage('claims', data.claims);
    if (data.memories) writeLocalStorage('memories', data.memories);
    if (data.actions) writeLocalStorage('planner_actions', data.actions);
    if (data.distills) writeLocalStorage('weekly_distills', data.distills);
    return true;
  } catch (err) {
    console.error('Failed to import vault JSON:', err);
    return false;
  }
}
