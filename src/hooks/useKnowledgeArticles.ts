import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type KnowledgeArticleVisibility = 'public' | 'authenticated' | 'admin';
export type KnowledgeArticleStatus = 'draft' | 'published' | 'archived';

export interface KnowledgeArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string | null;
  content: string;
  tags: string[];
  source_url: string | null;
  visibility: KnowledgeArticleVisibility;
  status: KnowledgeArticleStatus;
  created_at: string;
  updated_at: string;
}

interface UseKnowledgeArticlesOptions {
  query?: string;
  category?: string;
  tag?: string;
}

const normalize = (value: string) => value.trim().toLowerCase();

export function useKnowledgeArticles(options: UseKnowledgeArticlesOptions = {}) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);

    const { data, error } = await (supabase as any)
      .from('knowledge_articles')
      .select('id,title,slug,category,summary,content,tags,source_url,visibility,status,created_at,updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading knowledge articles:', error);
      toast.error('Não foi possível carregar a biblioteca');
      setArticles([]);
    } else {
      setArticles((data || []) as KnowledgeArticle[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const categories = useMemo(() => {
    const unique = new Set(articles.map(article => article.category).filter(Boolean));
    return ['Todas', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [articles]);

  const tags = useMemo(() => {
    const unique = new Set(articles.flatMap(article => article.tags || []));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let result = [...articles];

    if (options.query?.trim()) {
      const query = normalize(options.query);
      result = result.filter(article => {
        const haystack = [
          article.title,
          article.summary || '',
          article.content,
          article.category,
          ...(article.tags || []),
        ].join(' ').toLowerCase();

        return haystack.includes(query);
      });
    }

    if (options.category && options.category !== 'Todas') {
      result = result.filter(article => article.category === options.category);
    }

    if (options.tag) {
      result = result.filter(article => article.tags?.includes(options.tag || ''));
    }

    return result;
  }, [articles, options.category, options.query, options.tag]);

  return {
    articles: filteredArticles,
    allArticles: articles,
    categories,
    tags,
    loading,
    refresh: fetchArticles,
  };
}

export function useKnowledgeArticle(slug?: string) {
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchArticle() {
      if (!slug) {
        setArticle(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await (supabase as any)
        .from('knowledge_articles')
        .select('id,title,slug,category,summary,content,tags,source_url,visibility,status,created_at,updated_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Error loading knowledge article:', error);
        toast.error('Não foi possível carregar o artigo');
        setArticle(null);
      } else {
        setArticle((data || null) as KnowledgeArticle | null);
      }

      setLoading(false);
    }

    fetchArticle();

    return () => {
      active = false;
    };
  }, [slug]);

  return { article, loading };
}
