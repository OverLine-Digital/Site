import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ajoute les en-têtes de sécurité HTTP standards sur TOUTES les réponses du
// site (pages ET API). Sans ce fichier, aucun header de ce type n'était
// envoyé — le site était donc plus exposé que nécessaire au clickjacking
// (un site tiers pouvait t'afficher dans une <iframe> invisible pour piéger
// des clics), au MIME-sniffing, et n'avait aucune Content-Security-Policy
// pour limiter les dégâts en cas de faille XSS non détectée.
//
// La CSP ci-dessous reste volontairement raisonnable (pas la plus stricte
// possible) : une CSP trop agressive peut casser le site en silence (styles
// Tailwind/Next injectés en inline, Vercel Analytics, appels Supabase...) et
// je n'ai pas pu tester ce site en conditions réelles dans mon environnement
// (pas d'accès réseau sortant). Teste la console du navigateur après
// déploiement pour repérer d'éventuelles violations CSP avant de la durcir.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmlmemumyzhszjqzwwfq.supabase.co'
const SUPABASE_WS_URL = SUPABASE_URL.replace('https://', 'wss://')

const CSP = [
  "default-src 'self'",
  // 'unsafe-inline' pour script-src : Next.js injecte des données de
  // page (état React, config) dans des <script> inline au chargement ;
  // les bloquer casserait l'hydratation. Vercel Analytics ajouté explicitement.
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  // 'unsafe-inline' pour style-src : Tailwind/Next injectent des styles
  // inline (classes dynamiques, thème sombre/clair). Sans ça, une bonne
  // partie du design casserait.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WS_URL} https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Empêche le site d'être affiché dans une <iframe> sur un domaine tiers
  // (protection anti-clickjacking). "frame-ancestors" dans la CSP fait
  // déjà ce travail pour les navigateurs modernes ; X-Frame-Options reste
  // en filet de sécurité pour les plus anciens.
  response.headers.set('X-Frame-Options', 'DENY')
  // Empêche le navigateur de deviner un type de fichier différent de celui
  // déclaré (évite qu'un fichier uploadé malveillant soit exécuté comme
  // script à cause d'un mauvais Content-Type).
  response.headers.set('X-Content-Type-Options', 'nosniff')
  // Ne transmet jamais l'URL complète (avec ?id=...&name=... du suivi
  // client) à un site tiers via l'en-tête Referer lors d'un clic sortant.
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Désactive l'accès caméra/micro/géolocalisation par défaut : ce site n'en
  // a besoin nulle part.
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // HSTS : force HTTPS pour toute visite future pendant 2 ans. Cloudflare
  // gère déjà le HTTPS en frontal, mais renvoyer ce header depuis l'origine
  // est la pratique recommandée et coûte zéro risque de casse.
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains')
  response.headers.set('Content-Security-Policy', CSP)

  return response
}

export const config = {
  matcher: [
    // S'applique à tout sauf les fichiers statiques Next.js déjà servis
    // avec leurs propres headers de cache.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
