import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const STORAGE_BUCKET = 'project-request-files'
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo — doit correspondre à la limite du bucket Supabase
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const ALLOWED_FOLDERS = new Set(['schema', 'documents'])

// Un utilisateur légitime peut uploader jusqu'à 10 fichiers par zone × 2
// zones (schema + documents) en une seule session — la limite doit rester
// large pour ne jamais bloquer un usage normal, tout en empêchant le
// spam automatisé direct sur l'API Storage.
const RATE_LIMIT_WINDOW_MINUTES = 15
const RATE_LIMIT_MAX_UPLOADS = 30

function errorResponse(status: number, errorKey: string, debug?: string) {
  const payload: Record<string, unknown> = { errorKey }
  if (debug && process.env.NODE_ENV !== 'production') {
    payload.debug = debug
  }
  return NextResponse.json(payload, { status })
}

// Cette route existe pour fermer une faille : l'upload direct navigateur→
// Supabase Storage n'avait aucune limite de débit (la clé publique anon
// suffisait à appeler l'API Storage directement, en contournant totalement
// le site). La policy INSERT anonyme sur storage.objects a été révoquée
// (voir supabase-migration.sql) — tout upload passe désormais ici, avec
// limite de débit et double validation serveur.
export async function POST(request: Request) {
  const clientIp =
    request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const supabase = getSupabaseAdmin()

  if (clientIp) {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('upload_log')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', windowStart)

    if (countError) {
      console.error('Upload rate-limit check failed:', countError.message)
      return errorResponse(500, 'serverError', `rateLimitCheck: ${countError.message}`)
    }
    if ((count ?? 0) >= RATE_LIMIT_MAX_UPLOADS) {
      return errorResponse(429, 'rateLimited')
    }
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return errorResponse(400, 'invalidRequest')
  }

  const file = formData.get('file')
  const folder = formData.get('folder')
  const sessionId = formData.get('sessionId')

  if (!(file instanceof File)) {
    return errorResponse(400, 'fileRequired')
  }
  if (typeof folder !== 'string' || !ALLOWED_FOLDERS.has(folder)) {
    return errorResponse(400, 'invalidFolder')
  }
  // sessionId sert uniquement à regrouper les fichiers d'une même session
  // dans un même "dossier" logique du bucket — on le nettoie strictement
  // pour éviter toute tentative de path traversal (../) dans le chemin final.
  const cleanSessionId =
    typeof sessionId === 'string' ? sessionId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 100) : null
  if (!cleanSessionId) {
    return errorResponse(400, 'invalidSession')
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return errorResponse(400, 'fileTooLarge')
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return errorResponse(400, 'invalidFileType')
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_').slice(0, 200)
  const path = `${cleanSessionId}/${folder}/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: false })
  if (uploadError) {
    console.error('File upload failed:', uploadError.message)
    return errorResponse(500, 'uploadFailed', uploadError.message)
  }

  // Best-effort : un échec d'écriture du log ne doit jamais faire échouer
  // un upload qui a réellement réussi.
  const { error: logError } = await supabase.from('upload_log').insert({ ip_address: clientIp })
  if (logError) {
    console.error('Upload log insert failed (non-bloquant):', logError.message)
  }

  return NextResponse.json({ path }, { status: 201 })
}
