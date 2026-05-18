import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useKnowledgeArticle } from '@/hooks/useKnowledgeArticles';

export default function PublicKnowledgeArticle() {
  const { slug } = useParams();
  const { article, loading } = useKnowledgeArticle(slug);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-10">
          <Skeleton className="mb-6 h-9 w-40" />
          <Skeleton className="mb-4 h-8 w-32" />
          <Skeleton className="mb-4 h-12 w-3/4" />
          <Skeleton className="mb-8 h-5 w-1/2" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-10/12" />
            <Skeleton className="h-5 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
          <p className="mt-2 text-muted-foreground">
            O conteúdo pode estar em rascunho, arquivado ou restrito.
          </p>
          <Button asChild className="mt-6">
            <Link to="/biblioteca">Voltar para biblioteca</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <article className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/biblioteca">
            <ArrowLeft className="h-4 w-4" />
            Voltar para biblioteca
          </Link>
        </Button>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge>{article.category}</Badge>
            <span className="text-sm text-muted-foreground">
              Atualizado em {format(new Date(article.updated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {article.title}
          </h1>
          {article.summary && (
            <p className="mt-4 text-lg text-muted-foreground">
              {article.summary}
            </p>
          )}
          {article.tags?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </header>

        <Card>
          <CardContent className="p-5 md:p-8">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]} className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary">
              {article.content}
            </ReactMarkdown>
          </CardContent>
        </Card>

        {article.source_url && (
          <div className="mt-6">
            <Button asChild variant="outline" className="gap-2">
              <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                Fonte externa
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </article>
    </main>
  );
}
