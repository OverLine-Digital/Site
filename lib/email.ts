// Utilitaire d'envoi d'email partagé (via l'API REST Resend). Aucune
// dépendance npm ajoutée : un simple fetch() suffit et fonctionne tel quel
// sur Cloudflare Workers (contrairement au SDK Node "resend" qui suppose un
// runtime Node complet).
//
// Toujours "best-effort" : un échec d'envoi ne doit JAMAIS faire échouer la
// requête qui l'a déclenché (voir les appelants dans app/api/**/route.ts).
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const fromAddress = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !fromAddress) {
    console.warn('Email non envoyé : RESEND_API_KEY ou RESEND_FROM_EMAIL manquant.')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Échec envoi email (Resend):', res.status, text)
      return false
    }
    return true
  } catch (e) {
    console.error('Échec envoi email (exception):', e instanceof Error ? e.message : e)
    return false
  }
}

// Échappe le HTML injecté dans un template email — toute donnée insérée
// vient in fine d'une saisie utilisateur (déjà validée par ailleurs, mais on
// ne prend aucun risque d'injection dans le corps HTML de l'email envoyé).
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
