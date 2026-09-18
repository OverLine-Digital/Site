'use client'

import { motion } from 'framer-motion'
import { Check, Clock3 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { dict } from '@/lib/i18n'

export function Trust() {
  const { t, lang } = useLanguage()
  const itemsArray: string[] = dict[lang]?.trust?.items ?? []

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-10 text-left lg:text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {t('trust.eyebrow')}
          </p>
          <h2 className="text-balance font-voice text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            {t('trust.title')}
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {itemsArray.map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {item}
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4 text-primary" />
          {t('trust.response')}
        </div>
      </div>
    </section>
  )
}
