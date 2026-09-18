'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, Mail, XCircle, Clock, Calendar, RefreshCw } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'

const WHATSAPP_NUMBER = '244952378216'
const CONTACT_EMAIL = 'overlinedigitall@gmail.com'

type Booking = {
  project_id: string
  full_name: string
  company: string | null
  service_name: string
  status: string
  duration_label: string | null
  duration_weeks: number | null
  viewed_at: string | null
  updated_at: string
  created_at: string
}

const TIMELINE_LABELS = [
  'Demande reçue',
  'Étude du projet',
  'Prise de contact',
  'Proposition',
  'Validation',
  'Développement',
]

// Fait correspondre le statut interne (admin) à l'étape client affichée.
function statusToTimelineIndex(status: string): number {
  switch (status) {
    case 'new':
      return 1
    case 'contacted':
      return 2
    case 'quote_sent':
      return 3
    case 'approved':
      return 4
    case 'in_development':
    case 'testing':
    case 'deployed':
    case 'completed':
      return 5
    default:
      return 1
  }
}

// Badge de statut affiché au client. Règle importante demandée : si la
// demande est lue (viewed_at renseigné) mais que l'équipe n'a pas encore
// changé le statut interne (toujours "new"), on affiche automatiquement
// "En révision" plutôt que le libellé admin brut ("En attente") — ça
// reflète mieux la réalité pour le client : quelqu'un a bien regardé sa
// demande, même si aucune étape formelle n'a encore été franchie.
function statusBadge(status: string, isRead: boolean): { label: string; tone: 'amber' | 'blue' | 'green' | 'red' } {
  if (!isRead) return { label: 'Non lu', tone: 'amber' }
  switch (status) {
    case 'new':
      return { label: 'En révision', tone: 'amber' }
    case 'contacted':
      return { label: 'Contact pris', tone: 'blue' }
    case 'quote_sent':
      return { label: 'Devis envoyé', tone: 'blue' }
    case 'approved':
      return { label: 'Approuvé', tone: 'blue' }
    case 'in_development':
      return { label: 'En développement', tone: 'blue' }
    case 'testing':
      return { label: 'En test', tone: 'blue' }
    case 'deployed':
      return { label: 'Déployé', tone: 'blue' }
    case 'completed':
      return { label: 'Terminé', tone: 'green' }
    case 'cancelled':
      return { label: 'Annulé', tone: 'red' }
    default:
      return { label: 'En révision', tone: 'amber' }
  }
}

const TONE_CLASSES: Record<string, string> = {
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-400',
  blue: 'border-primary/30 bg-primary/10 text-primary',
  green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
  red: 'border-red-400/30 bg-red-400/10 text-red-400',
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `il y a ${days} j`
  return new Date(iso).toLocaleDateString('fr-FR')
}

