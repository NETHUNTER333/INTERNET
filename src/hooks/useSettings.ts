import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingsRecord {
  id: number;
  firecrawl_api_key: string | null;
  tinyfish_api_key: string | null;
  active_provider: string | null;
  preferred_categories: string[] | null;
  theme?: 'light' | 'dark';
}

export type DeepReadProvider = 'tinyfish' | 'firecrawl';

export interface AppSettings {
  firecrawlApiKey: string;
  tinyfishApiKey: string;
  activeProvider: DeepReadProvider;
  preferredCategories: string[];
  theme: 'light' | 'dark';
}

const DEFAULT_SETTINGS: AppSettings = {
  firecrawlApiKey: '',
  tinyfishApiKey: '',
  activeProvider: 'tinyfish',
  preferredCategories: [],
  theme: 'light', // Default to bright, crisp high-contrast light mode
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applyTheme = (themeMode: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error || !data) {
        setSettings(DEFAULT_SETTINGS);
        applyTheme(DEFAULT_SETTINGS.theme);
      } else {
        const record = data as SettingsRecord;
        const loadedTheme = record.theme || 'light';
        setSettings({
          firecrawlApiKey: record.firecrawl_api_key || '',
          tinyfishApiKey: record.tinyfish_api_key || '',
          activeProvider: (record.active_provider as DeepReadProvider) || 'tinyfish',
          preferredCategories: record.preferred_categories || [],
          theme: loadedTheme,
        });
        applyTheme(loadedTheme);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
      applyTheme(DEFAULT_SETTINGS.theme);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      if (updates.theme) {
        applyTheme(updates.theme);
      }

      try {
        await supabase
          .from('settings')
          .upsert({
            id: 1,
            firecrawl_api_key: newSettings.firecrawlApiKey || null,
            tinyfish_api_key: newSettings.tinyfishApiKey || null,
            active_provider: newSettings.activeProvider,
            preferred_categories: newSettings.preferredCategories.length > 0 ? newSettings.preferredCategories : null,
            theme: newSettings.theme,
            updated_at: new Date().toISOString(),
          });
        return true;
      } catch {
        return false;
      }
    },
    [settings]
  );

  return { settings, loading, updateSettings, reload: loadSettings };
}
