import { Newspaper, Github, Settings, Bookmark, Search, X, Youtube, Bot, BookOpen, Zap, ChevronRight } from 'lucide-react';
import type { ViewName } from '@/types';

interface SidebarProps {
  currentView: ViewName;
  onViewChange: (view: ViewName) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  bookmarkCount: number;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { view: ViewName; label: string; icon: typeof Newspaper }[] = [
  { view: 'chat', label: 'Zeno Chat', icon: Bot },
  { view: 'feed', label: 'News Feed', icon: Newspaper },
  { view: 'videos', label: 'Video Intelligence', icon: Youtube },
  { view: 'research', label: 'Agent Research', icon: Bot },
  { view: 'arxiv', label: 'Research Papers', icon: BookOpen },
  { view: 'github', label: 'GitHub Repos', icon: Github },
  { view: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  bookmarkCount,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-full sm:w-80 md:w-72 bg-white dark:bg-slate-950 border-r-3 border-slate-900 dark:border-slate-100 z-50 flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b-3 border-slate-900 dark:border-slate-100 flex items-center justify-between bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-slate-900 dark:bg-slate-900 dark:text-white border-2.5 border-slate-900 dark:border-slate-100 rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-sketch text-2xl tracking-wider uppercase font-black">
                ZENO
              </h1>
              <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider opacity-80">
                Research & News
              </p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden brutal-btn p-2 !shadow-none !bg-white !text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b-3 border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-900 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search news & papers..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
                className="brutal-input w-full pl-9 text-xs font-bold"
              />
            </div>
            <button
              onClick={onSearchSubmit}
              className="prisma-btn-primary !px-3"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 flex flex-col gap-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              NAVIGATION
            </span>
          </div>

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
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all duration-100 border-2.5 border-slate-900 dark:border-slate-100 ${
                  active
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] -translate-x-0.5 -translate-y-0.5'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.view === 'bookmarks' && bookmarkCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-900">
                    {bookmarkCount}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 opacity-40" />
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3.5 border-t-3 border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-slate-900 text-center shrink-0">
          <p className="text-slate-900 dark:text-slate-100 text-[11px] font-mono font-bold uppercase">
            ZENO · 120+ SOURCES
          </p>
        </div>
      </aside>
    </>
  );
}
