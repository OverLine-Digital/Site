'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

const inputClass =
  'w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40'

function TrackContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const preId = searchParams.get('id')
    if (preId) setProjectId(preId)
    const preCompany = searchParams.get('company')
    if (preCompany) setCompany(preCompany)
  }, [searchParams])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Plus de .toUpperCase() ici : la comparaison SQL est déjà insensible
    // à la casse des deux côtés (upper() appliqué sur la colonne ET sur le
    // paramètre dans get_booking_status), donc forcer la casse ici ne sert
    // à rien pour la recherche — et ça abîmait l'URL générée avec le nouveau
    // format "OverLine-ID-..." qui a une casse stylisée voulue.
    const trimmedId = projectId.trim()
    const trimmedName = fullName.trim()

    if (!trimmedName || !trimmedId) {
      setError('Le nom complet et la référence du projet sont obligatoires.')
      return
    }

    setLoading(true)
    // Passe par la route serveur /api/track-status (limite de débit) au
    // lieu d'appeler get_booking_status directement depuis le navigateur —
    // un appel client direct contournait totalement toute limite de débit
    // et rendait une recherche par force brute réaliste. Voir la route pour
    // le détail.
    let data: { project_id: string } | null = null
    let dbError: string | null = null
    try {
      const res = await fetch('/api/track-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: trimmedId, fullName: trimmedName, company: company.trim() || undefined }),
      })
      if (res.status === 404) {
        data = null
      } else if (!res.ok) {
        dbError = 'error'
      } else {
        data = await res.json()
      }
    } catch {
      dbError = 'error'
    }
    setLoading(false)

    if (dbError) {
      setError(t('track.genericError'))
      return
    }
    if (!data) {
      setError(
        "Aucune demande ne correspond à ces informations. Vérifiez le nom, l'entreprise (si vous en aviez indiqué une) et la référence.",
      )
      return
    }

    router.push(
      `/track/status?id=${encodeURIComponent(trimmedId)}&name=${encodeURIComponent(trimmedName)}&company=${encodeURIComponent(company.trim())}`,
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-16">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Site &gt; {t('track.title')}
      </p>
      <h1 className="mb-2 font-voice text-2xl font-semibold text-foreground">{t('track.title')}</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Entrez votre nom complet et la référence reçue après votre demande pour voir où en est votre projet.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <div>
          <label htmlFor="track-name" className="mb-1.5 block text-xs text-muted-foreground">
            Nom complet (tel que renseigné à la demande) *
          </label>
          <input
            id="track-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Pedro Tepina"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="track-company" className="mb-1.5 block text-xs text-muted-foreground">
            Nom de l&rsquo;entreprise (si indiqué à la demande)
          </label>
          <input
            id="track-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="OverLine Digital"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="track-id" className="mb-1.5 block text-xs text-muted-foreground">
            Référence du projet *
          </label>
          <input
            id="track-id"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder={t('track.placeholder')}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {loading ? '...' : t('track.search')}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <Link href="/" className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground">
        {t('track.back')}
      </Link>
    </main>
  )
}

export default function TrackProjectPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  )
}
