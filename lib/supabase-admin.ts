import { createClient } from '@supabase/supabase-js'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// SERVER-ONLY. Never import this file from a 'use client' component —
// it uses the secret service_role key, which bypasses Row Level Security.
// It must only run inside Next.js Route Handlers (app/api/**/route.ts).
//
// Les valeurs sont lues à l'INTÉRIEUR de la fonction (jamais au chargement du
// module) : sur Cloudflare Workers, les secrets ne sont garantis disponibles
// que pendant le traitement d'une requête. On lit d'abord depuis le contexte
// Cloudflare natif (le plus fiable), avec process.env en repli.
export function getSupabaseAdmin() {
  let cfEnv: Record<string, string | undefined> = {}
  try {
    cfEnv = (getCloudflareContext().env as Record<string, string | undefined>) ?? {}
  } catch {
    // hors contexte requête (ex. build) — on retombe sur process.env
  }

  const supabaseUrl = cfEnv.SUPABASE_URL ?? process.env.SUPABASE_URL
  const serviceRoleKey =
    cfEnv.SUPABASE_SERVICE_ROLE_KEY ??
    cfEnv.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    // TEMPORAIRE — liste les NOMS de variables visibles (jamais les valeurs)
    // pour diagnostiquer précisément ce qui est réellement lié au Worker.
    const cfKeys = Object.keys(cfEnv).join(', ') || '(aucune)'
    const envKeys = Object.keys(process.env).join(', ') || '(aucune)'
    throw new Error(
      `Supabase server credentials are not configured. cfEnv keys: [${cfKeys}] | process.env keys: [${envKeys}]`
    )
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
  }
