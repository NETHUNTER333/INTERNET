import { useState } from 'react';
import { Settings as SettingsIcon, Key, Eye, EyeOff, Check, ExternalLink, Flame, Fish, Zap } from 'lucide-react';
import type { AppSettings, DeepReadProvider } from '@/hooks/useSettings';
import { CATEGORY_LABELS, CATEGORY_COLORS, LANGUAGE_LABELS, LANGUAGE_FLAGS, ALL_LANGUAGES, ALL_CATEGORIES, NEWS_SOURCES_COUNT } from '@/data/sources';
import { TOTAL_SUB_CATEGORIES } from '@/data/subCategories';
// re-export for convenience
void TOTAL_SUB_CATEGORIES;
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
  const [showBias, setShowBias] = useState(settings.showBiasRatings);
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

  const handleToggleBias = async (value: boolean) => {
    setShowBias(value);
    await onUpdate({ showBiasRatings: value });
  };

  const handleToggleCategory = async (cat: string) => {
    const newCats = selectedCats.includes(cat)
      ? selectedCats.filter((c) => c !== cat)
      : [...selectedCats, cat];
    setSelectedCats(newCats);
    await onUpdate({ preferredCategories: newCats });
  };

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="brutal-card bg-brutal-orange p-4">
        <h2 className="font-display text-2xl flex items-center gap-2">
          <SettingsIcon className="w-7 h-7" /> Settings
        </h2>
        <p className="text-sm font-mono">Configure your Ground Truth experience</p>
      </div>

      {/* Active Provider Selector */}
      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <h3 className="font-display text-lg flex items-center gap-2">
          <Zap className="w-5 h-5" /> Active Deep Read Provider
        </h3>
        <p className="text-sm font-mono text-brutal-black/70">
          Choose which service powers Deep Read and Find Related. TinyFish search and fetch are free.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleProviderSwitch('tinyfish')}
            className={`brutal-btn text-sm flex items-center gap-2 ${activeProvider === 'tinyfish' ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
          >
            <Fish className="w-4 h-4" /> TinyFish
          </button>
          <button
            onClick={() => handleProviderSwitch('firecrawl')}
            className={`brutal-btn text-sm flex items-center gap-2 ${activeProvider === 'firecrawl' ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
          >
            <Flame className="w-4 h-4" /> Firecrawl
          </button>
        </div>
      </div>

      {/* TinyFish API Key */}
      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Fish className="w-5 h-5" />
          <h3 className="font-display text-lg">TinyFish API Key</h3>
          {activeProvider === 'tinyfish' && (
            <span className="brutal-tag bg-brutal-lime text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" /> Active
            </span>
          )}
        </div>
        <p className="text-sm font-mono text-brutal-black/70">
          TinyFish powers Deep Read and Related Coverage search. Search and Fetch are free.
        </p>
        <a
          href="https://agent.tinyfish.ai/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-brutal-blue flex items-center gap-1 hover:underline w-fit"
        >
          Get a TinyFish API key <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showTfKey ? 'text' : 'password'}
              placeholder="sk-tinyfish-..."
              value={tinyfishKey}
              onChange={(e) => setTinyfishKey(e.target.value)}
              className="brutal-input w-full pr-10 text-sm"
            />
            <button
              onClick={() => setShowTfKey(!showTfKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showTfKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleSaveTfKey} className="brutal-btn bg-brutal-lime text-sm flex items-center gap-2">
            {savedTf ? <Check className="w-4 h-4" /> : <Fish className="w-4 h-4" />}
            {savedTf ? 'Saved!' : 'Save'}
          </button>
        </div>
        <p className="text-xs font-mono text-brutal-black/50">
          Your key is stored securely in the database and only sent to the server function.
        </p>
      </div>

      {/* Firecrawl API Key */}
      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5" />
          <h3 className="font-display text-lg">Firecrawl API Key</h3>
          {activeProvider === 'firecrawl' && (
            <span className="brutal-tag bg-brutal-lime text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" /> Active
            </span>
          )}
        </div>
        <p className="text-sm font-mono text-brutal-black/70">
          Firecrawl is an alternative for Deep Read and Related Coverage. The free tier gives you 500 searches or 1,000 page scrapes per month.
        </p>
        <a
          href="https://www.firecrawl.dev/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-brutal-blue flex items-center gap-1 hover:underline w-fit"
        >
          Get a free Firecrawl API key <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showFcKey ? 'text' : 'password'}
              placeholder="fc-..."
              value={firecrawlKey}
              onChange={(e) => setFirecrawlKey(e.target.value)}
              className="brutal-input w-full pr-10 text-sm"
            />
            <button
              onClick={() => setShowFcKey(!showFcKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showFcKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={handleSaveFcKey} className="brutal-btn bg-brutal-lime text-sm flex items-center gap-2">
            {savedFc ? <Check className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
            {savedFc ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>

      {/* Bias Ratings */}
      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <h3 className="font-display text-lg">Bias Ratings</h3>
        <p className="text-sm font-mono text-brutal-black/70">
          Show political bias ratings on articles and coverage breakdown bars on stories.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleBias(true)}
            className={`brutal-btn text-sm ${showBias ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
          >
            Show
          </button>
          <button
            onClick={() => handleToggleBias(false)}
            className={`brutal-btn text-sm ${!showBias ? 'bg-brutal-black text-brutal-yellow' : 'bg-brutal-white'}`}
          >
            Hide
          </button>
        </div>
      </div>

      {/* Preferred Categories */}
      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <h3 className="font-display text-lg">Preferred Categories</h3>
        <p className="text-sm font-mono text-brutal-black/70">
          Select categories you want to prioritize in your feed.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES_LOCAL.map((cat) => (
            <button
              key={cat}
              onClick={() => handleToggleCategory(cat)}
              className={`brutal-tag ${
                selectedCats.includes(cat) ? `${CATEGORY_COLORS[cat]} ring-2 ring-brutal-black ring-offset-1` : 'bg-brutal-white'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="brutal-card bg-brutal-white p-6 flex flex-col gap-4">
        <h3 className="font-display text-lg">Languages & Countries</h3>
        <p className="text-sm font-mono text-brutal-black/70">
          Ground Truth now aggregates news from {ALL_LANGUAGES.length} languages across {NEWS_SOURCES_COUNT}+ sources worldwide.
          Use the language filter on the feed page to narrow your view.
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_LANGUAGES.map((lang) => (
            <span key={lang} className="brutal-tag bg-brutal-cyan/30 text-xs">
              {LANGUAGE_FLAGS[lang]} {LANGUAGE_LABELS[lang]}
            </span>
          ))}
        </div>
      </div>

      <div className="brutal-card bg-brutal-black p-4">
        <h3 className="font-display text-lg text-brutal-yellow mb-2">About Ground Truth</h3>
        <p className="text-sm font-mono text-brutal-white/80">
          Ground Truth aggregates news from {ALL_CATEGORIES_LOCAL.length} categories across {NEWS_SOURCES_COUNT}+ sources in {ALL_LANGUAGES.length} languages using free RSS feeds.
          Stories are grouped by topic, tagged with bias ratings, and analyzed for coverage blind spots.
          TinyFish (free) or Firecrawl integration provides deep article reading and related coverage discovery.
        </p>
      </div>
    </div>
  );
}

