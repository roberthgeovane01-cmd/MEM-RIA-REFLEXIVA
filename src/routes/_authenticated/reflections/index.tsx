import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/reflections/")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Minhas Reflexões" }] }),
  component: () => (
    <PagePlaceholder
      icon={NotebookPen}
      title="Minhas Reflexões"
      description="O histórico das suas reflexões — rascunho, geração, revisão, aprovação e incorporação à memória, com versões comparáveis."
      phase="a Fase 7 (Reflexões)"
    />
  ),
});
