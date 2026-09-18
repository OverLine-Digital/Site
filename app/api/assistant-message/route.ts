import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { validateEmail } from '@/lib/validation'
import { sendEmail, escapeHtml } from '@/lib/email'

const RATE_LIMIT_WINDOW_MINUTES = 10
const RATE_LIMIT_MAX_REQUESTS = 5
const MAX_MESSAGE_LENGTH = 2000

function errorResponse(status: number, errorKey: string, debug?: string) {
  const payload: Record<string, unknown> = { errorKey }
  if (debug && process.env.NODE_ENV !== 'production') {
    payload.debug = debug
  }
  return NextResponse.json(payload, { status })
}

// Cette route existe précisément pour corriger le bug signalé : le widget
// assistant (components/ai-assistant.tsx) affichait un champ pour écrire un
// message, mais rien ne l'envoyait réellement nulle part — d'où le "404 /
// API not found" au clic sur envoyer. Maintenant, le message est stocké en
// base (table assistant_messages) et une notification part vers l'équipe.
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'invalidRequest')
  }

  const { message, contactName, contactEmail, website } = body as Record<string, any>

  // Honeypot anti-bot — même principe que sur le formulaire de projet.
  if (typeof website === 'string' && website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  const cleanMessage = typeof message === 'string' ? message.trim() : ''
  if (!cleanMessage) {
    return errorResponse(400, 'messageRequired')
  }
  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(400, 'messageTooLong')
  }

  const cleanName = typeof contactName === 'string' ? contactName.trim().slice(0, 200) : null
  let cleanEmail: string | null = null
  if (typeof contactEmail === 'string' && contactEmail.trim()) {
    const emailError = validateEmail(contactEmail)
    if (emailError) {
      return errorResponse(400, 'invalidEmail')
    }
    cleanEmail = contactEmail.trim()
  }

  const clientIp =
    request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const supabase = getSupabaseAdmin()

  // Rate limiting par IP, même fenêtre que le formulaire de projet — un
  // widget de chat public est une cible encore plus facile à spammer.
  if (clientIp) {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count, error: countError } = await supabase
      .from('assistant_messages')
      .select('id', { count: 'exact', head: true })
      .eq('ip_address', clientIp)
      .gte('created_at', windowStart)

    if (countError) {
      console.error('Assistant rate-limit check failed:', countError.message)
      return errorResponse(500, 'serverError', `rateLimitCheck: ${countError.message}`)
    }
    if ((count ?? 0) >= RATE_LIMIT_MAX_REQUESTS) {
      return errorResponse(429, 'rateLimited')
    }
  }

  const { error: insertError } = await supabase.from('assistant_messages').insert({
    message: cleanMessage,
    contact_name: cleanName,
    contact_email: cleanEmail,
    ip_address: clientIp,
  })

  if (insertError) {
    console.error('Assistant message insert failed:', insertError.message)
    return errorResponse(500, 'serverError', `insert: ${insertError.message}`)
  }

  // Notification à l'équipe — best-effort, ne bloque jamais la réponse.
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (adminEmail) {
    await sendEmail({
      to: adminEmail,
      subject: 'Nouveau message via le widget assistant',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
          <p><strong>Nouveau message reçu sur le site :</strong></p>
          <p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-radius: 8px;">${escapeHtml(cleanMessage)}</p>
          ${cleanName ? `<p>Nom : ${escapeHtml(cleanName)}</p>` : ''}
          ${cleanEmail ? `<p>Email : ${escapeHtml(cleanEmail)}</p>` : '<p style="color:#888;">Aucun email fourni — pas de moyen de répondre directement.</p>'}
        </div>
      `,
    })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
