import type { LucideIcon } from "lucide-react";

/**
 * Placeholder for a module whose route/shell exists (so navigation is real)
 * but whose functionality is scheduled for a later roadmap phase. Never used
 * to fake a finished feature — always says plainly what's missing.
 */
export function PagePlaceholder({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="fade-up">
      <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-primary">
        <span className="h-px w-8 bg-primary/60" />
        {title}
      </p>
      <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-border bg-card/50 p-8 sm:p-10">
        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
          Planejado para {phase} — ver docs/ROADMAP.md
        </p>
      </div>
    </div>
  );
}
