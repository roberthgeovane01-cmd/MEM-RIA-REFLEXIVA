import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Configurações" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/login" });
  };

  return (
    <div className="fade-up">
      <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-primary">
        <span className="h-px w-8 bg-primary/60" />
        Configurações
      </p>
      <h1 className="mt-4 font-serif text-3xl text-foreground">Minha conta</h1>

      <div className="mt-8 max-w-md rounded-2xl border border-border bg-card p-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : (
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Nome de exibição
              </dt>
              <dd className="mt-1 text-foreground">{profile?.display_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                E-mail
              </dt>
              <dd className="mt-1 text-foreground">{user?.email}</dd>
            </div>
          </dl>
        )}

        <Button variant="outline" onClick={handleSignOut} className="mt-6 gap-2">
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
        <Settings2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Preferências de IA, memória, privacidade e integrações fazem parte de uma fase posterior
          (ver docs/specs/MR-09-configuracoes.md e docs/ROADMAP.md).
        </p>
      </div>
    </div>
  );
}
