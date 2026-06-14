import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// null when Supabase isn't configured yet (e.g. local dev before setup) —
// callers fall back to empty counts and surface a setup notice.
export const supabase: SupabaseClient | null =
  url && publishableKey ? createClient(url, publishableKey) : null;
