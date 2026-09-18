'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { SectionHeading } from './section-heading'

export function Faq() {
  const { t } = useLanguage()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const items = [1, 2, 3, 4, 5].map((n) => ({
    q: t(`faq.q${n}`),
    a: t(`faq.a${n}`),
  }))

  return (
    <section id="faq" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <SectionHeading eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
        <div className="flex flex-col">
          {items.map((item, i) => {
            const open = openIndex === i
            return (
              <div key={item.q} className="border-t border-border last:border-b">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-medium text-foreground sm:text-base">{item.q}</span>
                  <Plus
                    className={`h-4 w-4 shrink-0 text-primary transition-transform duration-300 ${
                      open ? 'rotate-45' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