function TrackStatusContent() {
  const searchParams = useSearchParams()
  const id = (searchParams.get('id') ?? '').trim()
  const name = (searchParams.get('name') ?? '').trim()
  const company = (searchParams.get('company') ?? '').trim()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    if (!id || !name) {
      setError('Nom ou référence manquant.')
      setLoading(false)
      return
    }

    let cancelled = false

    // On passe par la route serveur /api/track-status (qui applique elle-
    // même une limite de débit et utilise get_booking_status en interne)
    // plutôt que d'appeler Supabase directement depuis le navigateur — un
    // appel client direct contournait totalement toute limite de débit et
    // rendait une recherche par force brute sur le Project ID réaliste.
    async function fetchStatus(showLoading: boolean) {
      if (showLoading) setLoading(true)
      let data: Booking | null = null
      let failed = false
      try {
        const res = await fetch('/api/track-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: id, fullName: name, company: company || undefined }),
        })
        if (res.ok) {
          data = await res.json()
        } else if (res.status !== 404) {
          failed = true
        }
      } catch {
        failed = true
      }

      if (cancelled) return

      if (failed || !data) {
        setError('Aucune demande ne correspond à ces informations.')
        setLoading(false)
        return
      }
      setBooking(data)
      setError(null)
      setLoading(false)
      setLastChecked(new Date())
    }

    fetchStatus(true)

    // Actualisation automatique (sans rechargement de page) : on
    // re-interroge la fonction sécurisée toutes les 20 secondes pour
    // refléter les changements de statut faits par l'équipe, et
    // immédiatement quand l'utilisateur revient sur l'onglet (au cas où il
    // ait laissé la page ouverte en arrière-plan pendant un moment).
    const interval = setInterval(() => fetchStatus(false), 20000)
    function handleVisibility() {
      if (document.visibilityState === 'visible') fetchStatus(false)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [id, name, company])

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Bonjour OverLine Digital, je souhaite un point sur ma demande de projet (référence ${id}). Merci de bien vouloir l'analyser.`
  )}`
  const emailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Relance — demande de projet ${id}`
  )}&body=${encodeURIComponent(
    `Bonjour OverLine Digital,\n\nJe souhaite un point sur ma demande de projet (référence ${id}).\nMerci de bien vouloir l'analyser.\n\nCordialement,\n${name}`
  )}`

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-5">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </main>
    )
  }

  if (error || !booking) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
        <XCircle className="mb-3 h-8 w-8 text-red-400" />
        <p className="text-sm text-foreground">{error ?? 'Demande introuvable.'}</p>
        <Link href="/track" className="mt-6 text-sm text-primary underline">
          Réessayer
        </Link>
      </main>
    )
  }

  const isRead = Boolean(booking.viewed_at)
  const currentIndex = isRead ? statusToTimelineIndex(booking.status) : 0
  const isCancelled = booking.status === 'cancelled'
  const isCompleted = booking.status === 'completed'
  const badge = statusBadge(booking.status, isRead)

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-14">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Site &gt; Suivre mon projet
      </p>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h1 className="font-voice text-2xl font-semibold text-foreground">{booking.project_id}</h1>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${TONE_CLASSES[badge.tone]}`}>
          {badge.label}
        </span>
      </div>
      <p className="mb-1 text-sm text-muted-foreground">
        {booking.service_name} — {booking.full_name}
        {booking.company ? ` (${booking.company})` : ''}
      </p>
      {lastChecked && (
        <p className="mb-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          Mis à jour {timeAgo(booking.updated_at)} · vérifié {timeAgo(lastChecked.toISOString())}
        </p>
      )}
      {!lastChecked && <div className="mb-8" />}

      {isCancelled ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-400/5 px-5 py-5">
          <p className="text-sm font-medium text-foreground">Cette demande a été annulée.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Contactez notre équipe si vous pensez qu&rsquo;il s&rsquo;agit d&rsquo;une erreur.
          </p>
        </div>
      ) : !isRead ? (
        <div className="rounded-2xl border border-border bg-card px-5 py-6 text-center">
          <p className="text-sm font-medium text-foreground">Non lu</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Notre équipe n&rsquo;a pas encore consulté votre demande. Vous pouvez la relancer
            directement ci-dessous — votre référence est jointe automatiquement au message.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-blue"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={emailHref}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40"
            >
              <Mail className="h-4 w-4" /> E-mail
            </a>
          </div>
        </div>
      ) : isCompleted ? (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 px-5 py-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15">
            <Check className="h-6 w-6 text-emerald-400" />
          </span>
          <p className="text-sm font-medium text-foreground">Projet terminé 🎉</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Votre projet a été livré. Besoin de support ou d&rsquo;une évolution ? Contactez-nous directement.
          </p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-blue"
            >
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={emailHref}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40"
            >
              <Mail className="h-4 w-4" /> E-mail
            </a>
          </div>
        </div>
      ) : (
        <div>
          {(booking.duration_label || booking.created_at) && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              {booking.duration_label && (
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> Durée estimée
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{booking.duration_label}</p>
                </div>
              )}
              <div className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Calendar className="h-3 w-3" /> Demande reçue
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {new Date(booking.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          )}

          <ol className="flex flex-col gap-0">
            {TIMELINE_LABELS.map((label, i) => {
              const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future'
              return (
                <li key={label} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < TIMELINE_LABELS.length - 1 && (
                    <span
                      className={`absolute left-[15px] top-8 h-full w-px ${
                        state === 'done' ? 'bg-primary/50' : 'bg-border'
                      }`}
                    />
                  )}
                  <span
                    className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                      state === 'done'
                        ? 'bg-primary text-primary-foreground'
                        : state === 'current'
                          ? 'border-2 border-primary bg-primary/15 text-primary'
                          : 'border border-border bg-secondary text-muted-foreground'
                    }`}
                  >
                    {state === 'done' ? <Check className="h-4 w-4" /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <p className={`pt-1.5 text-sm ${state === 'future' ? 'text-muted-foreground opacity-60' : 'text-foreground'}`}>
                    {label}
                  </p>
                </li>
              )
            })}
          </ol>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40"
            >
              <WhatsAppIcon className="h-4 w-4" /> Une question ?
            </a>
          </div>
        </div>
      )}

      <Link href="/" className="mt-10 inline-block text-sm text-muted-foreground hover:text-foreground">
        Retour à l&rsquo;accueil
      </Link>
    </main>
  )
}

export default function TrackStatusPage() {
  return (
    <Suspense fallback={null}>
      <TrackStatusContent />
    </Suspense>
  )
}
