'use client'

import { motion } from 'framer-motion'
import { Search, FileText, Palette, Code2, ShieldCheck, Rocket, GraduationCap, LifeBuoy } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { useLanguage } from '@/lib/language-context'

const stepIcons = [Search, FileText, Palette, Code2, ShieldCheck, Rocket, GraduationCap, LifeBuoy]

export function DashboardPreview() {
  const { t } = useLanguage()

  const steps = stepIcons.map((Icon, i) => ({
    Icon,
    label: t(`dashboard.step${i + 1}`),
    desc: t(`dashboard.step${i + 1}Desc`),
  }))

  return (
    <section id="dashboard" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="pointer-events-none absolute left-0 top-1/4 h-[400px] w-[500px] rounded-full bg-primary/5 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('dashboard.eyebrow')}
          title={t('dashboard.title')}
          description={t('dashboard.desc')}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-2xl border border-border"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dashboard-work.webp"
            alt="Planification et suivi de projet"
            className="h-56 w-full object-cover grayscale-[15%] sm:h-72"
          />
        </motion.div>

        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* connecting line on large screens */}
          <div className="pointer-events-none absolute inset-x-0 top-11 hidden h-px bg-border lg:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="glass relative flex flex-col rounded-2xl p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <step.Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h4 className="mb-1.5 text-sm font-medium text-foreground">{step.label}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
