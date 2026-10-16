import { useState } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, Check, ExternalLink, Flame, Fish, Zap, Moon, Sun, Layers, Globe } from 'lucide-react';
import type { AppSettings, DeepReadProvider } from '@/hooks/useSettings';
import { CATEGORY_LABELS, LANGUAGE_LABELS, LANGUAGE_FLAGS, ALL_LANGUAGES, ALL_CATEGORIES, NEWS_SOURCES_COUNT } from '@/data/sources';
import type { Category } from '@/types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (updates: Partial<AppSettings>) => Promise<boolean>;
}

const ALL_CATEGORIES_LOCAL: Category[] = ALL_CATEGORIES;

export function SettingsView({ settings, onUpdate }: SettingsViewProps) {
  const [firecrawlKey, setFirecrawlKey] = useState(settings.firecrawlApiKey);
  const [tinyfishKey, setTinyfishKey] = useState(settings.tinyfishApiKey);
  const [showFcKey, setShowFcKey] = useState(false);
  const [showTfKey, setShowTfKey] = useState(false);
  const [savedFc, setSavedFc] = useState(false);
  const [savedTf, setSavedTf] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>(settings.preferredCategories);
  const [activeProvider, setActiveProvider] = useState<DeepReadProvider>(settings.activeProvider);

  const handleSaveFcKey = async () => {
    await onUpdate({ firecrawlApiKey: firecrawlKey });
    setSavedFc(true);
    setTimeout(() => setSavedFc(false), 2000);
  };

  const handleSaveTfKey = async () => {
    await onUpdate({ tinyfishApiKey: tinyfishKey });
    setSavedTf(true);
    setTimeout(() => setSavedTf(false), 2000);
  };

  const handleProviderSwitch = async (provider: DeepReadProvider) => {
    setActiveProvider(provider);
    await onUpdate({ activeProvider: provider });
  };

  const handleToggleCategory = async (cat: string) => {
    const newCats = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    setSelectedCats(newCats);
    await onUpdate({ preferredCategories: newCats });
  };

  const handleThemeChange = async (theme: 'light' | 'dark') => {
    await onUpdate({ theme });
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="brutal-card p-5 flex items-center justify-between bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white text-slate-900 dark:bg-slate-900 dark:text-white border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_#000]">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-sketch text-2xl font-black tracking-wider uppercase">
              SETTINGS
            </h2>
            <p className="text-[11px] font-mono font-bold uppercase opacity-80">
              Theme · Scraper Providers · Category Preferences
            </p>
          </div>
        </div>
      </div>

      {/* Theme Mode Card */}
      <div className="brutal-card p-5 flex items-center justify-between gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-900 dark:border-slate-100 rounded-xl">
            {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-sky-500" />}
          </div>
          <div>
            <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-slate-100">THEME MODE</h3>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">Dark / Light Mode Toggle</p>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleThemeChange('dark')}
            title="Dark Mode"
            aria-label="Dark Mode"
            className={`brutal-btn p-3.5 !rounded-xl ${
              settings.theme === 'dark'
                ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900 shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleThemeChange('light')}
            title="Light Mode"
            aria-label="Light Mode"
            className={`brutal-btn p-3.5 !rounded-xl ${
              settings.theme === 'light'
                ? '!bg-slate-900 !text-white shadow-[3px_3px_0px_0px_#000]'
                : 'bg-white dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Sun className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scraper Provider Selector */}
      <div className="brutal-card p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-500" />
            <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-slate-100">DEEP READ SCRAPER PROVIDER</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleProviderSwitch('tinyfish')}
              title="Select TinyFish Scraper"
              className={`brutal-btn p-3 !rounded-xl flex items-center gap-2 ${
                activeProvider === 'tinyfish'
                  ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white dark:bg-slate-800 text-slate-500'
              }`}
            >
              <Fish className="w-5 h-5" />
              <span className="hidden sm:inline font-mono font-bold text-xs">TINYFISH</span>
            </button>

            <button
              onClick={() => handleProviderSwitch('firecrawl')}
              title="Select Firecrawl Scraper"
              className={`brutal-btn p-3 !rounded-xl flex items-center gap-2 ${
                activeProvider === 'firecrawl'
                  ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900 shadow-[3px_3px_0px_0px_#000]'
                  : 'bg-white dark:bg-slate-800 text-slate-500'
              }`}
            >
              <Flame className="w-5 h-5" />
              <span className="hidden sm:inline font-mono font-bold text-xs">FIRECRAWL</span>
            </button>
          </div>
        </div>
        <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
          Backend Web Scraping Provider for Deep Reading & Citation Verification.
        </p>
      </div>

      {/* TinyFish API Key Card */}
      <div className="brutal-card p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Fish className="w-5 h-5 text-teal-500" />
            <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-slate-100">TINYFISH API KEY</h3>
          </div>
          <a
            href="https://agent.tinyfish.ai/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            title="Get TinyFish API Key"
            className="brutal-btn p-2 !shadow-none"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showTfKey ? 'text' : 'password'}
              placeholder="sk-tinyfish-..."
              value={tinyfishKey}
              onChange={(e) => setTinyfishKey(e.target.value)}
              className="brutal-input w-full pr-10 text-sm font-bold"
            />
            <button
              onClick={() => setShowTfKey(!showTfKey)}
              title={showTfKey ? 'Hide Key' : 'Show Key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 p-1"
            >
              {showTfKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSaveTfKey}
            title="Save TinyFish Key"
            className="prisma-btn-primary p-3 flex items-center justify-center !rounded-xl"
          >
            {savedTf ? <Check className="w-5 h-5" /> : <Fish className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Firecrawl API Key Card */}
      <div className="brutal-card p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-slate-100">FIRECRAWL API KEY</h3>
          </div>
          <a
            href="https://www.firecrawl.dev/pricing"
            target="_blank"
            rel="noopener noreferrer"
            title="Get Firecrawl API Key"
            className="brutal-btn p-2 !shadow-none"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showFcKey ? 'text' : 'password'}
              placeholder="fc-..."
              value={firecrawlKey}
              onChange={(e) => setFirecrawlKey(e.target.value)}
              className="brutal-input w-full pr-10 text-sm font-bold"
            />
            <button
              onClick={() => setShowFcKey(!showFcKey)}
              title={showFcKey ? 'Hide Key' : 'Show Key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 p-1"
            >
              {showFcKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={handleSaveFcKey}
            title="Save Firecrawl Key"
            className="prisma-btn-primary p-3 flex items-center justify-center !rounded-xl"
          >
            {savedFc ? <Check className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Preferred Categories */}
      <div className="brutal-card p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-500" />
          <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-slate-100">PREFERRED CATEGORIES</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES_LOCAL.map((cat) => {
            const isSelected = selectedCats.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => handleToggleCategory(cat)}
                className={`brutal-btn text-xs font-extrabold uppercase ${
                  isSelected
                    ? '!bg-slate-900 !text-white dark:!bg-slate-100 dark:!text-slate-900'
                    : 'bg-white dark:bg-slate-800'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Languages & Sources */}
      <div className="brutal-card p-5 flex flex-col gap-3 shadow-[4px_4px_0px_0px_#000]">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-slate-100">MULTILINGUAL SOURCES</h3>
        </div>
        <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
          Aggregating {NEWS_SOURCES_COUNT}+ sources across {ALL_LANGUAGES.length} languages worldwide.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_LANGUAGES.map((lang) => (
            <span key={lang} className="brutal-tag bg-slate-100 dark:bg-slate-800">
              {LANGUAGE_FLAGS[lang]} {LANGUAGE_LABELS[lang]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
