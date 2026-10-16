import { useState, useEffect, useCallback } from 'react';
import type {
  VaultEntry,
  SourceRecord,
  ExtractedClaim,
  DurableMemory,
  PlannerActionItem,
  WeeklyDistill,
} from '@/types';
import {
  getVaultEntries,
  addVaultEntry,
  getSourcesAndClaims,
  saveSourceWithClaims,
  getMemories,
  addProposedMemory,
  updateMemoryStatus,
  getPlannerActions,
  addPlannerAction,
  togglePlannerActionStatus,
  searchVault,
  generateWeeklyDistill,
  exportVaultJSON,
  importVaultJSON,
} from '@/lib/vault';

export function useVault() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [claims, setClaims] = useState<ExtractedClaim[]>([]);
  const [memories, setMemories] = useState<DurableMemory[]>([]);
  const [actions, setActions] = useState<PlannerActionItem[]>([]);
  const [distills, setDistills] = useState<WeeklyDistill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedEntries = await getVaultEntries();
      const { sources: sList, claims: cList } = await getSourcesAndClaims();
      const fetchedMemories = await getMemories();
      const fetchedActions = await getPlannerActions();

      setEntries(fetchedEntries);
      setSources(sList);
      setClaims(cList);
      setMemories(fetchedMemories);
      setActions(fetchedActions);
    } catch (err) {
      console.error('Failed to load vault context:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddEntry = useCallback(
    async (entry: Omit<VaultEntry, 'id' | 'createdAt'>) => {
      const created = await addVaultEntry(entry);
      setEntries((prev) => [created, ...prev]);
      return created;
    },
    []
  );

  const handleSaveSourceAndClaims = useCallback(
    async (
      source: Omit<SourceRecord, 'id' | 'retrievedAt'>,
      claimItems: Array<{ verbatimQuote: string; claimText: string; confidenceScore: number }>
    ) => {
      const res = await saveSourceWithClaims(source, claimItems);
      setSources((prev) => [res.source, ...prev]);
      setClaims((prev) => [...res.claims, ...prev]);
      return res;
    },
    []
  );

  const handleAddMemory = useCallback(
    async (content: string, category: DurableMemory['category']) => {
      const mem = await addProposedMemory(content, category);
      setMemories((prev) => [...prev, mem]);
      return mem;
    },
    []
  );

  const handleSetMemoryStatus = useCallback(
    async (id: string, status: 'approved' | 'deprecated') => {
      await updateMemoryStatus(id, status);
      setMemories((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status, userApprovedAt: status === 'approved' ? new Date().toISOString() : m.userApprovedAt } : m
        )
      );
    },
    []
  );

  const handleAddAction = useCallback(
    async (title: string, options?: { dueAt?: string; recurrenceRule?: PlannerActionItem['recurrenceRule'] }) => {
      const act = await addPlannerAction(title, options);
      setActions((prev) => [...prev, act]);
      return act;
    },
    []
  );

  const handleToggleAction = useCallback(async (id: string) => {
    const updated = await togglePlannerActionStatus(id);
    setActions(updated);
  }, []);

  const handleGenerateDistill = useCallback(async (weekLabel: string) => {
    const distill = await generateWeeklyDistill(weekLabel);
    setDistills((prev) => [distill, ...prev]);
    return distill;
  }, []);

  const searchResults = searchQuery
    ? searchVault(searchQuery, { entries, sources, claims, memories })
    : { entries, sources, claims, memories };

  return {
    entries: searchResults.entries,
    sources: searchResults.sources,
    claims: searchResults.claims,
    memories: searchResults.memories,
    actions,
    distills,
    loading,
    searchQuery,
    setSearchQuery,
    addEntry: handleAddEntry,
    saveSourceAndClaims: handleSaveSourceAndClaims,
    addMemory: handleAddMemory,
    setMemoryStatus: handleSetMemoryStatus,
    addAction: handleAddAction,
    toggleAction: handleToggleAction,
    generateDistill: handleGenerateDistill,
    exportJSON: exportVaultJSON,
    importJSON: importVaultJSON,
    reload: loadAll,
  };
}
