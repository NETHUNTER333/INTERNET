import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getLocalStorageKey(table: string) {
  return `zeno_db_${table}`;
}

function readLocalTable(table: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getLocalStorageKey(table));
    if (!raw) {
      if (table === 'settings') {
        const defaultSettings = [
          {
            id: 1,
            firecrawl_api_key: null,
            tinyfish_api_key: null,
            active_provider: 'tinyfish',
            preferred_categories: null,
            show_bias_ratings: true,
            updated_at: new Date().toISOString(),
          },
        ];
        localStorage.setItem(getLocalStorageKey(table), JSON.stringify(defaultSettings));
        return defaultSettings;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalTable(table: string, data: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getLocalStorageKey(table), JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

class LocalTableQuery {
  private tableName: string;
  private action: 'select' | 'insert' | 'upsert' | 'delete';
  private payload: any;
  private filters: Array<{ col: string; op: 'eq' | 'neq'; val: any }> = [];
  private orderConfig?: { col: string; ascending: boolean };
  private limitCount?: number;
  private isSingle = false;

  constructor(tableName: string, action: 'select' | 'insert' | 'upsert' | 'delete', payload?: any) {
    this.tableName = tableName;
    this.action = action;
    this.payload = payload;
  }

  select(_fields?: string) {
    return this;
  }

  order(col: string, options?: { ascending: boolean }) {
    this.orderConfig = { col, ascending: options?.ascending ?? true };
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, op: 'eq', val });
    return this;
  }

  neq(col: string, val: any) {
    this.filters.push({ col, op: 'neq', val });
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  private execute(): { data: any; error: any } {
    let rows = readLocalTable(this.tableName);

    if (this.action === 'insert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = items.map((item) => ({
        id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      }));
      rows = [...rows, ...inserted];
      writeLocalTable(this.tableName, rows);
      return { data: this.isSingle ? inserted[0] : inserted, error: null };
    }

    if (this.action === 'upsert') {
      const items = Array.isArray(this.payload) ? this.payload : [this.payload];
      for (const item of items) {
        const id = item.id;
        const idx = rows.findIndex((r) => r.id === id);
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...item };
        } else {
          rows.push({
            id: id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
            created_at: new Date().toISOString(),
            ...item,
          });
        }
      }
      writeLocalTable(this.tableName, rows);
      return { data: this.isSingle ? items[0] : items, error: null };
    }

    if (this.action === 'delete') {
      if (this.filters.length > 0) {
        rows = rows.filter((row) => {
          return !this.filters.every((f) => {
            if (f.op === 'eq') return row[f.col] === f.val;
            if (f.op === 'neq') return row[f.col] !== f.val;
            return true;
          });
        });
      } else {
        rows = [];
      }
      writeLocalTable(this.tableName, rows);
      return { data: null, error: null };
    }

    // select action
    let result = [...rows];
    for (const f of this.filters) {
      if (f.op === 'eq') {
        result = result.filter((r) => String(r[f.col]) === String(f.val));
      } else if (f.op === 'neq') {
        result = result.filter((r) => String(r[f.col]) !== String(f.val));
      }
    }

    if (this.orderConfig) {
      const { col, ascending } = this.orderConfig;
      result.sort((a, b) => {
        const valA = a[col] ?? '';
        const valB = b[col] ?? '';
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== undefined) {
      result = result.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }

  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    try {
      const res = this.execute();
      return Promise.resolve(onfulfilled ? onfulfilled(res) : (res as any));
    } catch (err) {
      if (onrejected) return Promise.resolve(onrejected(err));
      return Promise.resolve(onfulfilled ? onfulfilled({ data: null, error: err }) : ({ data: null, error: err } as any));
    }
  }
}

function createLocalFallbackClient() {
  return {
    from: (table: string) => ({
      select: (fields?: string) => new LocalTableQuery(table, 'select').select(fields),
      insert: (payload: any) => new LocalTableQuery(table, 'insert', payload),
      upsert: (payload: any) => new LocalTableQuery(table, 'upsert', payload),
      delete: () => new LocalTableQuery(table, 'delete'),
    }),
  };
}

let realSupabaseClient: any = null;
if (supabaseUrl && supabaseAnonKey && typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http')) {
  try {
    realSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[AI Studio] Supabase client initialization failed, falling back to local storage', err);
  }
}

export const supabase = realSupabaseClient || (createLocalFallbackClient() as unknown as ReturnType<typeof createClient>);
