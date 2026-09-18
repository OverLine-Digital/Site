'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function AdminResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Le lien envoyé par email contient un jeton de récupération dans l'URL ;
    // le client Supabase le détecte automatiquement (detectSessionInUrl,
    // activé par défaut) et ouvre une session temporaire "recovery" avant
    // même que ce composant ne se monte complètement dans certains cas — on
    // écoute l'événement PASSWORD_RECOVERY pour être sûr d'être prêt.
    const supabase = getSupabaseClient()
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })
    // Filet de sécurité : si l'événement a déjà été émis avant que ce composant
    // ne s'abonne, on vérifie aussi la session existante directement.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    const { error: updateError } = await getSupabaseClient().auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError("Impossible de mettre à jour le mot de passe : " + updateError.message)
      return
    }
    setSuccess(true)
    setTimeout(() => router.replace('/admin/dashboard'), 1500)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8">
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          OverLine Digital
        </p>
        <h1 className="mb-6 font-voice text-xl font-semibold text-foreground">Nouveau mot de passe</h1>

        {!ready && !success && (
          <p className="text-sm text-muted-foreground">
            Vérification du lien de réinitialisation...
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-400">
            Mot de passe mis à jour. Redirection vers le dashboard...
          </p>
        )}

        {ready && !success && (
          <form onSubmit={handleSubmit}>
            <label htmlFor="new-password" className="mb-1.5 block text-xs text-muted-foreground">
              Nouveau mot de passe
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />

            <label htmlFor="confirm-password" className="mb-1.5 block text-xs text-muted-foreground">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-6 w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />

            {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Enregistrement...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
