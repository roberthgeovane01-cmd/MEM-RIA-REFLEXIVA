import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLibraryItem, type NewLibraryItemInput } from "@/hooks/use-library";

export const Route = createFileRoute("/_authenticated/library/new")({
  head: () => ({ meta: [{ title: "Memória Reflexiva | Adicionar Conteúdo" }] }),
  component: AddContentPage,
});

type Mode = "upload" | "paste";

function AddContentPage() {
  const navigate = useNavigate();
  const createItem = useCreateLibraryItem();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("paste");
  const [title, setTitle] = useState("");
  const [itemType, setItemType] = useState<NewLibraryItemInput["itemType"]>("reflection");
  const [authorshipType, setAuthorshipType] =
    useState<NewLibraryItemInput["authorshipType"]>("self_authored");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      const item = await createItem.mutateAsync({
        title,
        itemType,
        authorshipType,
        category,
        tags,
        originalDate: originalDate || undefined,
        file: mode === "upload" ? (selectedFile ?? undefined) : undefined,
        pastedText: mode === "paste" ? pastedText : undefined,
      });
      await navigate({ to: "/library/$id", params: { id: item.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar. Tente novamente.");
    }
  };

  return (
    <div className="fade-up max-w-2xl">
      <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-primary">
        <span className="h-px w-8 bg-primary/60" />
        Biblioteca
      </p>
      <h1 className="mt-4 font-serif text-3xl text-foreground">Adicionar conteúdo</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        O original é preservado sem alterações. No momento, aceitamos texto colado ou arquivos
        .txt/.md — mais formatos chegam em breve.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8"
      >
        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Como você quer reconhecer este item"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="item_type">Tipo de conteúdo</Label>
            <Select
              value={itemType}
              onValueChange={(value) => setItemType(value as typeof itemType)}
            >
              <SelectTrigger id="item_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="book">Livro autoral</SelectItem>
                <SelectItem value="reflection">Reflexão pessoal</SelectItem>
                <SelectItem value="letter">Carta</SelectItem>
                <SelectItem value="report">Relato</SelectItem>
                <SelectItem value="message">Mensagem ou texto curto</SelectItem>
                <SelectItem value="note">Nota</SelectItem>
                <SelectItem value="document">Documento de trabalho</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="authorship_type">Autoria/origem</Label>
            <Select
              value={authorshipType}
              onValueChange={(value) => setAuthorshipType(value as typeof authorshipType)}
            >
              <SelectTrigger id="authorship_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self_authored">Escrito por mim</SelectItem>
                <SelectItem value="external">Referência externa</SelectItem>
                <SelectItem value="mixed">Misto</SelectItem>
                <SelectItem value="unknown">Não sei / prefiro não dizer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Só conteúdo "escrito por mim" alimenta o seu perfil autoral no futuro.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="original_date">Data do conteúdo (opcional)</Label>
            <Input
              id="original_date"
              type="date"
              value={originalDate}
              onChange={(event) => setOriginalDate(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (opcional, separadas por vírgula)</Label>
          <Input
            id="tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="gratidão, família, trabalho"
          />
        </div>

        <div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${mode === "paste" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}
            >
              Colar texto
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${mode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground/70"}`}
            >
              Enviar arquivo
            </button>
          </div>

          {mode === "paste" ? (
            <Textarea
              className="mt-3 min-h-48"
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              placeholder="Escreva ou cole o texto aqui…"
            />
          ) : (
            <div className="mt-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground hover:border-primary/40"
              >
                <Upload className="size-6 text-primary/60" aria-hidden="true" />
                {selectedFile ? (
                  <span className="text-foreground">{selectedFile.name}</span>
                ) : (
                  <span>Clique para escolher um arquivo .txt ou .md</span>
                )}
              </label>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={createItem.isPending} className="w-full sm:w-auto">
          {createItem.isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar na biblioteca
        </Button>
      </form>
    </div>
  );
}
