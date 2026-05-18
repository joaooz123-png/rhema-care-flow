import type { Json } from './types';

export type KnowledgeArticleVisibility = 'public' | 'authenticated' | 'admin';
export type KnowledgeArticleStatus = 'draft' | 'published' | 'archived';

export type KnowledgeLibraryDatabase = {
  public: {
    Tables: {
      knowledge_articles: {
        Row: {
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
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category?: string;
          summary?: string | null;
          content: string;
          tags?: string[];
          source_url?: string | null;
          visibility?: KnowledgeArticleVisibility;
          status?: KnowledgeArticleStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          summary?: string | null;
          content?: string;
          tags?: string[];
          source_url?: string | null;
          visibility?: KnowledgeArticleVisibility;
          status?: KnowledgeArticleStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_documents: {
        Row: {
          id: string;
          article_id: string | null;
          title: string;
          source_type: 'article' | 'pdf' | 'markdown' | 'url' | 'note';
          source_url: string | null;
          storage_path: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id?: string | null;
          title: string;
          source_type?: 'article' | 'pdf' | 'markdown' | 'url' | 'note';
          source_url?: string | null;
          storage_path?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string | null;
          title?: string;
          source_type?: 'article' | 'pdf' | 'markdown' | 'url' | 'note';
          source_url?: string | null;
          storage_path?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_documents_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'knowledge_articles';
            referencedColumns: ['id'];
          }
        ];
      };
      knowledge_chunks: {
        Row: {
          id: string;
          document_id: string | null;
          article_id: string | null;
          chunk_index: number;
          chunk_text: string;
          token_count: number | null;
          embedding: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id?: string | null;
          article_id?: string | null;
          chunk_index?: number;
          chunk_text: string;
          token_count?: number | null;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string | null;
          article_id?: string | null;
          chunk_index?: number;
          chunk_text?: string;
          token_count?: number | null;
          embedding?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_chunks_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'knowledge_articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'knowledge_chunks_document_id_fkey';
            columns: ['document_id'];
            isOneToOne: false;
            referencedRelation: 'knowledge_documents';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_knowledge_chunks: {
        Args: {
          query_embedding: string;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: {
          id: string;
          article_id: string;
          document_id: string;
          chunk_text: string;
          similarity: number;
          metadata: Json;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type KnowledgeArticle = KnowledgeLibraryDatabase['public']['Tables']['knowledge_articles']['Row'];
export type KnowledgeDocument = KnowledgeLibraryDatabase['public']['Tables']['knowledge_documents']['Row'];
export type KnowledgeChunk = KnowledgeLibraryDatabase['public']['Tables']['knowledge_chunks']['Row'];
