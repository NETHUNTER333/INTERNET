import { useState, useCallback } from 'react';
import { Menu, Zap, MessageCircle } from 'lucide-react';
import type { ViewName, Category, Article, Story, NewsVideo } from '@/types';
import type { ArxivPaperRich } from '@/lib/arxiv';
import { Sidebar } from '@/components/Sidebar';
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
import { AlbertoChat } from '@/components/AlbertoChat';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSettings } from '@/hooks/useSettings';

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('feed');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [playingVideo, setPlayingVideo] = useState<NewsVideo | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activePdfPaper, setActivePdfPaper] = useState<ArxivPaperRich | null>(null);

  const { bookmarks, loading: bookmarksLoading, isBookmarked, toggleBookmark, removeBookmark } = useBookmarks();
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
    <div className="flex min-h-screen bg-prisma-bg">
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        bookmarkCount={bookmarks.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0">
        <div className="md:hidden bg-prisma-surface border-b border-prisma-border p-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="prisma-btn-ghost !p-2"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-zeno-coral via-zeno-mint to-zeno-sky rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display text-lg tracking-tight">Zeno</span>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {currentView === 'feed' && (
            <FeedView
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onOpenArticle={handleOpenArticle}
              onOpenStory={handleOpenStory}
              isBookmarked={isBookmarked}
              onToggleBookmark={toggleBookmark}
              showBias={settings.showBiasRatings}
            />
          )}

          {currentView === 'videos' && (
            <VideosView
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              showBias={settings.showBiasRatings}
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
              showBias={settings.showBiasRatings}
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
              loading={bookmarksLoading}
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

      {/* Alberto Chat FAB */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-prisma-accent text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {chatOpen && (
        <AlbertoChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
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

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={handleCloseVideo}
          isBookmarked={isVideoBookmarked(playingVideo.watchUrl)}
          onToggleBookmark={handleToggleVideoBookmark}
          showBias={settings.showBiasRatings}
        />
      )}
    </div>
  );
}

export default App;
