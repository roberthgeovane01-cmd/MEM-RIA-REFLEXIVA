import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/reflections/new")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Criar Reflexão" }] }),
  component: () => (
    <PagePlaceholder
      icon={NotebookPen}
      title="Criar Reflexão"
      description="O motor de reflexões: reflexão externa, comentário pessoal, busca na memória, conflitos, plano, geração e revisão humana antes de qualquer incorporação."
      phase="a Fase 7 (Reflexões)"
    />
  ),
});
