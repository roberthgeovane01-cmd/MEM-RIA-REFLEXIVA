import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  // Auth-adjacent page: no SEO value in SSR-ing it, and it depends on
  // browser-persisted session state (see src/lib/auth.tsx).
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

type Mode = "sign_in" | "sign_up" | "forgot_password";

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "forgot_password") {
        await supabase.auth.resetPasswordForEmail(email);
        // Never reveal whether the e-mail exists (MR-01 §3).
        setInfo("Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
        return;
      }

      if (mode === "sign_up") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (data.session) {
          await navigate({ to: "/" });
          return;
        }
        setInfo("Conta criada. Verifique seu e-mail para confirmar o acesso antes de entrar.");
        setMode("sign_in");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("E-mail ou senha incorretos.");
        return;
      }
      await navigate({ to: "/" });
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="fade-up w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-serif text-3xl font-semibold text-primary">Memória Reflexiva</span>
          <p className="mt-2 text-sm text-muted-foreground">
            Um diário contemplativo para pensar devagar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8"
          noValidate
        >
          <h1 className="font-serif text-xl text-card-foreground">
            {mode === "sign_in" && "Entrar"}
            {mode === "sign_up" && "Criar conta"}
            {mode === "forgot_password" && "Recuperar senha"}
          </h1>

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {mode !== "forgot_password" && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "sign_up" ? "new-password" : "current-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="mt-4 text-sm text-accent">
              {info}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-6 w-full">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "sign_in" && "Entrar"}
            {mode === "sign_up" && "Criar conta"}
            {mode === "forgot_password" && "Enviar link de recuperação"}
          </Button>

          <div className="mt-5 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            {mode === "sign_in" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot_password");
                    setError(null);
                    setInfo(null);
                  }}
                  className="hover:text-foreground"
                >
                  Esqueci minha senha
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("sign_up");
                    setError(null);
                    setInfo(null);
                  }}
                  className="hover:text-foreground"
                >
                  Não tem conta? Criar conta
                </button>
              </>
            )}
            {mode !== "sign_in" && (
              <button
                type="button"
                onClick={() => {
                  setMode("sign_in");
                  setError(null);
                  setInfo(null);
                }}
                className="hover:text-foreground"
              >
                Voltar para o login
              </button>
            )}
          </div>
        </form>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <Link to="/">Memória Reflexiva</Link> · privado por padrão
        </p>
      </div>
    </div>
  );
}
