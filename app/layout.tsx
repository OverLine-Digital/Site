import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Poppins } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

// "Inter" a été retiré : il n'était jamais réellement affiché (Poppins est
// toujours en premier dans la pile de polices — voir --font-sans dans
// globals.css), seulement téléchargé "au cas où" à chaque visite. Sur une
// connexion lente (3G, courant sur nos marchés), ce fichier en plus retardait
// l'affichage du texte pour rien.
//
// `display: 'swap'` garantit que le texte s'affiche tout de suite avec une
// police de secours plutôt que de rester invisible pendant le chargement —
// Next.js ajuste automatiquement les métriques de cette police de secours
// pour limiter le décalage visuel au moment du remplacement par la vraie police.
const heading = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '700'],
  display: 'swap',
})
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  // Sans ça, Next.js résout les URLs relatives des métadonnées (dont
  // l'image de partage social ci-dessous) vers localhost:3000 en
  // production — l'aperçu du lien serait cassé partout où il est partagé
  // (WhatsApp, Facebook, LinkedIn...).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://overlinedigital-b88.workers.dev'),
  title: 'OverLine Digital — Connecting Businesses. Building Digital Futures.',
  description:
    'OverLine Digital is a premium African technology company helping businesses, entrepreneurs and organizations build their digital future through websites, applications, software, AI and cybersecurity.',
  keywords: [
    'OverLine Digital',
    'web development',
    'mobile applications',
    'software',
    'AI assistant',
    'cybersecurity',
    'digital marketing',
    'Brazzaville',
    'Congo',
    'Africa technology',
  ],
  openGraph: {
    title: 'OverLine Digital',
    description: 'Connecting Businesses. Building Digital Futures.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OverLine Digital',
    description: 'Connecting Businesses. Building Digital Futures.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`bg-background dark ${heading.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
