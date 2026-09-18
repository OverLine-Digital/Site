'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.06 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const EXPERTISE_TAGS = [
  'expertise.websites',
  'expertise.apps',
  'expertise.software',
  'expertise.ai',
  'expertise.cybersecurity',
] as const

export function Hero({ onStartProject }: { onStartProject: () => void }) {
  const { t } = useLanguage()

  const stats = [
    { label: t('hero.statResponseLabel'), value: t('hero.statResponseValue') },
    { label: t('hero.statBasedLabel'), value: t('hero.statBasedValue') },
    { label: t('hero.statMethodLabel'), value: t('hero.statMethodValue') },
  ]

  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/about-work.webp"
        alt="Équipe OverLine Digital au travail"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/55 via-background/35 to-background" />
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <svg viewBox="0 0 800 900" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <path
            d="M -50,650 C 250,750 350,500 550,550 S 850,400 900,250"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="6"
            opacity="0.55"
          />
          <path
            d="M -50,690 C 260,790 360,540 560,590 S 860,440 910,290"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="4"
            opacity="0.5"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-32 text-center sm:pt-40">
        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-3.5 text-balance font-voice text-[1.9rem] font-semibold leading-[1.2] text-foreground sm:text-4xl lg:text-5xl"
        >
          {t('hero.title1')}, <span className="text-primary">{t('hero.title2')}</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-3.5 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground"
        >
          {t('hero.desc')}
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mt-6.5 flex flex-wrap items-center justify-center gap-2.5"
        >
          <button
            type="button"
            onClick={onStartProject}
            className="rounded-lg bg-primary px-7 py-3.5 text-[13px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t('hero.cta1')}
          </button>
        </motion.div>

        <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-2.5 text-[12px] text-primary">
          {t('positioning')}
        </motion.p>

        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="mt-16 w-full max-w-2xl pb-14">
          <div className="border-b border-white/15 pb-3.5 text-center text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
            {t('hero.expertiseTitle')}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {EXPERTISE_TAGS.map((key) => (
              <span
                key={key}
                className="rounded-full border border-white/25 px-3 py-1.5 text-[11px] text-muted-foreground"
              >
                {t(key)}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-14">
        <div className="flex divide-x divide-white/15 overflow-hidden rounded-2xl bg-[#0c1420]">
          {stats.map((stat) => (
            <div key={stat.label} className="flex-1 px-2.5 py-4 text-center text-white">
              <div className="text-sm font-bold text-primary">{stat.value}</div>
              <div className="mt-0.5 text-[9.5px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
