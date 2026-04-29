import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getSupabaseUrl } from "./env";

let cachedAdminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin server operations.");
  }

  if (!cachedAdminClient) {
    cachedAdminClient = createSupabaseClient<Database>(getSupabaseUrl(), serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return cachedAdminClient;
}
