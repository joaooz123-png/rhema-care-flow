import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookOpen, Database, FileText, Search, Sparkles, Tags } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useKnowledgeArticles } from '@/hooks/useKnowledgeArticles';

export default function PublicKnowledgeLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [tag, setTag] = useState<string | undefined>();

  const { articles, categories, tags, loading } = useKnowledgeArticles({ query, category, tag });

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <section className="border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="max-w-4xl">
            <Badge className="mb-4 gap-2" variant="secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Biblioteca viva de conhecimento
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Biblioteca UHS Health OS
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
              Protocolos, fundamentos, glossário, materiais educativos e documentação técnica organizados em uma camada de conhecimento pesquisável.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Artigos versionáveis</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Base Supabase</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Preparada para RAG</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por tema, protocolo, doença, conceito ou tag..."
                  className="pl-10"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(item => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant={!tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTag(undefined)}
                >
                  Todas as tags
                </Button>
                {tags.slice(0, 18).map(item => (
                  <Button
                    key={item}
                    variant={tag === item ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTag(item)}
                    className="gap-1.5"
                  >
                    <Tags className="h-3.5 w-3.5" />
                    {item}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h2 className="font-semibold">Nenhum artigo encontrado</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente limpar filtros ou cadastre novos conteúdos em knowledge_articles.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {articles.map(article => (
              <Card key={article.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="secondary">{article.category}</Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(article.updated_at), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-xl">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {article.summary || article.content.replace(/[#*_>`-]/g, '').slice(0, 180)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(article.tags || []).slice(0, 4).map(item => (
                      <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                  <div className="mt-auto pt-5">
                    <Button asChild className="w-full">
                      <Link to={`/biblioteca/${article.slug}`}>Ler artigo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-10">
        <Card className="border-dashed">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-2">Nota de uso clínico e estratégico</h2>
            <ReactMarkdown rehypePlugins={[rehypeSanitize]} className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
              {'Esta biblioteca é uma camada de organização de conhecimento. Ela não substitui avaliação médica, diretrizes oficiais, governança clínica ou revisão humana quando o conteúdo for usado em decisão assistencial.'}
            </ReactMarkdown>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
