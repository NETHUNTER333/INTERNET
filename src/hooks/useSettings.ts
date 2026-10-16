import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SettingsRecord {
  id: number;
  firecrawl_api_key: string | null;
  tinyfish_api_key: string | null;
  active_provider: string | null;
  preferred_categories: string[] | null;
  show_bias_ratings: boolean;
}

export type DeepReadProvider = 'tinyfish' | 'firecrawl';

export interface AppSettings {
  firecrawlApiKey: string;
  tinyfishApiKey: string;
  activeProvider: DeepReadProvider;
  preferredCategories: string[];
  showBiasRatings: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  firecrawlApiKey: '',
  tinyfishApiKey: '',
  activeProvider: 'tinyfish',
  preferredCategories: [],
  showBiasRatings: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      console.error('Failed to load settings:', error);
      setSettings(DEFAULT_SETTINGS);
    } else if (data) {
      const record = data as SettingsRecord;
      setSettings({
        firecrawlApiKey: record.firecrawl_api_key || '',
        tinyfishApiKey: record.tinyfish_api_key || '',
        activeProvider: (record.active_provider as DeepReadProvider) || 'tinyfish',
        preferredCategories: record.preferred_categories || [],
        showBiasRatings: record.show_bias_ratings,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          firecrawl_api_key: newSettings.firecrawlApiKey || null,
          tinyfish_api_key: newSettings.tinyfishApiKey || null,
          active_provider: newSettings.activeProvider,
          preferred_categories: newSettings.preferredCategories.length > 0 ? newSettings.preferredCategories : null,
          show_bias_ratings: newSettings.showBiasRatings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to save settings:', error);
        return false;
      }
      return true;
    },
    [settings]
  );

  return { settings, loading, updateSettings, reload: loadSettings };
}
