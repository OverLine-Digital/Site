import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import {
  validateFullName,
  validateEmail,
  validateWhatsapp,
  validateDescription,
  validateRequired,
  generateProjectId,
} from '@/lib/validation'
import { allServices } from '@/lib/services'
import { sendEmail, escapeHtml } from '@/lib/email'

// Liste fermée des types de service acceptés — on n'accepte jamais une valeur
// arbitraire envoyée par le client (ex. projectType = "admin_root_access").
const ALLOWED_SERVICE_IDS = new Set(allServices.map((s) => s.id))

const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_REQUESTS = 5

function errorResponse(status: number, errorKey: string, debug?: string) {
  // Les détails d'erreur serveur (messages Supabase, noms de variables, etc.)
  // ne sont jamais renvoyés au client en production — uniquement loggés
  // côté serveur via console.error. En dev, on les expose pour déboguer.
  const payload: Record<string, unknown> = { errorKey }
  if (debug && process.env.NODE_ENV !== 'production') {
    payload.debug = debug
  }
  return NextResponse.json(payload, { status })
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'invalidRequest')
  }

  const {
    serviceId,
    durationLabel,
    durationWeeks,
    requestType,
    description,
    files,
    exampleFiles,
    fullName,
    company,
    email,
    phone,
    country,
    whatsapp,
    website, // honeypot — voir plus bas
  } = body as Record<string, any>

  // --- 0. Honeypot anti-bot ---
  // Champ caché visuellement (voir demande-projet/page.tsx) que les vrais
  // visiteurs ne remplissent jamais, mais que les bots de spam remplissent
  // presque systématiquement. On répond 201 avec un faux projectId (jamais
  // d'erreur) pour ne pas révéler au bot que sa requête a été détectée.
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ projectId: generateProjectId() }, { status: 201 })
  }

  // --- 1. Revalidation complète côté serveur (jamais confiance au client) ---
  if (typeof serviceId !== 'string' || !ALLOWED_SERVICE_IDS.has(serviceId)) {
    return errorResponse(400, 'invalidService')
  }

  const nameError = validateFullName(String(fullName ?? ''))
  const emailError = validateEmail(String(email ?? ''))
  // Le champ "phone" envoyé par le client contient déjà l'indicatif pays
  // (dial + numéro local), donc validateWhatsapp (qui retrouve le pays à partir
  // de l'indicatif et vérifie longueur + préfixe mobile) s'applique aussi ici.
  const phoneError = validateWhatsapp(String(phone ?? ''))
  const descriptionError = validateDescription(String(description ?? ''), 50)
  const sectorError = validateRequired(requestType ? String(requestType) : null, 'Le secteur')
  const whatsappError = validateWhatsapp(String(whatsapp ?? ''))

  if (nameError || emailError || phoneError || descriptionError || sectorError || whatsappError) {
    return errorResponse(422, 'invalidFields')
  }

  if (typeof description === 'string' && description.length > 5000) {
    return errorResponse(413, 'tooLong')
  }
  if (Array.isArray(files) && files.length > 10) {
    return errorResponse(413, 'tooManyFiles')
  }
  if (Array.isArray(exampleFiles) && exampleFiles.length > 10) {
    return errorResponse(413, 'tooManyFiles')
  }

  const cleanEmail = String(email).trim().toLowerCase()
  const cleanPhone = String(phone).trim()

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e) {
    console.error('Supabase admin client misconfigured')
    return errorResponse(500, 'serverError', e instanceof Error ? e.message : 'unknown')
  }

  // --- 2. Rate limiting réel (par email ET par IP, fenêtre glissante) ---
  // Par email seul : contournable en changeant d'adresse à chaque envoi.
  // Par IP seule : peut bloquer plusieurs personnes derrière le même NAT/CGNAT.
  // On combine les deux — n'importe laquelle des deux limites dépassée bloque.
  const clientIp = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
  const { count, error: countError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('email', cleanEmail)
    .gte('created_at', windowStart)

  if (countError) {
    console.error('Rate-limit check failed:', countError.message)
    return errorResponse(500, 'serverError', `rateLimitCheck: ${countError.message}`)
  }
  if ((count ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
    return errorResponse(429, 'rateLimited')
  }

  if (clientIp) {
    const { count: ipCount, error: ipCountError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', windowStart)

    if (ipCountError) {
      console.error('IP rate-limit check failed:', ipCountError.message)
      return errorResponse(500, 'serverError', `ipRateLimitCheck: ${ipCountError.message}`)
    }
    if ((ipCount ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return errorResponse(429, 'rateLimited')
    }
  }

  // --- 3. Création de la demande ---
  const projectId = generateProjectId()

  // Les chemins de fichiers doivent être des chaînes courtes provenant du
  // bucket de stockage — on rejette tout ce qui ne ressemble pas à un chemin
  // valide plutôt que de faire confiance aveuglément au client.
  function sanitizeFilePaths(input: unknown): string[] {
    if (!Array.isArray(input)) return []
    return input
      .filter((p): p is string => typeof p === 'string' && p.length > 0 && p.length <= 500)
      .slice(0, 10)
  }

  const matchedService = allServices.find((s) => s.id === serviceId)!
  const serviceName = matchedService.name

  const { error: insertError } = await supabase.from('bookings').insert({
    project_id: projectId,
    status: 'new',
    service_id: serviceId,
    service_name: serviceName,
    duration_label: durationLabel ?? null,
    duration_weeks: typeof durationWeeks === 'number' ? durationWeeks : null,
    request_type: requestType ?? null,
    description: String(description).trim(),
    files: sanitizeFilePaths(files),
    example_files: sanitizeFilePaths(exampleFiles),
    full_name: String(fullName).trim(),
    company: company ? String(company).trim() : null,
    email: cleanEmail,
    phone: cleanPhone,
    country: country ? String(country).trim() : null,
    whatsapp: whatsapp ? String(whatsapp).trim() : null,
    ip_address: clientIp,
  })

  if (insertError) {
    console.error('Booking insert failed:', insertError.message)
    return errorResponse(500, 'serverError', `insert: ${insertError.message}`)
  }

  // --- 4. Confirmation par email (best-effort, jamais bloquant) ---
  // Si l'envoi échoue (clé manquante, Resend en panne...), la demande reste
  // quand même créée avec succès : le client voit son projectId à l'écran et
  // peut toujours le copier manuellement. On ne fait jamais échouer toute la
  // requête à cause d'un souci d'email.
  await sendConfirmationEmail({
    to: cleanEmail,
    fullName: String(fullName).trim(),
    projectId,
    serviceName,
  })

  // --- 5. Notification à l'équipe (best-effort, jamais bloquant non plus) ---
  // Sans ça, la seule façon de savoir qu'une demande vient d'arriver est
  // d'ouvrir le dashboard admin manuellement — même limite que celle déjà
  // corrigée sur le widget assistant.
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (adminEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://overlinedigital-b88.workers.dev'
    await sendEmail({
      to: adminEmail,
      subject: `Nouvelle demande de projet — ${projectId}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <p><strong>Nouvelle demande reçue sur le site :</strong></p>
          <p>Service : ${escapeHtml(serviceName)}</p>
          <p>Client : ${escapeHtml(String(fullName).trim())}${company ? ` (${escapeHtml(String(company).trim())})` : ''}</p>
          <p>Email : ${escapeHtml(cleanEmail)}</p>
          <p>Téléphone : ${escapeHtml(cleanPhone)}</p>
          ${country ? `<p>Pays : ${escapeHtml(String(country).trim())}</p>` : ''}
          <p>Référence : <strong style="font-family: monospace;">${escapeHtml(projectId)}</strong></p>
          <p>
            <a href="${siteUrl}/admin/dashboard" style="display: inline-block; background: #34d399; color: #052e1f; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Ouvrir le dashboard
            </a>
          </p>
        </div>
      `,
    })
  }

  return NextResponse.json({ projectId }, { status: 201 })
}

function buildConfirmationEmailHtml(params: {
  fullName: string
  projectId: string
  serviceName: string
  siteUrl: string
  trackUrl: string
}) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <p>Bonjour ${escapeHtml(params.fullName)},</p>
      <p>Votre demande pour <strong>${escapeHtml(params.serviceName)}</strong> a bien été reçue par OverLine Digital.</p>
      <p>Référence de votre projet : <strong style="font-family: monospace;">${escapeHtml(params.projectId)}</strong></p>
      <p>
        <a href="${params.trackUrl}" style="display: inline-block; background: #34d399; color: #052e1f; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600;">
          Suivre l'avancement de mon projet
        </a>
      </p>
      <p style="font-size: 13px; color: #666;">
        Gardez cet email : il contient votre lien de suivi personnel. Vous pouvez aussi retrouver votre projet
        à tout moment sur ${escapeHtml(params.siteUrl)}/track avec votre nom complet et cette référence.
      </p>
    </div>
  `
}

async function sendConfirmationEmail(params: {
  to: string
  fullName: string
  projectId: string
  serviceName: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://overlinedigital-b88.workers.dev'
  const trackUrl = `${siteUrl}/track/status?id=${encodeURIComponent(params.projectId)}&name=${encodeURIComponent(params.fullName)}`
  await sendEmail({
    to: params.to,
    subject: `Votre demande a bien été reçue — ${params.projectId}`,
    html: buildConfirmationEmailHtml({ ...params, siteUrl, trackUrl }),
  })
}
