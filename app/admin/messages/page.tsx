'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { LogOut, Trash2, Mail, ArrowLeft, CheckCircle2, Circle } from 'lucide-react'

type AssistantMessage = {
  id: string
  message: string
  contact_name: string | null
  contact_email: string | null
  status: string
  created_at: string
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [live, setLive] = useState(false)

  const loadMessages = useCallback(async () => {
    setLoading(true)
    const { data, error } = await getSupabaseClient()
      .from('assistant_messages')
      .select('id, message, contact_name, contact_email, status, created_at')
      .order('created_at', { ascending: false })
    if (error) {
      setActionError('Impossible de charger les messages : ' + error.message)
      setLoading(false)
      return
    }
    setMessages((data as AssistantMessage[]) ?? [])
    setLoading(false)
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
        loadMessages()
      })
      .catch(() => {
        if (!cancelled) router.replace('/admin/login')
      })
    return () => {
      cancelled = true
    }
  }, [router, loadMessages])

  // Même principe Realtime que le dashboard principal des demandes de
  // projet : un nouveau message laissé pendant que cette page est ouverte
  // apparaît instantanément, sans recharger.
  useEffect(() => {
    if (checkingAuth) return
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel('admin-assistant-messages-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'assistant_messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as AssistantMessage
            setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [row, ...prev]))
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as AssistantMessage
            setMessages((prev) => prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)))
          } else if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: string }
            if (oldRow.id) setMessages((prev) => prev.filter((m) => m.id !== oldRow.id))
          }
        },
      )
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))
    return () => {
      supabase.removeChannel(channel)
    }
  }, [checkingAuth])

  async function handleLogout() {
    await getSupabaseClient().auth.signOut()
    router.replace('/admin/login')
  }

  async function toggleRead(m: AssistantMessage) {
    setUpdating(m.id)
    setActionError(null)
    const newStatus = m.status === 'read' ? 'new' : 'read'
    const { data, error } = await getSupabaseClient()
      .from('assistant_messages')
      .update({ status: newStatus })
      .eq('id', m.id)
      .select('id')
    setUpdating(null)
    if (error || !data || data.length === 0) {
      setActionError('La mise à jour a échoué' + (error ? ` : ${error.message}` : ''))
      return
    }
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: newStatus } : x)))
  }

  async function handleDelete(id: string) {
    setUpdating(id)
    setActionError(null)
    const { error, count } = await getSupabaseClient()
      .from('assistant_messages')
      .delete({ count: 'exact' })
      .eq('id', id)
    setUpdating(null)
    setConfirmDeleteId(null)
    if (error || !count) {
      setActionError('La suppression a échoué' + (error ? ` : ${error.message}` : ''))
      return
    }
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard" className="mb-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour aux demandes de projet
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="font-voice text-xl font-semibold text-foreground">
              Messages assistant ({messages.length})
            </h1>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                live ? 'bg-emerald-400/10 text-emerald-400' : 'bg-secondary text-muted-foreground'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${live ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
              {live ? 'En direct' : 'Connexion...'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" /> Déconnexion
        </button>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-2.5 text-xs text-red-400">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="shrink-0 underline">
            Fermer
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun message reçu pour l&apos;instant — ils apparaîtront ici dès qu&apos;un visiteur en laisse un via le
          widget assistant du site.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    m.status === 'read' ? 'bg-primary/10 text-primary' : 'bg-amber-400/10 text-amber-400'
                  }`}
                >
                  {m.status === 'read' ? 'Lu' : 'Non lu'}
                </span>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(m.created_at).toLocaleString('fr-FR')}
                </p>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground">{m.message}</p>
              {(m.contact_name || m.contact_email) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {m.contact_name}
                  {m.contact_name && m.contact_email ? ' · ' : ''}
                  {m.contact_email}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={updating === m.id}
                  onClick={() => toggleRead(m)}
                  className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  {m.status === 'read' ? <Circle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {m.status === 'read' ? 'Marquer non lu' : 'Marquer lu'}
                </button>
                {m.contact_email && (
                  <a
                    href={`mailto:${m.contact_email}`}
                    className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-[11px] text-foreground hover:bg-secondary"
                  >
                    <Mail className="h-3 w-3" /> Répondre par email
                  </a>
                )}
                {confirmDeleteId === m.id ? (
                  <span className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-400/40 bg-red-400/5 px-2.5 py-1.5 text-[11px] text-red-400">
                    Supprimer ?
                    <button
                      type="button"
                      disabled={updating === m.id}
                      onClick={() => handleDelete(m.id)}
                      className="font-semibold underline disabled:opacity-50"
                    >
                      Oui
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="underline">
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={updating === m.id}
                    onClick={() => setConfirmDeleteId(m.id)}
                    className="ml-auto flex items-center gap-1 rounded-lg border border-red-400/30 bg-red-400/5 px-2.5 py-1.5 text-[11px] text-red-400 hover:bg-red-400/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
