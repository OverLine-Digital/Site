'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Sparkles, Send, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export function AiAssistant({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useLanguage()
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot anti-bot
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) {
      setStatus('error')
      setErrorMessage(t('assistant.errorEmpty'))
      return
    }

    setStatus('sending')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/assistant-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          contactName: name.trim() || undefined,
          contactEmail: email.trim() || undefined,
          website,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (data.errorKey === 'messageTooLong') setErrorMessage(t('assistant.errorTooLong'))
        else if (data.errorKey === 'rateLimited') setErrorMessage(t('assistant.errorRateLimited'))
        else setErrorMessage(t('assistant.errorGeneric'))
        setStatus('error')
        return
      }

      setStatus('sent')
      setMessage('')
      setName('')
      setEmail('')
    } catch {
      setStatus('error')
      setErrorMessage(t('assistant.errorGeneric'))
    }
  }

  function resetForm() {
    setStatus('idle')
    setErrorMessage(null)
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 16 }}
        className="fixed bottom-6 right-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 glow-blue"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Bot className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong fixed bottom-24 right-6 z-[70] flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-3xl shadow-2xl shadow-primary/20"
            role="dialog"
            aria-label={t('assistant.title')}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/15">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground" />
              </span>
              <p className="text-sm font-medium text-foreground">{t('assistant.title')}</p>
            </div>

            <div className="flex flex-col gap-3 px-5 py-5">
              <p className="text-sm font-medium text-foreground">{t('assistant.unavailable')}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{t('assistant.teamHandling')}</p>

              {status === 'sent' ? (
                <div className="mt-1 flex flex-col items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <p className="text-sm font-medium">{t('assistant.sent')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    {t('assistant.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSend} className="mt-1 flex flex-col gap-2.5">
                  {/* Honeypot anti-bot : invisible pour un humain */}
                  <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('assistant.placeholder')}
                    maxLength={2000}
                    rows={3}
                    disabled={status === 'sending'}
                    className="w-full resize-none rounded-xl border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('assistant.nameLabel')}
                      disabled={status === 'sending'}
                      className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('assistant.emailLabel')}
                      disabled={status === 'sending'}
                      className="w-full rounded-xl border border-input bg-secondary px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-60"
                    />
                  </div>

                  {status === 'error' && errorMessage && (
                    <p className="text-xs text-red-400">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {status === 'sending' ? t('assistant.sending') : t('assistant.send')}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

