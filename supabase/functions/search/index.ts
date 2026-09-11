// Fase 4 — RAG. Embeds the query, then delegates ranking to the
// search_document_chunks RPC (full-text + vector, RRF-fused — see the
// Fase 4 migration). Request-scoped client authenticated as the caller;
// RLS on document_chunks/library_items/document_sections already limits
// every result to their own rows (docs/SECURITY.md).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { corsHeaders } from "../_shared/cors.ts";
import { embedTexts, toVectorLiteral } from "../_shared/embedding-provider.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = (await req.json()) as { query?: string };
    if (!query || !query.trim()) return jsonResponse({ error: "query é obrigatória." }, 400);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autenticado." }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Sessão inválida." }, 401);

    const trimmed = query.trim();
    const [embedding] = await embedTexts([trimmed]);

    const { data, error } = await supabase.rpc("search_document_chunks", {
      search_query: trimmed,
      query_embedding: toVectorLiteral(embedding!),
      match_count: 20,
    });
    if (error) throw error;

    return jsonResponse({ results: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    console.error("search error:", message);
    return jsonResponse({ error: message }, 500);
  }
});
