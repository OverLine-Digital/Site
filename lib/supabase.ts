import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// vrai secret, utilisé par lib/supabase-admin.ts côté serveur uniquement)
// doivent rester en variables d'environnement — jamais en dur.
const DEFAULT_SUPABASE_URL = 'https://kmlmemumyzhszjqzwwfq.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_GNPIlE8LDrC3Wun177S2Fw_cPKHGYbt'

let cached: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (cached) return cached
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY
  cached = createClient(supabaseUrl, supabaseAnonKey)
  return cached
  }
