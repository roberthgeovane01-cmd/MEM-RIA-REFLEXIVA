import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import journalImage from "@/assets/memoria-journal.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Memória Reflexiva | Diário contemplativo" },
      {
        name: "description",
        content: "Registre memórias, emoções e aprendizados em um diário pessoal e contemplativo.",
      },
      { property: "og:title", content: "Memória Reflexiva | Diário contemplativo" },
      {
        property: "og:description",
        content: "Um espaço íntimo para guardar memórias e pensar devagar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const moods = ["Serena", "Gratidão", "Melancolia", "Contemplação"];

function Index() {
  const [note, setNote] = useState(
    "Hoje percebi que a urgência me faz perder as coisas mais lentas e preciosas…",
  );
  const [mood, setMood] = useState("Serena");
  const [saved, setSaved] = useState(false);
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(
        new Date(),
      ),
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 sm:px-10">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-2xl font-semibold text-primary">
              Memória Reflexiva
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.35em] text-muted-foreground sm:block">
              Diário contemplativo
            </span>
          </div>
          <nav
            className="hidden items-center gap-9 text-[11px] uppercase tracking-[0.25em] md:flex"
            aria-label="Navegação principal"
          >
            <a href="#diario" className="text-accent">
              Diário
            </a>
            <a
              href="#emocao"
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              Emoções
            </a>
            <a
              href="#memorias"
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              Aprendizados
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] capitalize text-muted-foreground sm:block">
              {today}
            </span>
            <div className="grid size-9 place-items-center rounded-full border border-primary/40 bg-secondary text-[11px] text-accent">
              MR
            </div>
          </div>
        </div>
      </header>

      <main
        id="diario"
        className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-12 lg:gap-14"
      >
        <section className="fade-up lg:col-span-7">
          <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-primary">
            <span className="h-px w-8 bg-primary/60" />
            Reflexão de hoje
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-foreground sm:text-6xl">
            O que ficou <span className="italic text-accent">guardado</span> no silêncio desta
            manhã?
          </h1>
          <p className="mt-6 max-w-md font-light leading-relaxed text-muted-foreground">
            Um espaço para nomear o que sentiu, o que aprendeu e o que deseja levar adiante. Escreva
            sem pressa; as palavras se ordenam sozinhas.
          </p>
          <div className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            <label
              htmlFor="memory"
              className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
            >
              Sua nota
            </label>
            <textarea
              id="memory"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setSaved(false);
              }}
              className="mt-3 min-h-40 w-full resize-none border-b border-primary/25 bg-transparent pb-4 font-serif text-2xl leading-relaxed text-card-foreground outline-none placeholder:text-muted-foreground"
              placeholder="Escreva o que deseja guardar…"
            />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/25 bg-primary/15 px-3 py-1.5 text-[11px] text-accent">
                  {mood}
                </span>
                <span className="rounded-full border border-border bg-foreground/5 px-3 py-1.5 text-[11px] text-foreground/70">
                  Reflexão
                </span>
              </div>
              <button
                type="button"
                disabled={!note.trim()}
                onClick={() => setSaved(true)}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-[11px] font-medium uppercase tracking-[0.25em] text-primary-foreground transition-colors hover:bg-accent disabled:opacity-40"
              >
                {saved ? "Memória guardada" : "Guardar memória"}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </div>
          </div>
        </section>

        <aside id="emocao" className="fade-up lg:col-span-5 [animation-delay:120ms]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">
                Como você se sente
              </h2>
              <span className="font-serif text-3xl text-accent">{mood}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {moods.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMood(item)}
                  className={`rounded-xl border px-3 py-3 text-sm transition-colors ${mood === item ? "border-primary/40 bg-primary/10 text-accent" : "border-border bg-foreground/5 text-foreground/70 hover:border-foreground/20"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div id="memorias" className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-primary">
              Memórias recentes
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {[
                [
                  "12 · mar · 2024",
                  "Aprendizado",
                  "Aprender a parar também é uma forma de avançar.",
                ],
                [
                  "08 · mar · 2024",
                  "Emoção",
                  "A chuva de hoje trouxe uma calma que eu não sabia precisar.",
                ],
                [
                  "02 · mar · 2024",
                  "Memória",
                  "O cheiro do café da minha avó, antes de qualquer palavra.",
                ],
              ].map(([date, type, text]) => (
                <li key={date} className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {date}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent">
                      {type}
                    </span>
                  </div>
                  <p className="mt-2 font-serif text-xl leading-snug text-card-foreground">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="fade-up lg:col-span-12 [animation-delay:240ms]">
          <div className="overflow-hidden rounded-2xl border border-border">
            <img
              src={journalImage}
              alt="Caderno aberto e uma xícara sobre uma mesa iluminada por uma luz suave"
              width={1920}
              height={760}
              loading="lazy"
              className="aspect-[16/7] w-full object-cover"
            />
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="max-w-2xl font-serif text-2xl leading-snug text-foreground sm:text-3xl">
              “Guardar memórias é uma maneira gentil de conversar com quem você está se tornando.”
            </p>
            <a
              href="#memorias"
              className="shrink-0 text-[11px] uppercase tracking-[0.3em] text-primary transition-colors hover:text-accent"
            >
              Reler a semana →
            </a>
          </div>
        </section>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:flex-row sm:px-10">
          <span>Memória Reflexiva · um diário para pensar devagar</span>
          <span>© 2026 · feito com calma</span>
        </div>
      </footer>
    </div>
  );
}
