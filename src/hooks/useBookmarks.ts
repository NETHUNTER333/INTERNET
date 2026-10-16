import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Article } from '@/types';

export interface BookmarkRecord {
  id: string;
  title: string;
  summary: string;
  link: string;
  source_name: string;
  source_bias: string;
  category: string;
  published_at: string;
  thumbnail: string | null;
  created_at: string;
}

function articleToBookmark(article: Article) {
  return {
    title: article.title,
    summary: article.summary,
    link: article.link,
    source_name: article.sourceName,
    source_bias: article.sourceBias,
    category: article.category,
    published_at: article.publishedAt,
    thumbnail: article.thumbnail || null,
  };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load bookmarks:', error);
      setBookmarks([]);
    } else {
      setBookmarks(data as BookmarkRecord[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const isBookmarked = useCallback(
    (link: string) => bookmarks.some((b) => b.link === link),
    [bookmarks]
  );

  const addBookmark = useCallback(
    async (article: Article) => {
      const { error } = await supabase
        .from('bookmarks')
        .insert(articleToBookmark(article));

      if (error) {
        console.error('Failed to add bookmark:', error);
        return false;
      }
      await loadBookmarks();
      return true;
    },
    [loadBookmarks]
  );

  const removeBookmark = useCallback(
    async (link: string) => {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('link', link);

      if (error) {
        console.error('Failed to remove bookmark:', error);
        return false;
      }
      await loadBookmarks();
      return true;
    },
    [loadBookmarks]
  );

  const toggleBookmark = useCallback(
    async (article: Article) => {
      if (isBookmarked(article.link)) {
        return removeBookmark(article.link);
      }
      return addBookmark(article);
    },
    [isBookmarked, addBookmark, removeBookmark]
  );

  return { bookmarks, loading, isBookmarked, toggleBookmark, addBookmark, removeBookmark, reload: loadBookmarks };
}
