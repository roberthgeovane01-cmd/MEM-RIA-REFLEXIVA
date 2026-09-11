import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { detectExtension, extractText } from "@/lib/document-extraction";
import {
  createIngestionJob,
  runIngestionPipeline,
  TERMINAL_PROCESSING_STATUSES,
  type ProcessingStatus,
} from "@/lib/document-processing";

export type LibraryItemType =
  "book" | "reflection" | "letter" | "report" | "message" | "note" | "document" | "other";

export type LibraryAuthorshipType = "self_authored" | "external" | "mixed" | "unknown";

export type LibraryItem = Awaited<ReturnType<typeof fetchLibraryItems>>[number];

async function fetchLibraryItems(ownerId: string) {
  const { data, error } = await supabase
    .from("library_items")
    .select("*")
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

function isProcessing(status: string): boolean {
  return !TERMINAL_PROCESSING_STATUSES.has(status as ProcessingStatus);
}

export function useLibraryItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["library_items", user?.id],
    enabled: !!user,
    queryFn: () => fetchLibraryItems(user!.id),
    refetchInterval: (query) =>
      query.state.data?.some((item) => isProcessing(item.processing_status)) ? 2000 : false,
  });
}

export function useLibraryItem(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["library_items", user?.id, id],
    enabled: !!user && !!id,
    refetchInterval: (query) =>
      query.state.data && isProcessing(query.state.data.item.processing_status) ? 1500 : false,
    queryFn: async () => {
      const [itemResult, filesResult, sectionsResult, chunksCountResult, jobResult] =
        await Promise.all([
          supabase.from("library_items").select("*").eq("id", id).single(),
          supabase
            .from("library_files")
            .select("*")
            .eq("library_item_id", id)
            .order("version", { ascending: false }),
          supabase
            .from("document_sections")
            .select("*")
            .eq("library_item_id", id)
            .order("sequence", { ascending: true }),
          supabase
            .from("document_chunks")
            .select("*", { count: "exact", head: true })
            .eq("library_item_id", id),
          supabase
            .from("processing_jobs")
            .select("*")
            .eq("entity_type", "library_item")
            .eq("entity_id", id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      if (itemResult.error) throw itemResult.error;
      if (filesResult.error) throw filesResult.error;
      if (sectionsResult.error) throw sectionsResult.error;
      if (chunksCountResult.error) throw chunksCountResult.error;
      if (jobResult.error) throw jobResult.error;

      return {
        item: itemResult.data,
        files: filesResult.data,
        sections: sectionsResult.data,
        chunkCount: chunksCountResult.count ?? 0,
        job: jobResult.data,
      };
    },
  });
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB — generous for text, PDF and DOCX.

export type NewLibraryItemInput = {
  title: string;
  itemType: LibraryItemType;
  authorshipType: LibraryAuthorshipType;
  category?: string | undefined;
  tags: string[];
  originalDate?: string | undefined;
  /** Either a .txt/.md file, or pasted text — exactly one is provided by the form. */
  file?: File | undefined;
  pastedText?: string | undefined;
};

function validateNewLibraryItem(input: NewLibraryItemInput) {
  if (!input.title.trim()) throw new Error("O título é obrigatório.");

  const hasFile = !!input.file;
  const hasPastedText = !!input.pastedText?.trim();
  if (!hasFile && !hasPastedText) {
    throw new Error("Envie um arquivo ou cole o texto.");
  }

  if (hasFile) {
    const file = input.file!;
    if (!detectExtension(file.name)) {
      throw new Error("Formato não suportado. Aceitamos .txt, .md, .pdf e .docx.");
    }
    if (file.size === 0) throw new Error("O arquivo está vazio.");
    if (file.size > MAX_FILE_SIZE_BYTES) throw new Error("Arquivo maior que 20MB.");
  }
}

async function createLibraryItem(ownerId: string, input: NewLibraryItemInput) {
  validateNewLibraryItem(input);

  const { data: item, error: itemError } = await supabase
    .from("library_items")
    .insert({
      owner_id: ownerId,
      title: input.title.trim(),
      item_type: input.itemType,
      authorship_type: input.authorshipType,
      category: input.category?.trim() || null,
      tags: input.tags,
      original_date: input.originalDate || null,
      year: input.originalDate ? new Date(input.originalDate).getFullYear() : null,
    })
    .select()
    .single();

  if (itemError) throw itemError;

  try {
    const filename = input.file ? input.file.name : `${input.title.trim() || "reflexao"}.txt`;
    const blob = input.file ?? new Blob([input.pastedText ?? ""], { type: "text/plain" });
    const text = input.file ? await extractText(input.file) : (input.pastedText ?? "").trim();
    const storagePath = `${ownerId}/${item.id}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("library-originals")
      .upload(storagePath, blob, {
        contentType: input.file?.type || "text/plain",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { error: fileError } = await supabase.from("library_files").insert({
      owner_id: ownerId,
      library_item_id: item.id,
      storage_path: storagePath,
      original_filename: filename,
      mime_type: input.file?.type || "text/plain",
      file_size: blob.size,
      extracted_text: text,
    });

    if (fileError) throw fileError;

    // Fase 3 — Ingestão: structuring/chunking run fire-and-forget so the
    // form doesn't block on them (see docs/DECISIONS.md). The item is
    // already saved at this point; the job/pipeline only refines it further.
    const job = await createIngestionJob(ownerId, item.id);
    void runIngestionPipeline({
      ownerId,
      libraryItemId: item.id,
      jobId: job.id,
      extractedText: text,
    });

    return item;
  } catch (err) {
    // Best-effort cleanup: don't leave an item with no file behind.
    await supabase.from("library_items").delete().eq("id", item.id);
    throw err;
  }
}

export function useCreateLibraryItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NewLibraryItemInput) => createLibraryItem(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library_items", user?.id] });
    },
  });
}

export function useDeleteLibraryItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { id: string; files: { storage_path: string }[] }) => {
      if (item.files.length > 0) {
        await supabase.storage
          .from("library-originals")
          .remove(item.files.map((f) => f.storage_path));
      }
      // document_sections/document_chunks cascade via library_item_id FK,
      // but processing_jobs.entity_id is a loose reference (see the Fase 3
      // migration) — clean it up explicitly.
      await supabase
        .from("processing_jobs")
        .delete()
        .eq("entity_type", "library_item")
        .eq("entity_id", item.id);
      const { error } = await supabase.from("library_items").delete().eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library_items", user?.id] });
    },
  });
}
