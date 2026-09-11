export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      document_chunks: {
        Row: {
          chunk_index: number;
          content: string;
          created_at: string;
          embedding: string | null;
          embedding_model: string | null;
          embedding_version: string | null;
          id: string;
          library_item_id: string;
          metadata: Json;
          owner_id: string;
          page_end: number | null;
          page_start: number | null;
          search_vector: unknown;
          section_id: string | null;
          token_count: number | null;
        };
        Insert: {
          chunk_index: number;
          content: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string | null;
          embedding_version?: string | null;
          id?: string;
          library_item_id: string;
          metadata?: Json;
          owner_id: string;
          page_end?: number | null;
          page_start?: number | null;
          search_vector?: unknown;
          section_id?: string | null;
          token_count?: number | null;
        };
        Update: {
          chunk_index?: number;
          content?: string;
          created_at?: string;
          embedding?: string | null;
          embedding_model?: string | null;
          embedding_version?: string | null;
          id?: string;
          library_item_id?: string;
          metadata?: Json;
          owner_id?: string;
          page_end?: number | null;
          page_start?: number | null;
          search_vector?: unknown;
          section_id?: string | null;
          token_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_library_item_id_fkey";
            columns: ["library_item_id"];
            isOneToOne: false;
            referencedRelation: "library_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_chunks_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "document_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      document_sections: {
        Row: {
          created_at: string;
          end_page: number | null;
          id: string;
          library_item_id: string;
          metadata: Json;
          owner_id: string;
          parent_section_id: string | null;
          section_type: string;
          sequence: number;
          start_page: number | null;
          text_content: string;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          end_page?: number | null;
          id?: string;
          library_item_id: string;
          metadata?: Json;
          owner_id: string;
          parent_section_id?: string | null;
          section_type: string;
          sequence?: number;
          start_page?: number | null;
          text_content: string;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          end_page?: number | null;
          id?: string;
          library_item_id?: string;
          metadata?: Json;
          owner_id?: string;
          parent_section_id?: string | null;
          section_type?: string;
          sequence?: number;
          start_page?: number | null;
          text_content?: string;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "document_sections_library_item_id_fkey";
            columns: ["library_item_id"];
            isOneToOne: false;
            referencedRelation: "library_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_sections_parent_section_id_fkey";
            columns: ["parent_section_id"];
            isOneToOne: false;
            referencedRelation: "document_sections";
            referencedColumns: ["id"];
          },
        ];
      };
      library_files: {
        Row: {
          checksum: string | null;
          created_at: string;
          extracted_text: string | null;
          file_size: number;
          id: string;
          library_item_id: string;
          mime_type: string;
          original_filename: string;
          owner_id: string;
          storage_bucket: string;
          storage_path: string;
          version: number;
        };
        Insert: {
          checksum?: string | null;
          created_at?: string;
          extracted_text?: string | null;
          file_size: number;
          id?: string;
          library_item_id: string;
          mime_type: string;
          original_filename: string;
          owner_id: string;
          storage_bucket?: string;
          storage_path: string;
          version?: number;
        };
        Update: {
          checksum?: string | null;
          created_at?: string;
          extracted_text?: string | null;
          file_size?: number;
          id?: string;
          library_item_id?: string;
          mime_type?: string;
          original_filename?: string;
          owner_id?: string;
          storage_bucket?: string;
          storage_path?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "library_files_library_item_id_fkey";
            columns: ["library_item_id"];
            isOneToOne: false;
            referencedRelation: "library_items";
            referencedColumns: ["id"];
          },
        ];
      };
      library_items: {
        Row: {
          authorship_type: string;
          category: string | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          id: string;
          item_type: string;
          language: string | null;
          memory_status: string | null;
          original_date: string | null;
          owner_id: string;
          processing_status: string;
          tags: string[];
          title: string;
          updated_at: string;
          year: number | null;
        };
        Insert: {
          authorship_type?: string;
          category?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          item_type?: string;
          language?: string | null;
          memory_status?: string | null;
          original_date?: string | null;
          owner_id: string;
          processing_status?: string;
          tags?: string[];
          title: string;
          updated_at?: string;
          year?: number | null;
        };
        Update: {
          authorship_type?: string;
          category?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          item_type?: string;
          language?: string | null;
          memory_status?: string | null;
          original_date?: string | null;
          owner_id?: string;
          processing_status?: string;
          tags?: string[];
          title?: string;
          updated_at?: string;
          year?: number | null;
        };
        Relationships: [];
      };
      processing_jobs: {
        Row: {
          attempt_count: number;
          created_at: string;
          entity_id: string;
          entity_type: string;
          error_code: string | null;
          error_message: string | null;
          finished_at: string | null;
          id: string;
          job_type: string;
          owner_id: string;
          progress: number;
          started_at: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          attempt_count?: number;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          error_code?: string | null;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          job_type: string;
          owner_id: string;
          progress?: number;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          error_code?: string | null;
          error_message?: string | null;
          finished_at?: string | null;
          id?: string;
          job_type?: string;
          owner_id?: string;
          progress?: number;
          started_at?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_document_chunks: {
        Args: {
          match_count?: number;
          query_embedding: string;
          search_query: string;
        };
        Returns: {
          chunk_id: string;
          combined_score: number;
          content: string;
          library_item_id: string;
          library_item_title: string;
          section_title: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
