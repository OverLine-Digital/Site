import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://overlinedigital-b88.workers.dev'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin n'a rien à faire dans un moteur de recherche : même sans
        // fuite de données (le login est protégé), ça n'a aucun intérêt
        // d'indexer une page de connexion et ça révèle inutilement
        // l'existence et l'URL exacte de l'espace admin.
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
