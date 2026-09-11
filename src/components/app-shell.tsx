import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  Brain,
  Home,
  LogOut,
  NotebookText,
  PenLine,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type NavItem = { to: string; label: string; icon: LucideIcon };

// The five recurring destinations (MR-00 §9). Settings lives in the profile
// menu, not the primary nav.
const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/library", label: "Biblioteca", icon: BookOpen },
  { to: "/reflections/new", label: "Criar Reflexão", icon: PenLine },
  { to: "/brain", label: "Meu Cérebro", icon: Brain },
  { to: "/reflections", label: "Minhas Reflexões", icon: NotebookText },
];

function initials(name: string | undefined | null) {
  const trimmed = name?.trim();
  if (!trimmed) return "MR";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "MR";
}

function ProfileMenu() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="grid size-9 place-items-center rounded-full border border-primary/40 bg-secondary text-[11px] text-accent outline-none focus-visible:ring-1 focus-visible:ring-ring">
        {initials(profile?.display_name)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">
          {profile?.display_name || user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex w-full items-center gap-2">
            <Settings2 className="size-4" />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2">
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavLink({ item, className }: { item: NavItem; className?: string }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      activeOptions={{ exact: item.to === "/" }}
      className={className}
      activeProps={{ "data-active": "true" }}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <Link to="/" className="mb-8 block px-2 font-serif text-xl font-semibold text-primary">
          Memória Reflexiva
        </Link>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              item={item}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground data-[active=true]:bg-primary/15 data-[active=true]:text-accent"
            />
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-border pt-4">
          <ProfileMenu />
          <span className="text-xs text-muted-foreground">Minha conta</span>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex h-16 items-center justify-between border-b border-border px-4 md:hidden">
        <Link to="/" className="font-serif text-lg font-semibold text-primary">
          Memória Reflexiva
        </Link>
        <ProfileMenu />
      </header>

      <main className="md:pl-60">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-8 md:pb-10 md:pt-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 flex items-stretch justify-around border-t border-border bg-card md:hidden"
        aria-label="Navegação principal"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] text-foreground/70 data-[active=true]:text-accent [&>svg]:mx-auto"
          />
        ))}
      </nav>
    </div>
  );
}
