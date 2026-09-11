import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface ContentSearchResult {
  chunk_id: string;
  library_item_id: string;
  library_item_title: string;
  section_title: string | null;
  content: string;
  combined_score: number;
}

/**
 * Fase 4 — busca híbrida (full-text + vetorial) no conteúdo processado,
 * não só nos metadados. Chama a Edge Function `search`, que gera o
 * embedding da consulta (precisa de OPENAI_API_KEY, por isso não roda no
 * cliente) e delega o ranking à função `search_document_chunks`.
 */
export function useSearchContent() {
  return useMutation({
    mutationFn: async (query: string) => {
      const { data, error } = await supabase.functions.invoke<{
        results?: ContentSearchResult[];
        error?: string;
      }>("search", { body: { query } });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.results ?? [];
    },
  });
}
