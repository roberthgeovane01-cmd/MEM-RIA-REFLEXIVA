import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";

import { PagePlaceholder } from "@/components/page-placeholder";

export const Route = createFileRoute("/_authenticated/brain")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Meu Cérebro" }] }),
  component: () => (
    <PagePlaceholder
      icon={Brain}
      title="Meu Cérebro"
      description="Seu perfil autoral versionado — estilo, temas, padrões de raciocínio, cada um com evidências rastreáveis até a fonte. Precisa da Biblioteca e da Memória para ter o que analisar."
      phase="a Fase 6 (Meu Cérebro)"
    />
  ),
});
