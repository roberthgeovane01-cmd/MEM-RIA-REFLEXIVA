import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Brain, Layers, Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteLibraryItem, useLibraryItem } from "@/hooks/use-library";
import { TERMINAL_PROCESSING_STATUSES, type ProcessingStatus } from "@/lib/document-processing";

export const Route = createFileRoute("/_authenticated/library/$id")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Documento" }] }),
  component: DocumentDetailPage,
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
  self_authored: "Escrito por mim",
  external: "Referência externa",
  mixed: "Misto",
  unknown: "Autoria desconhecida",
};

const STATUS_LABELS: Record<ProcessingStatus, string> = {
  uploaded: "Recebido",
  queued: "Na fila de processamento",
  extracting: "Extraindo texto",
  structuring: "Identificando estrutura",
  chunking: "Dividindo em trechos",
  embedding: "Gerando embeddings",
  extracting_memory: "Extraindo memórias",
  updating_profile: "Atualizando perfil autoral",
  completed: "Processado",
  failed: "Erro no processamento",
};

const SECTION_TYPE_LABELS: Record<string, string> = {
  book: "Livro",
  part: "Parte",
  chapter: "Capítulo",
  section: "Seção",
  subtitle: "Subtítulo",
  page: "Página",
};

function DocumentDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useLibraryItem(id);
  const deleteItem = useDeleteLibraryItem();

  const handleDelete = async () => {
    if (!data) return;
    await deleteItem.mutateAsync({ id: data.item.id, files: data.files });
    await navigate({ to: "/library" });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar este documento — ele pode ter sido removido.{" "}
        <Link to="/library" className="text-primary underline">
          Voltar para a Biblioteca
        </Link>
      </p>
    );
  }

  const { item, files, sections, chunkCount, job } = data;
  const latestFile = files[0];
  const status = item.processing_status as ProcessingStatus;
  const isProcessing = !TERMINAL_PROCESSING_STATUSES.has(status);

  return (
    <div className="fade-up max-w-3xl">
      <Link
        to="/library"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Biblioteca
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">{item.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{ITEM_TYPE_LABELS[item.item_type]}</Badge>
            <Badge variant="outline">{AUTHORSHIP_LABELS[item.authorship_type]}</Badge>
            <Badge
              variant={status === "failed" ? "destructive" : isProcessing ? "secondary" : "outline"}
            >
              {isProcessing && <Loader2 className="mr-1 size-3 animate-spin" aria-hidden="true" />}
              {STATUS_LABELS[status] ?? status}
            </Badge>
            {item.category && <Badge variant="outline">{item.category}</Badge>}
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="size-4" />
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir "{item.title}"?</AlertDialogTitle>
              <AlertDialogDescription>
                O arquivo original e os metadados serão removidos permanentemente. Esta ação não
                pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {latestFile && (
        <p className="mt-4 text-xs text-muted-foreground">
          {latestFile.original_filename} · {(latestFile.file_size / 1024).toFixed(1)} KB ·
          adicionado em {new Date(item.created_at).toLocaleDateString("pt-BR")}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">Conteúdo</h2>
        {latestFile?.extracted_text ? (
          <p className="mt-4 whitespace-pre-wrap font-serif text-lg leading-relaxed text-card-foreground">
            {latestFile.extracted_text}
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Texto ainda não disponível para este item.
          </p>
        )}
      </section>

      {status === "failed" && job?.error_message && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          <p className="font-medium">O processamento deste item falhou.</p>
          <p className="mt-1 text-destructive/80">{job.error_message}</p>
        </div>
      )}

      {status === "completed" && sections.length > 0 && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-primary">
            <Layers className="size-3.5" aria-hidden="true" />
            Estrutura e indexação
          </h2>
          {sections.length > 1 || sections.some((section) => section.title) ? (
            <ul className="mt-4 space-y-1.5">
              {sections.map((section) => (
                <li key={section.id} className="flex items-baseline gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {SECTION_TYPE_LABELS[section.section_type] ?? section.section_type}
                  </Badge>
                  <span className="truncate text-card-foreground">
                    {section.title ?? "(sem título)"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma divisão em capítulos ou seções foi identificada — o texto foi tratado como um
              único bloco.
            </p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            {chunkCount} {chunkCount === 1 ? "trecho preparado" : "trechos preparados"} para busca
            (a busca em si chega na Fase 4 — ver docs/ROADMAP.md).
          </p>
        </section>
      )}

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        <Brain className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Memórias extraídas, resumo por IA e uso deste documento em reflexões chegam nas próximas
          fases (ver docs/ROADMAP.md).
        </p>
      </div>
    </div>
  );
}
