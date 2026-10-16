import { Newspaper, Github, Settings, Bookmark, Search, X, Youtube, Bot, BookOpen, Sparkles, FileText, Zap } from 'lucide-react';
import type { ViewName, Category } from '@/types';
import { CATEGORY_LABELS, ALL_CATEGORIES } from '@/data/sources';

interface SidebarProps {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
  selectedCategory: Category | null;
  onCategoryChange: (cat: Category | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  bookmarkCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { view: ViewName; label: string; icon: typeof Newspaper; color: string; bg: string }[] = [
  { view: 'feed', label: 'News Feed', icon: Newspaper, color: 'text-zeno-coral', bg: 'bg-zeno-coral/10' },
  { view: 'videos', label: 'Video News', icon: Youtube, color: 'text-zeno-rose', bg: 'bg-zeno-rose/10' },
  { view: 'research', label: 'Agent Research', icon: Bot, color: 'text-zeno-mint', bg: 'bg-zeno-mint/10' },
  { view: 'arxiv', label: 'Research Papers', icon: BookOpen, color: 'text-zeno-sky', bg: 'bg-zeno-sky/10' },
  { view: 'github', label: 'GitHub Repos', icon: Github, color: 'text-zeno-lavender', bg: 'bg-zeno-lavender/10' },
  { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark, color: 'text-zeno-sun', bg: 'bg-zeno-sun/10' },
  { view: 'settings', label: 'Settings', icon: Settings, color: 'text-prisma-textSecondary', bg: 'bg-prisma-surfaceAlt' },
];

const CATEGORIES: Category[] = ALL_CATEGORIES;

export function Sidebar({
  currentView,
  onViewChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  bookmarkCount,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-prisma-text/40 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-prisma-surface border-r border-prisma-border z-50 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="border-b border-prisma-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-zeno-coral via-zeno-mint to-zeno-sky rounded-xl flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-display text-xl leading-none tracking-tight text-prisma-text">Zeno</h1>
              <p className="text-[10px] font-medium text-prisma-textMuted mt-0.5">News Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden prisma-btn-ghost">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-prisma-border">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-prisma-textMuted" />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                className="brutal-input w-full pl-9 text-sm"
              />
            </div>
            <button
              onClick={onSearchSubmit}
              className="prisma-btn-primary !px-3"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="p-3 flex flex-col gap-1 border-b border-prisma-border">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onViewChange(item.view);
                  onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                  active
                    ? `${item.bg} ${item.color} font-semibold`
                    : 'text-prisma-textSecondary hover:bg-prisma-surfaceAlt hover:text-prisma-text'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? item.color : ''}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.view === 'bookmarks' && bookmarkCount > 0 && (
                  <span className="bg-prisma-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {bookmarkCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {(currentView === 'feed' || currentView === 'videos' || currentView === 'arxiv') && (
          <div className="p-3 flex flex-col gap-0.5 flex-1 overflow-y-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-prisma-textMuted px-3 py-2">Categories</span>
            <button
              onClick={() => onCategoryChange(null)}
              className={`flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                !selectedCategory
                  ? 'bg-prisma-text text-white'
                  : 'text-prisma-textSecondary hover:bg-prisma-surfaceAlt'
              }`}
            >
              All News
            </button>
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={`flex items-center px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    active
                      ? 'bg-prisma-accentLight text-prisma-accent'
                      : 'text-prisma-textSecondary hover:bg-prisma-surfaceAlt hover:text-prisma-text'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-auto p-4 border-t border-prisma-border">
          <p className="text-prisma-textMuted text-[11px] font-medium text-center">
            Zeno · 33 languages · 120+ sources
          </p>
        </div>
      </aside>
    </>
  );
}
