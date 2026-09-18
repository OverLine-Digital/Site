'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { LogOut, Paperclip, Eye, EyeOff, CheckCircle2, Clock, Trash2, ChevronDown, Globe2, Tag, Search, X, MessageSquare } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'

const STORAGE_BUCKET = 'project-request-files'

const STATUSES = [
  'new', 'contacted', 'quote_sent', 'approved',
  'in_development', 'testing', 'deployed', 'completed', 'cancelled',
]

// "new" reste la valeur stockée en base (et donc ce que /track/status
// interprète déjà comme "en attente" via statusToTimelineIndex), seul le
// libellé affiché ici change pour matcher le vocabulaire du dashboard.
const STATUS_LABELS: Record<string, string> = {
  new: 'En attente', contacted: 'Contacté', quote_sent: 'Devis envoyé', approved: 'Approuvé',
  in_development: 'En développement', testing: 'En test', deployed: 'Déployé',
  completed: 'Terminé', cancelled: 'Annulé',
}

type Booking = {
  id: string
  project_id: string
  status: string
  service_name: string
  full_name: string
  company: string | null
  email: string
  phone: string
  whatsapp: string | null
  country: string | null
  request_type: string | null
  budget?: string | null
  duration_label: string | null
  duration_weeks: number | null
  description: string
  created_at: string
  viewed_at?: string | null
  files?: string[] | null
  example_files?: string[] | null
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const loadBookings = useCallback(async () => {
    setLoading(true)
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('id, project_id, status, service_name, full_name, company, email, phone, whatsapp, country, request_type, duration_label, duration_weeks, description, created_at, viewed_at, files, example_files')
      .order('created_at', { ascending: false })
    if (error) {
      setActionError("Impossible de charger les demandes : " + error.message)
      setLoading(false)
      return
    }
    setBookings((data as Booking[]) ?? [])
    setLoading(false)
    // Le marquage "lu" n'est plus automatique au chargement : c'est
    // désormais une action manuelle (bouton œil ci-dessous), pour que le
    // statut "lu" reflète une vraie relecture par l'équipe, pas juste le
    // fait d'avoir ouvert le dashboard.
  }, [])

  useEffect(() => {
    let cancelled = false
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (cancelled) return
        if (!data.session) {
          router.replace('/admin/login')
          return
        }
        setCheckingAuth(false)
        loadBookings()
      })
      .catch(() => {
        if (!cancelled) router.replace('/admin/login')
      })
    return () => {
      cancelled = true
    }
  }, [router, loadBookings])

  // Abonnement Realtime : la table "bookings" est déjà répliquée (voir
  // supabase-migration.sql, point 2), mais rien ne l'exploitait jusqu'ici —
  // le dashboard ne se rafraîchissait qu'au chargement initial. Désormais,
  // toute nouvelle demande, tout changement de statut fait depuis un autre
  // onglet/appareil admin, et toute suppression apparaissent ici sans
  // recharger la page. RLS s'applique aussi au flux Realtime (le canal est
  // ouvert avec la session de l'admin connecté), donc rien de plus n'est
  // exposé que ce que la policy SELECT autorise déjà.
  useEffect(() => {
    if (checkingAuth) return
    const supabase = getSupabaseClient()

    const channel = supabase
      .channel('admin-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as Booking
            setBookings((prev) => (prev.some((b) => b.id === row.id) ? prev : [row, ...prev]))
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as Booking
            setBookings((prev) => prev.map((b) => (b.id === row.id ? { ...b, ...row } : b)))
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: string }
            if (oldRow.id) {
              setBookings((prev) => prev.filter((b) => b.id !== oldRow.id))
            }
          }
        },
      )
      .subscribe((status) => {
        setLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [checkingAuth])

  async function handleLogout() {
    await getSupabaseClient().auth.signOut()
    router.replace('/admin/login')
  }

  // Applique une mise à jour en base et ne touche l'état local QUE si la
  // requête a réellement réussi (avec vérification explicite de `error` et
  // du nombre de lignes affectées) — l'inverse a produit un bug silencieux
  // par le passé : la policy RLS d'UPDATE manquait, Supabase renvoyait un
  // "succès" sans avoir rien modifié, et le dashboard semblait fonctionner
  // alors que le client ne voyait jamais le changement.
  async function applyUpdate(id: string, patch: Partial<Booking>) {
    setUpdating(id)
    setActionError(null)
    const { data, error } = await getSupabaseClient()
      .from('bookings')
      .update(patch)
      .eq('id', id)
      .select('id')
    setUpdating(null)
    if (error) {
      setActionError('La mise à jour a échoué : ' + error.message)
      return false
    }
    if (!data || data.length === 0) {
      setActionError("La mise à jour n'a affecté aucune ligne (droits insuffisants ?).")
      return false
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    return true
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const booking = bookings.find((b) => b.id === id)
    // Changer le statut vaut relecture : sans ça, un projet marqué "Terminé"
    // par l'équipe resterait bloqué sur l'écran "Non lu" côté client (cet
    // écran ignore le statut tant que viewed_at est vide), ce qui serait
    // incohérent avec l'action que l'admin vient de faire.
    const patch: Partial<Booking> =
      newStatus !== 'new' && booking && !booking.viewed_at
        ? { status: newStatus, viewed_at: new Date().toISOString() }
        : { status: newStatus }
    await applyUpdate(id, patch)
  }

  async function handleToggleViewed(booking: Booking) {
    await applyUpdate(booking.id, { viewed_at: booking.viewed_at ? null : new Date().toISOString() })
  }

  async function handleDelete(booking: Booking) {
    setUpdating(booking.id)
    setActionError(null)
    const supabase = getSupabaseClient()

    // Nettoie aussi les fichiers du bucket privé associés à la demande,
    // pour ne pas laisser de fichiers orphelins facturés indéfiniment.
    const paths = [...(booking.files ?? []), ...(booking.example_files ?? [])]
    if (paths.length > 0) {
      const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove(paths)
      if (storageError) {
        // Non bloquant : on continue quand même la suppression de la ligne,
        // mais on prévient l'équipe pour un nettoyage manuel si besoin.
        console.error('Échec suppression fichiers Storage:', storageError.message)
      }
    }

    const { error, count } = await supabase
      .from('bookings')
      .delete({ count: 'exact' })
      .eq('id', booking.id)
    setUpdating(null)
    setConfirmDeleteId(null)
    if (error) {
      setActionError('La suppression a échoué : ' + error.message)
      return
    }
    if (!count) {
      setActionError("La suppression n'a affecté aucune ligne (droits insuffisants ?).")
      return
    }
    setBookings((prev) => prev.filter((b) => b.id !== booking.id))
  }

  async function handleOpenFile(path: string) {
    const { data, error } = await getSupabaseClient()
      .storage.from(STORAGE_BUCKET)
      .createSignedUrl(path, 60)
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Vérification...</p>
      </main>
    )
  }

  const statusFiltered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)
  const searchNormalized = search.trim().toLowerCase()
  const filtered = searchNormalized
    ? statusFiltered.filter((b) =>
        [b.project_id, b.full_name, b.email, b.company, b.service_name, b.phone, b.whatsapp]
          .filter(Boolean)
          .some((field) => (field as string).toLowerCase().includes(searchNormalized)),
      )
    : statusFiltered

  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              OverLine Digital
            </p>
            <div className="flex items-center gap-2">
              <h1 className="font-voice text-xl font-semibold text-foreground">
                Demandes de projet ({bookings.length})
              </h1>
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  live ? 'bg-emerald-400/10 text-emerald-400' : 'bg-secondary text-muted-foreground'
                }`}
                title={live ? 'Mises à jour en temps réel actives' : 'Connexion au flux en direct...'}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                {live ? 'En direct' : 'Connexion...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/messages"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground hover:bg-secondary"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Messages assistant
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" />
              Déconnexion
            </button>
          </div>
        </div>

        {actionError && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-2.5 text-xs text-red-400">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="shrink-0 underline">
              Fermer
            </button>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, référence, entreprise, téléphone..."
            className="w-full rounded-xl border border-input bg-secondary py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full border px-3.5 py-1.5 text-xs ${filter === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
          >
            Tous
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3.5 py-1.5 text-xs ${filter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {search ? 'Aucun résultat pour cette recherche.' : 'Aucune demande pour ce filtre.'}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((b) => {
              const isExpanded = expandedId === b.id
              return (
              <div key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : b.id)}
                    className="flex flex-1 items-start gap-2 text-left"
                  >
                    <ChevronDown
                      className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-primary">{b.project_id}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            b.viewed_at
                              ? 'bg-primary/10 text-primary'
                              : 'bg-amber-400/10 text-amber-400'
                          }`}
                        >
                          {b.viewed_at ? 'Lu' : 'Non lu'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {b.service_name} — {b.full_name}
                        {b.company ? ` (${b.company})` : ''}
                      </p>
                    </div>
                  </button>
                  <select
                    value={b.status}
                    disabled={updating === b.id}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                    className="rounded-lg border border-input bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions rapides — chacune se répercute immédiatement côté
                    client (page /track/status) puisqu'elles écrivent en base
                    via la policy RLS UPDATE/DELETE désormais en place. */}
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    disabled={updating === b.id}
                    onClick={() => handleToggleViewed(b)}
                    className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    {b.viewed_at ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {b.viewed_at ? 'Marquer non lu' : 'Marquer lu'}
                  </button>
                  <button
                    type="button"
                    disabled={updating === b.id || b.status === 'completed'}
                    onClick={() => handleStatusChange(b.id, 'completed')}
                    className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Terminé
                  </button>
                  <button
                    type="button"
                    disabled={updating === b.id || b.status === 'new'}
                    onClick={() => handleStatusChange(b.id, 'new')}
                    className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-secondary disabled:opacity-50"
                  >
                    <Clock className="h-3 w-3" />
                    En attente
                  </button>

                  {confirmDeleteId === b.id ? (
                    <span className="flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-red-400/5 px-2.5 py-1.5 text-[11px] text-red-400">
                      Supprimer définitivement ?
                      <button
                        type="button"
                        disabled={updating === b.id}
                        onClick={() => handleDelete(b)}
                        className="font-semibold underline disabled:opacity-50"
                      >
                        Oui
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="underline"
                      >
                        Annuler
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={updating === b.id}
                      onClick={() => setConfirmDeleteId(b.id)}
                      className="ml-auto flex items-center gap-1 rounded-lg border border-red-400/30 bg-red-400/5 px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {b.email} · {b.phone} · {b.duration_label ?? '—'}
                </p>

                {isExpanded ? (
                  <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3.5">
                    <div>
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Description complète
                      </p>
                      <p className="whitespace-pre-wrap text-xs text-foreground">{b.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Secteur :</span> {b.request_type ?? '—'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <Globe2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">Pays :</span> {b.country ?? '—'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">WhatsApp :</span>
                        {b.whatsapp ? (
                          <a
                            href={`https://wa.me/${b.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline"
                          >
                            {b.whatsapp}
                          </a>
                        ) : (
                          '—'
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-foreground">
                        <span className="text-muted-foreground">Durée estimée :</span>{' '}
                        {b.duration_weeks != null ? `${b.duration_weeks} semaine(s)` : '—'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{b.description}</p>
                )}

                {((b.example_files?.length ?? 0) > 0 || (b.files?.length ?? 0) > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...(b.example_files ?? []), ...(b.files ?? [])].map((path) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => handleOpenFile(path)}
                        className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2 py-1 text-[10px] text-foreground hover:bg-secondary"
                      >
                        <Paperclip className="h-3 w-3" />
                        {path.split('/').pop()}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  {new Date(b.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
