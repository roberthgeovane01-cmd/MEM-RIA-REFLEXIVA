import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Copy .env.example to .env.local and fill in your project's values.",
  );
}

// Safe to use in the browser: this is the publishable/anon key, not a
// secret. Access control is enforced by Postgres Row Level Security
// policies, never by keeping this key hidden.
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey);
