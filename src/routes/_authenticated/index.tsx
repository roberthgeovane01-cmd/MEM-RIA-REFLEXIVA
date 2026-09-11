import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Brain, NotebookPen, NotebookText, Plus, type LucideIcon } from "lucide-react";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: "Memória Reflexiva | Início" }],
  }),
  component: HomePage,
});

function SummaryCard({
  icon: Icon,
  title,
  to,
  emptyMessage,
}: {
  icon: LucideIcon;
  title: string;
  to: string;
  emptyMessage: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-primary">
        <Icon className="size-4" aria-hidden="true" />
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    </Link>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: LucideIcon; label: string; to: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-accent transition-colors hover:bg-primary/15"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

function HomePage() {
  const { data: profile, isLoading } = useProfile();
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
        new Date(),
      ),
    [],
  );

  const name = profile?.display_name?.trim();

  return (
    <div className="fade-up">
      <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-primary">
        <span className="h-px w-8 bg-primary/60" />
        <span className="capitalize">{today}</span>
      </p>

      {isLoading ? (
        <Skeleton className="mt-4 h-10 w-72" />
      ) : (
        <h1 className="mt-4 font-serif text-4xl text-foreground sm:text-5xl">
          Olá{name ? `, ${name}` : ""}.
        </h1>
      )}
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Este é o seu painel de continuidade — o que existe, o que está em andamento e o próximo
        passo.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <QuickAction icon={Plus} label="Adicionar conteúdo" to="/library" />
        <QuickAction icon={NotebookPen} label="Criar reflexão" to="/reflections/new" />
        <QuickAction icon={Brain} label="Consultar meu cérebro" to="/brain" />
        <QuickAction icon={NotebookText} label="Ver minhas reflexões" to="/reflections" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={BookOpen}
          title="Biblioteca"
          to="/library"
          emptyMessage="Nenhum item ainda. Adicione seu primeiro documento para começar."
        />
        <SummaryCard
          icon={Brain}
          title="Meu Cérebro"
          to="/brain"
          emptyMessage="Ainda não há material suficiente para um perfil autoral."
        />
        <SummaryCard
          icon={NotebookPen}
          title="Minhas Reflexões"
          to="/reflections"
          emptyMessage="Nenhuma reflexão criada ainda."
        />
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">Atividades recentes</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Nenhuma atividade registrada ainda. Assim que você adicionar conteúdo ou criar uma
          reflexão, ela aparece aqui.
        </p>
      </section>
    </div>
  );
}
