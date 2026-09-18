'use client'

import { motion } from 'framer-motion'
import { Globe, Smartphone, Layers as LayersIcon, Palette, Bot } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SectionHeading } from './section-heading'

// Placeholders honnêtes — aucun faux client ni faux projet livré n'est affirmé ici.
// À remplacer par de vrais projets dès qu'ils seront disponibles.
const ITEMS = [
  { key: 'websites', icon: Globe, tag: 'concept' as const },
  { key: 'apps', icon: Smartphone, tag: 'concept' as const },
  { key: 'saas', icon: LayersIcon, tag: 'demo' as const },
  { key: 'branding', icon: Palette, tag: 'concept' as const },
  { key: 'ai', icon: Bot, tag: 'demo' as const },
]

export function Portfolio() {
  const { t } = useLanguage()

  return (
    <section id="portfolio" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('portfolio.eyebrow')}
          title={t('portfolio.title')}
          description={t('portfolio.desc')}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:border-primary/40"
            >
              <div className="flex h-40 items-center justify-center bg-secondary/60">
                <item.icon className="h-9 w-9 text-primary/70" />
              </div>
              <span className="absolute right-3 top-3 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground backdrop-blur">
                {item.tag === 'concept' ? t('portfolio.concept') : t('portfolio.demo')}
              </span>
              <div className="p-5">
                <p className="text-xs uppercase tracking-wide text-primary">{t(`portfolio.${item.key}`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
