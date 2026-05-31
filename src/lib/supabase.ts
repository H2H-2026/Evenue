import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * عميل Supabase. إذا لم يتم ضبط متغيرات البيئة، يبقى null
 * ويعمل التطبيق في وضع تجريبي (mock) للتطوير.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;

/* eslint-disable no-console */
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.log(
      "%c✅ Supabase Connected%c → " + supabaseUrl,
      "color:#22c55e;font-weight:bold",
      "color:inherit",
    );
  } else {
    console.log(
      "%c⚠️ Demo Mode%c — Supabase env vars missing, using local storage",
      "color:#f59e0b;font-weight:bold",
      "color:inherit",
    );
  }
}

