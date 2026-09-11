import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Biblioteca" }] }),
  component: () => (
    <PagePlaceholder
      icon={BookOpen}
      title="Biblioteca"
      description="Aqui você vai preservar livros, cartas, relatos e reflexões, e acompanhar o processamento de cada um. Upload, metadados e o pipeline de processamento chegam nesta fase."
      phase="a Fase 2 (Biblioteca)"
    />
  ),
});
