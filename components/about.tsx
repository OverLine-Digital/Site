'use client'

import { motion } from 'framer-motion'
import { Layers, HeadphonesIcon, Languages, Clock3 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export function About() {
  const { t } = useLanguage()

  const stats = [
    { icon: Layers, value: '13', label: t('about.stat1') },
    { icon: HeadphonesIcon, value: '24/7', label: t('about.stat2') },
    { icon: Languages, value: '4', label: t('about.stat3') },
    { icon: Clock3, value: '24h', label: t('about.stat4') },
  ]

  return (
    <section id="about" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="pointer-events-none absolute right-0 top-0 h-[350px] w-[550px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">{t('about.eyebrow')}</p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t('about.title')}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{t('about.p1')}</p>
          <p className="mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">{t('about.p2')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-2xl border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/about-work.webp"
            alt="Équipe au travail sur un projet client"
            className="h-full w-full object-cover grayscale-[15%]"
          />
        </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass flex flex-col items-center rounded-2xl p-5 text-center"
            >
              <s.icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
              <p className="text-2xl font-semibold text-foreground">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
