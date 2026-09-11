import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLibraryItems } from "@/hooks/use-library";

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
          <div className="relative mt-8 max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, categoria ou tag…"
              className="pl-9"
              aria-label="Buscar na biblioteca"
            />
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "item" : "itens"}
          </p>

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
