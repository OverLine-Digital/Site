'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mode "mot de passe oublié" : bascule le même formulaire vers un simple
  // envoi de lien de réinitialisation par email, au lieu d'une vraie page à
  // part — plus simple à maintenir pour un formulaire aussi court.
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    let cancelled = false
    getSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!cancelled && data.session) router.replace('/admin/dashboard')
      })
      .catch(() => {
        // Session invalide/périmée — on reste simplement sur la page de connexion.
      })
    return () => {
      cancelled = true
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: authError } = await getSupabaseClient().auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('Email ou mot de passe incorrect.')
      return
    }
    router.replace('/admin/dashboard')
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: resetError } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/admin/reset-password`,
    })
    setLoading(false)
    if (resetError) {
      setError("Impossible d'envoyer le lien de réinitialisation. Réessaie dans un instant.")
      return
    }
    // Message volontairement identique que l'email existe ou non côté
    // Supabase Auth, pour ne pas révéler quels emails ont un compte admin.
    setResetSent(true)
  }

  if (mode === 'forgot') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <form
          onSubmit={handleForgotPassword}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8"
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            OverLine Digital
          </p>
          <h1 className="mb-2 font-voice text-xl font-semibold text-foreground">Mot de passe oublié</h1>

          {resetSent ? (
            <p className="mb-6 text-sm text-muted-foreground">
              Si un compte admin existe pour <strong className="text-foreground">{email}</strong>, un lien de
              réinitialisation vient d&apos;être envoyé. Vérifie ta boîte mail (et les spams).
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Indique ton email admin, tu recevras un lien pour choisir un nouveau mot de passe.
              </p>
              <label htmlFor="reset-email" className="mb-1.5 block text-xs text-muted-foreground">
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-4 w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              {error && <p className="mb-4 text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mb-3 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
              >
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setMode('login')
              setResetSent(false)
              setError(null)
            }}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            ← Retour à la connexion
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8"
      >
        <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          OverLine Digital
        </p>
        <h1 className="mb-6 font-voice text-xl font-semibold text-foreground">Espace admin</h1>

        <label htmlFor="email" className="mb-1.5 block text-xs text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
        />

        <label htmlFor="password" className="mb-1.5 block text-xs text-muted-foreground">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
        />

        <button
          type="button"
          onClick={() => {
            setMode('forgot')
            setError(null)
          }}
          className="mb-4 text-xs text-muted-foreground hover:text-foreground"
        >
          Mot de passe oublié ?
        </button>

        {error && <p className="mb-4 text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </main>
  )
}

