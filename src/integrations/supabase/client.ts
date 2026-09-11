import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * False when the environment isn't configured yet (missing/misnamed env
 * vars). Consumers must check this instead of letting a missing backend take
 * down the whole app — see src/routes/__root.tsx, which shows a plain
 * explanation screen instead of rendering the (non-functional) app tree.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// Safe to use in the browser: this is the publishable/anon key, not a
// secret. Access control is enforced by Postgres Row Level Security
// policies, never by keeping this key hidden. The placeholder fallback below
// only exists so createClient() doesn't throw when unconfigured — every
// request made with it will fail, which is fine: isSupabaseConfigured is
// what gates whether we try to use this client at all.
export const supabase = createClient<Database>(
  supabaseUrl || "https://unconfigured.invalid",
  supabasePublishableKey || "unconfigured",
);
