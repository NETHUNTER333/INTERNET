import { useState, useCallback } from 'react';
import { Menu, Zap } from 'lucide-react';
import type { ViewName, Category, Article, Story, NewsVideo } from '@/types';
import type { ArxivPaperRich } from '@/lib/arxiv';
import { Sidebar } from '@/components/Sidebar';
import { AlbertoView } from '@/views/AlbertoView';
import { FeedView } from '@/views/FeedView';
import { ArticleView } from '@/views/ArticleView';
import { GitHubView } from '@/views/GitHubView';
import { BookmarksView } from '@/views/BookmarksView';
import { SettingsView } from '@/views/SettingsView';
import { VideosView } from '@/views/VideosView';
import { ArxivView } from '@/views/ArxivView';
import { PdfReaderView } from '@/views/PdfReaderView';
import { ResearchView } from '@/views/ResearchView';
import { VideoPlayer } from '@/components/VideoPlayer';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSettings } from '@/hooks/useSettings';

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('chat');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [playingVideo, setPlayingVideo] = useState<NewsVideo | null>(null);
  const [activePdfPaper, setActivePdfPaper] = useState<ArxivPaperRich | null>(null);

  const { bookmarks, loading: _bookmarksLoading, isBookmarked, toggleBookmark, removeBookmark } = useBookmarks();
  const { settings, updateSettings } = useSettings();

  const handleOpenArticle = useCallback((article: Article) => {
    setActiveArticle(article);
    setCurrentView('article');
    window.scrollTo(0, 0);
  }, []);

  const handleOpenStory = useCallback((story: Story) => {
    setActiveStory(story);
    if (story.articles.length > 0) {
      handleOpenArticle(story.articles[0]);
    }
  }, [handleOpenArticle]);

  const handleViewChange = useCallback((view: ViewName) => {
    setCurrentView(view);
    if (view !== 'article' && view !== 'pdf-reader') {
      setActiveArticle(null);
      setActivePdfPaper(null);
    }
    window.scrollTo(0, 0);
  }, []);

  const handleBack = useCallback(() => {
    setActiveArticle(null);
    setActiveStory(null);
    setCurrentView('feed');
    window.scrollTo(0, 0);
  }, []);

  const handlePlayVideo = useCallback((video: NewsVideo) => {
    setPlayingVideo(video);
  }, []);

  const handleCloseVideo = useCallback(() => {
    setPlayingVideo(null);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setCurrentView('feed');
    window.scrollTo(0, 0);
  }, []);

  const handleOpenPdfReader = useCallback((paper: ArxivPaperRich) => {
    setActivePdfPaper(paper);
    setCurrentView('pdf-reader');
    window.scrollTo(0, 0);
  }, []);

  const isVideoBookmarked = useCallback(
    (watchUrl: string) => bookmarks.some((b) => b.link === watchUrl),
    [bookmarks]
  );

  const handleToggleVideoBookmark = useCallback(
    async (video: NewsVideo) => {
      const existing = bookmarks.find((b) => b.link === video.watchUrl);
      if (existing) {
        await removeBookmark(video.watchUrl);
      } else {
        const article: Article = {
          id: video.id,
          title: video.title,
          summary: video.description,
          link: video.watchUrl,
          sourceName: video.channelName,
          sourceBias: video.channelBias,
          category: video.category,
          publishedAt: video.publishedAt,
          thumbnail: video.thumbnail,
        };
        await toggleBookmark(article);
      }
    },
    [bookmarks, removeBookmark, toggleBookmark]
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D14] text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        bookmarkCount={bookmarks.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Header Bar */}
        <div className="md:hidden bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-b-3 border-slate-900 dark:border-slate-100 p-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_3px_0px_0px_#000]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 brutal-btn !p-1.5 !bg-white !text-slate-900"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white text-slate-900 dark:bg-slate-900 dark:text-white border border-slate-900 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="font-sketch font-black text-xl uppercase tracking-wider">
                ZENO
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {currentView === 'chat' && (
            <AlbertoView
              context={{
                currentView,
                articleTitle: activeArticle?.title,
                articleSummary: activeArticle?.summary,
                articleSource: activeArticle?.sourceName,
                paperTitle: activePdfPaper?.title,
                paperAbstract: activePdfPaper?.summary,
                paperArxivId: activePdfPaper?.arxivId,
              }}
            />
          )}

          {currentView === 'feed' && (
            <FeedView
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onOpenArticle={handleOpenArticle}
              onOpenStory={handleOpenStory}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
            />
          )}

          {currentView === 'videos' && (
            <VideosView
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onPlayVideo={handlePlayVideo}
            />
          )}

          {currentView === 'research' && <ResearchView />}

          {currentView === 'arxiv' && <ArxivView onOpenPdfReader={handleOpenPdfReader} />}

          {currentView === 'article' && activeArticle && (
            <ArticleView
              article={activeArticle}
              story={activeStory}
              onBack={handleBack}
              onOpenArticle={handleOpenArticle}
              isBookmarked={isBookmarked(activeArticle.link)}
              onToggleBookmark={toggleBookmark}
              firecrawlApiKey={settings.firecrawlApiKey}
              tinyfishApiKey={settings.tinyfishApiKey}
              activeProvider={settings.activeProvider}
            />
          )}

          {currentView === 'pdf-reader' && activePdfPaper && (
            <PdfReaderView
              paper={activePdfPaper}
              onBack={() => handleViewChange('arxiv')}
            />
          )}

          {currentView === 'github' && <GitHubView />}

          {currentView === 'bookmarks' && (
            <BookmarksView
              bookmarks={bookmarks}
              loading={_bookmarksLoading}
              onRemove={removeBookmark}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdate={updateSettings}
            />
          )}
        </div>
      </main>

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={handleCloseVideo}
          isBookmarked={isVideoBookmarked(playingVideo.watchUrl)}
          onToggleBookmark={handleToggleVideoBookmark}
        />
      )}
    </div>
  );
}

export default App;
