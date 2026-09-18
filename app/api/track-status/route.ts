import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// La page /track/status s'actualise automatiquement toutes les 20 secondes
// tant qu'elle reste ouverte (fonctionnalité de suivi "temps réel") : un
// client qui laisse l'onglet ouvert 15 minutes envoie déjà ~45 requêtes
// légitimes. Le seuil doit rester nettement au-dessus de ça — 100 par 15 min
// couvre large tout usage normal, tout en rendant une recherche par force
// brute sur les 900 000 combinaisons du Project ID totalement impraticable
// (des dizaines de jours au minimum, par IP).
const RATE_LIMIT_WINDOW_MINUTES = 15
const RATE_LIMIT_MAX_ATTEMPTS = 100

function errorResponse(status: number, errorKey: string, debug?: string) {
  const payload: Record<string, unknown> = { errorKey }
  if (debug && process.env.NODE_ENV !== 'production') {
    payload.debug = debug
  }
  return NextResponse.json(payload, { status })
}

// Ferme une faille : /track et /track/status appelaient la fonction
// get_booking_status directement depuis le navigateur avec la clé publique
// anon, en contournant totalement notre backend — donc sans AUCUNE limite
// de débit sur les tentatives de recherche. Combiné à un Project ID qui
// n'avait que 4 chiffres aléatoires (9 000 combinaisons), une recherche par
// force brute avec un nom connu était réaliste. Cette route ajoute la limite
// de débit manquante ; l'entropie du Project ID a aussi été augmentée à 6
// chiffres (voir lib/validation.ts).
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'invalidRequest')
  }

  const { projectId, fullName, company } = body as Record<string, unknown>
  if (typeof projectId !== 'string' || !projectId.trim() || typeof fullName !== 'string' || !fullName.trim()) {
    return errorResponse(400, 'invalidRequest')
  }
  const cleanCompany = typeof company === 'string' && company.trim() ? company.trim() : null

  const clientIp =
    request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const supabase = getSupabaseAdmin()

  if (clientIp) {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('track_lookup_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', windowStart)

    if (countError) {
      console.error('Track rate-limit check failed:', countError.message)
      return errorResponse(500, 'serverError', `rateLimitCheck: ${countError.message}`)
    }
    if ((count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS) {
      return errorResponse(429, 'rateLimited')
    }
  }

  // Best-effort : le log de tentative ne doit jamais faire échouer la
  // recherche elle-même si l'écriture du log échoue.
  const { error: logError } = await supabase.from('track_lookup_log').insert({ ip_address: clientIp })
  if (logError) {
    console.error('Track lookup log insert failed (non-bloquant):', logError.message)
  }

  const { data, error } = await supabase
    .rpc('get_booking_status', { p_project_id: projectId.trim(), p_full_name: fullName.trim(), p_company: cleanCompany })
    .maybeSingle()

  if (error) {
    console.error('get_booking_status RPC failed:', error.message)
    return errorResponse(500, 'serverError', error.message)
  }
  if (!data) {
    return errorResponse(404, 'notFound')
  }

  return NextResponse.json(data, { status: 200 })
}
