'use client'

import { motion } from 'framer-motion'
import { Hotel, UtensilsCrossed, GraduationCap, HeartPulse, ShoppingCart, Rocket, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SectionHeading } from './section-heading'

const SECTORS = [
  { key: 'hotels', icon: Hotel },
  { key: 'restaurants', icon: UtensilsCrossed },
  { key: 'schools', icon: GraduationCap },
  { key: 'healthcare', icon: HeartPulse },
  { key: 'business', icon: ShoppingCart },
  { key: 'startups', icon: Rocket },
] as const

export function Solutions({ onCustom }: { onCustom: () => void }) {
  const { t } = useLanguage()

  return (
    <section id="solutions" className="relative py-24 lg:py-32">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('solutions.eyebrow')}
          title={t('solutions.title')}
          description={t('solutions.desc')}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECTORS.map((sector, i) => (
            <motion.div
              key={sector.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass flex flex-col rounded-2xl p-6 transition-all duration-300 hover:border-primary/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                <sector.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h4 className="mb-2 font-medium text-foreground">{t(`solutions.${sector.key}.name`)}</h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`solutions.${sector.key}.desc`)}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-start lg:justify-center">
          <button
            type="button"
            onClick={onCustom}
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          >
            {t('solutions.customCta')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
