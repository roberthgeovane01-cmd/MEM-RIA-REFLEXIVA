import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Loader2, Plus, Search, Sparkles } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLibraryItems } from "@/hooks/use-library";
import { useSearchContent } from "@/hooks/use-search";

export const Route = createFileRoute("/_authenticated/library/")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Biblioteca" }] }),
  component: LibraryPage,
});

const ITEM_TYPE_LABELS: Record<string, string> = {
  book: "Livro",
  reflection: "Reflexão",
  letter: "Carta",
  report: "Relato",
  message: "Mensagem",
  note: "Nota",
  document: "Documento",
  other: "Outro",
};

const AUTHORSHIP_LABELS: Record<string, string> = {
  self_authored: "Autoral",
  external: "Externo",
  mixed: "Misto",
  unknown: "Desconhecido",
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Recebido",
  queued: "Na fila",
  extracting: "Extraindo texto",
  structuring: "Identificando estrutura",
  chunking: "Dividindo em trechos",
  embedding: "Gerando embeddings",
  extracting_memory: "Extraindo memórias",
  updating_profile: "Atualizando perfil autoral",
  completed: "Processado",
  failed: "Erro",
};

function LibraryPage() {
  const { data: items, isLoading } = useLibraryItems();
  const [query, setQuery] = useState("");
  const contentSearch = useSearchContent();

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const handleContentSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    contentSearch.mutate(query.trim());
  };

  return (
    <div className="fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-primary">
            <span className="h-px w-8 bg-primary/60" />
            Biblioteca
          </p>
          <h1 className="mt-4 font-serif text-3xl text-foreground">Seu acervo</h1>
        </div>
        <Link
          to="/library/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent"
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar conteúdo
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : !items || items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
          <BookOpen className="mx-auto size-10 text-primary/60" aria-hidden="true" />
          <h2 className="mt-4 font-serif text-xl text-foreground">Sua biblioteca está vazia</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Livros, cartas, relatos e reflexões que você adicionar aqui viram a base da sua memória
            pesquisável.
          </p>
          <Link
            to="/library/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-accent"
          >
            <Plus className="size-4" aria-hidden="true" />
            Adicionar primeiro conteúdo
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleContentSearch} className="mt-8 flex max-w-lg flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título, categoria, tag ou conteúdo…"
                className="pl-9"
                aria-label="Buscar na biblioteca"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={!query.trim() || contentSearch.isPending}
            >
              {contentSearch.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="size-4" aria-hidden="true" />
              )}
              Buscar no conteúdo
            </Button>
          </form>

          <p className="mt-4 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "item" : "itens"}
          </p>

          {contentSearch.isError && (
            <p className="mt-4 text-sm text-destructive">
              Não foi possível buscar no conteúdo:{" "}
              {contentSearch.error instanceof Error
                ? contentSearch.error.message
                : "erro desconhecido"}
              .
            </p>
          )}

          {contentSearch.data && (
            <section className="mt-4 rounded-2xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Resultados no conteúdo
              </h2>
              {contentSearch.data.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhum trecho encontrado para "{query}".
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {contentSearch.data.map((result) => (
                    <li key={result.chunk_id}>
                      <Link
                        to="/library/$id"
                        params={{ id: result.library_item_id }}
                        className="block rounded-xl p-3 transition-colors hover:bg-secondary/50"
                      >
                        <p className="text-sm font-medium text-card-foreground">
                          {result.library_item_title}
                          {result.section_title && (
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              · {result.section_title}
                            </span>
                          )}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {result.content}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {filtered.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Nenhum resultado para "{query}". Tente remover filtros ou usar outros termos.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {filtered.map((item) => (
                <li key={item.id}>
                  <Link
                    to="/library/$id"
                    params={{ id: item.id }}
                    className="flex flex-col gap-2 p-5 transition-colors hover:bg-secondary/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-serif text-lg text-card-foreground">
                        {item.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">{ITEM_TYPE_LABELS[item.item_type]}</Badge>
                        <Badge variant="outline">{AUTHORSHIP_LABELS[item.authorship_type]}</Badge>
                        {item.category && <Badge variant="outline">{item.category}</Badge>}
                      </div>
                    </div>
                    <span
                      className={
                        "shrink-0 text-[10px] uppercase tracking-[0.2em] " +
                        (item.processing_status === "failed"
                          ? "text-destructive"
                          : "text-muted-foreground")
                      }
                    >
                      {STATUS_LABELS[item.processing_status]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
