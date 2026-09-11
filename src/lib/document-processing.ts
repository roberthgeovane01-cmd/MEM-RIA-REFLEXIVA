// Fase 3 — Ingestão pipeline orchestration. See docs/DECISIONS.md
// (11/09/2026, "Fase 3 — pipeline síncrono no cliente") for why structuring
// + chunking run as a fire-and-forget client-side task instead of a
// Supabase Edge Function/queue: they're deterministic and need no AI
// provider or secret. Once this reaches 'completed', it hands off to the
// `generate-embeddings` Edge Function (Fase 4) — the first pipeline step
// that genuinely needs a backend, since it calls OpenAI with a secret that
// can't live in the browser.

import { supabase } from "@/integrations/supabase/client";
import { buildChunks, buildSections } from "@/lib/document-structuring";

export type ProcessingStatus =
  | "uploaded"
  | "queued"
  | "extracting"
  | "structuring"
  | "chunking"
  | "embedding"
  | "extracting_memory"
  | "updating_profile"
  | "completed"
  | "failed";

/** Statuses this Fase 3 pipeline can actually stop on — embedding/extracting_memory/updating_profile arrive in later phases. */
export const TERMINAL_PROCESSING_STATUSES = new Set<ProcessingStatus>(["completed", "failed"]);

export async function createIngestionJob(ownerId: string, libraryItemId: string) {
  const { data, error } = await supabase
    .from("processing_jobs")
    .insert({
      owner_id: ownerId,
      job_type: "document_ingestion",
      entity_type: "library_item",
      entity_id: libraryItemId,
      status: "queued" satisfies ProcessingStatus,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePipelineStatus(
  jobId: string,
  libraryItemId: string,
  status: ProcessingStatus,
  extra: { progress?: number; error_message?: string; finished_at?: string } = {},
) {
  const [jobResult, itemResult] = await Promise.all([
    supabase
      .from("processing_jobs")
      .update({ status, ...extra })
      .eq("id", jobId),
    supabase.from("library_items").update({ processing_status: status }).eq("id", libraryItemId),
  ]);

  if (jobResult.error) throw jobResult.error;
  if (itemResult.error) throw itemResult.error;
}

/**
 * Runs structuring + chunking for a just-created library item and advances
 * its status the whole way through. Never throws — on failure it records
 * 'failed' on both the job and the item and returns, since it's always
 * called fire-and-forget (the item is already created and visible to the
 * user by the time this runs).
 */
export async function runIngestionPipeline(params: {
  ownerId: string;
  libraryItemId: string;
  jobId: string;
  extractedText: string;
}): Promise<void> {
  const { ownerId, libraryItemId, jobId, extractedText } = params;

  try {
    // Extraction itself already happened (Fase 2, before this job existed) —
    // this marks that stage explicitly so status history stays honest.
    await updatePipelineStatus(jobId, libraryItemId, "extracting", { progress: 15 });

    await updatePipelineStatus(jobId, libraryItemId, "structuring", { progress: 35 });
    const sections = buildSections(extractedText);

    const insertedSectionIds: string[] = [];
    for (const section of sections) {
      const { data, error } = await supabase
        .from("document_sections")
        .insert({
          owner_id: ownerId,
          library_item_id: libraryItemId,
          parent_section_id:
            section.parentIndex !== null ? (insertedSectionIds[section.parentIndex] ?? null) : null,
          section_type: section.sectionType,
          title: section.title,
          sequence: section.sequence,
          text_content: section.textContent,
        })
        .select("id")
        .single();

      if (error) throw error;
      insertedSectionIds.push(data.id);
    }

    await updatePipelineStatus(jobId, libraryItemId, "chunking", { progress: 70 });
    const chunks = buildChunks(sections);

    if (chunks.length > 0) {
      const rows = chunks.map((chunk) => ({
        owner_id: ownerId,
        library_item_id: libraryItemId,
        section_id: insertedSectionIds[chunk.sectionIndex] ?? null,
        chunk_index: chunk.chunkIndex,
        content: chunk.content,
        token_count: chunk.tokenCount,
      }));
      const { error } = await supabase.from("document_chunks").insert(rows);
      if (error) throw error;
    }

    await updatePipelineStatus(jobId, libraryItemId, "completed", {
      progress: 100,
      finished_at: new Date().toISOString(),
    });

    // Fase 4 — RAG: fire-and-forget hand-off. If the Edge Function isn't
    // deployed yet or OPENAI_API_KEY isn't configured, this just logs and
    // the item stays 'completed' without embeddings — full-text search
    // still works, only the semantic half of the hybrid search is skipped.
    void supabase.functions
      .invoke("generate-embeddings", { body: { libraryItemId } })
      .catch((err) => {
        console.error("generate-embeddings invocation failed:", err);
      });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido no processamento.";
    try {
      await updatePipelineStatus(jobId, libraryItemId, "failed", {
        error_message: message,
        finished_at: new Date().toISOString(),
      });
    } catch {
      // Best effort — surfacing the original error matters more than this write succeeding.
    }
  }
}
