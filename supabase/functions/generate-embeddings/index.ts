// Fase 4 — RAG. Embeds every not-yet-embedded chunk of a library_item.
// Called fire-and-forget from src/lib/document-processing.ts once the
// Fase 3 client-side pipeline reaches 'completed' — this is the first
// pipeline step that needs to run server-side, since it needs
// OPENAI_API_KEY (docs/DECISIONS.md, 11/09/2026).
//
// Runs with a request-scoped client authenticated as the calling user
// (their JWT, forwarded from the browser) — not service_role. RLS already
// scopes every read/write to their own rows, so no elevated privilege is
// needed here (docs/SECURITY.md: menor privilégio).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";
import {
  EMBEDDING_MODEL,
  EMBEDDING_VERSION,
  embedTexts,
  toVectorLiteral,
} from "../_shared/embedding-provider.ts";

const BATCH_SIZE = 96;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let supabase: ReturnType<typeof createClient> | undefined;
  let libraryItemId: string | undefined;
  let markStatus: (
    status: string,
    extra?: Record<string, unknown>,
  ) => Promise<void> = async () => {};

  try {
    ({ libraryItemId } = (await req.json()) as { libraryItemId?: string });
    if (!libraryItemId) return jsonResponse({ error: "libraryItemId é obrigatório." }, 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autenticado." }, 401);

    supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Sessão inválida." }, 401);

    const { data: job } = await supabase
      .from("processing_jobs")
      .select("id")
      .eq("entity_type", "library_item")
      .eq("entity_id", libraryItemId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const jobId = job?.id as string | undefined;

    const itemId = libraryItemId;
    const client = supabase;
    markStatus = async (status, extra = {}) => {
      await Promise.all([
        jobId
          ? client
              .from("processing_jobs")
              .update({ status, ...extra })
              .eq("id", jobId)
          : Promise.resolve(),
        client.from("library_items").update({ processing_status: status }).eq("id", itemId),
      ]);
    };

    await markStatus("embedding", { progress: 5 });

    const { data: chunks, error: chunksError } = await supabase
      .from("document_chunks")
      .select("id, content")
      .eq("library_item_id", libraryItemId)
      .is("embedding", null)
      .order("chunk_index", { ascending: true });
    if (chunksError) throw chunksError;

    const pending = chunks ?? [];
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE);
      const embeddings = await embedTexts(batch.map((c) => c.content as string));

      await Promise.all(
        batch.map((chunk, idx) =>
          supabase
            .from("document_chunks")
            .update({
              embedding: toVectorLiteral(embeddings[idx]!),
              embedding_model: EMBEDDING_MODEL,
              embedding_version: EMBEDDING_VERSION,
            })
            .eq("id", chunk.id as string),
        ),
      );

      const done = Math.min(i + batch.length, pending.length);
      await markStatus("embedding", {
        progress: 5 + Math.round((done / Math.max(pending.length, 1)) * 90),
      });
    }

    await markStatus("completed", { progress: 100, finished_at: new Date().toISOString() });

    return jsonResponse({ ok: true, embedded: pending.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    console.error("generate-embeddings error:", message);
    try {
      await markStatus("failed", { error_message: message, finished_at: new Date().toISOString() });
    } catch (markErr) {
      console.error("generate-embeddings: failed to record failure status:", markErr);
    }
    return jsonResponse({ error: message }, 500);
  }
});
