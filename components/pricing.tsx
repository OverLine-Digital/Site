'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import { allServices, estimatedDelivery, type Service } from '@/lib/services'
import { serviceI18n } from '@/lib/i18n'
import { useLanguage } from '@/lib/language-context'
import { SectionHeading } from './section-heading'

export function Pricing({ onRequestService }: { onRequestService: (service: Service) => void }) {
  const [selectedId, setSelectedId] = useState('website-development')
  const { lang, t } = useLanguage()
  const service = allServices.find((s) => s.id === selectedId) ?? allServices[0]

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading eyebrow={t('benefits.eyebrow')} title={t('benefits.title')} description={t('benefits.desc')} />

        <div className="mb-10 flex flex-wrap justify-start gap-2 lg:justify-center">
          {allServices
            .filter((s) => s.durations.length >= 3)
            .map((s) => {
              const localized = serviceI18n[s.id]?.[lang]
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    s.id === selectedId
                      ? 'border-primary/60 bg-primary/12 text-primary'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {localized?.name ?? s.name}
                </button>
              )
            })}
        </div>

        <div
          className={`grid gap-5 sm:grid-cols-2 ${
            service.durations.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          }`}
        >
          {service.durations.map((d, i) => (
            <motion.div
              key={`${service.id}-${d.label}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 ${
                d.recommended
                  ? 'border border-primary/50 bg-primary/8 shadow-[0_0_60px_rgba(159, 202, 138,0.15)]'
                  : 'glass hover:border-primary/30'
              }`}
            >
              {d.recommended && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-[11px] font-medium text-primary-foreground glow-blue">
                  <Sparkles className="h-3 w-3" /> {t('benefits.recommended')}
                </span>
              )}
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{d.label}</p>
              <p className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                {t('benefits.delivery')} {estimatedDelivery(d.weeks)}
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {[
                  t('benefits.feat1'),
                  t('benefits.feat2'),
                  t('benefits.feat3'),
                  d.recommended ? t('benefits.feat4') : t('benefits.feat4b'),
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onRequestService(service)}
                className={`mt-7 rounded-full py-2.5 text-sm font-medium transition-all ${
                  d.recommended
                    ? 'bg-primary text-primary-foreground hover:brightness-110 glow-blue'
                    : 'border border-border text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t('benefits.cta')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
