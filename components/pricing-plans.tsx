'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SectionHeading } from './section-heading'

const PLANS = [
  { key: 'starter', price: 450, features: ['1-4 pages', 'Responsive design', 'Basic SEO', 'Email support'] },
  { key: 'business', price: 900, featured: true, features: ['Up to 10 pages', 'Custom design', 'Dashboard/admin', 'Priority support'] },
  { key: 'premium', price: 1800, features: ['Unlimited pages', 'Advanced integrations', 'AI features', 'Dedicated manager'] },
  { key: 'custom', price: null, features: ['Complex platforms', 'SaaS architecture', 'Custom scope', 'Direct consulting'] },
] as const

export function PricingPlans({ onQuote }: { onQuote: () => void }) {
  const { t } = useLanguage()

  return (
    <section id="plans" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading eyebrow={t('plans.eyebrow')} title={t('plans.title')} description={t('plans.desc')} />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                plan.featured
                  ? 'border border-primary/50 bg-primary/8 shadow-[0_0_60px_rgba(255,107,71,0.15)]'
                  : 'glass hover:border-primary/30'
              }`}
            >
              <p className="font-mono text-xs uppercase tracking-widest text-primary">
                {t(`plans.${plan.key}Name`)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{t(`plans.${plan.key}Desc`)}</p>
              <p className="mt-5 text-2xl font-semibold text-foreground">
                {plan.price ? (
                  <>
                    {t('plans.from')} <span className="font-voice">${plan.price}</span>
                  </>
                ) : (
                  t('plans.customQuote')
                )}
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onQuote}
                className={`mt-7 rounded-full py-2.5 text-sm font-medium transition-all ${
                  plan.featured
                    ? 'bg-primary text-primary-foreground hover:brightness-110 glow-blue'
                    : 'border border-border text-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t('plans.quote')}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
