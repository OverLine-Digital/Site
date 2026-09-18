'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Handshake, ArrowRight, X, Building2, Palette, Megaphone, Share2 } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

type PartnerType = 'company' | 'designer' | 'marketing' | 'social'

export function Partnership() {
  const [open, setOpen] = useState(false)
  const { lang, t } = useLanguage()

  // Un message WhatsApp différent par type de partenariat — rédigés
  // naturellement dans chaque langue plutôt que traduits mot pour mot d'une
  // langue à l'autre (une traduction trop "miroir" d'une phrase à l'autre
  // est un signal qui trahit un texte traduit automatiquement).
  const partnerMessages: Record<PartnerType, Record<string, string>> = {
    company: {
      fr: "Bonjour OverLine Digital, je représente une entreprise intéressée par un partenariat avec vous. Pouvez-vous me donner plus d'informations ?",
      en: "Hi OverLine Digital — I'm reaching out on behalf of a company interested in partnering with you. Could you tell me more?",
      es: 'Hola OverLine Digital, represento a una empresa interesada en una alianza con ustedes. ¿Me dan más detalles?',
      pt: 'Olá OverLine Digital! Represento uma empresa e temos interesse numa parceria convosco. Podem explicar como funciona?',
    },
    designer: {
      fr: 'Bonjour OverLine Digital, je suis designer graphique et je souhaite explorer un partenariat avec votre équipe. Quelles sont les prochaines étapes ?',
      en: "Hello OverLine Digital, I'm a graphic designer and I'd like to explore a partnership with your team. What would be the next steps?",
      es: 'Hola OverLine Digital, soy diseñador gráfico y me interesa un posible partnership con ustedes. ¿Cómo seguimos?',
      pt: 'Olá! Sou designer gráfico e gostava de saber mais sobre uma parceria com a OverLine Digital. Como podemos avançar?',
    },
    marketing: {
      fr: 'Bonjour OverLine Digital, je travaille dans le marketing digital et un partenariat avec vous m\u2019intéresse. On peut en discuter ?',
      en: "Hi there — I work in digital marketing and I'd love to talk about a potential partnership with OverLine Digital.",
      es: 'Hola, trabajo en marketing digital y me gustaría conversar sobre una posible alianza con OverLine Digital.',
      pt: 'Olá equipa OverLine Digital, atuo na área de marketing digital e gostaria de conversar sobre uma parceria.',
    },
    social: {
      fr: 'Bonjour OverLine Digital, je gère des réseaux sociaux et j\u2019aimerais devenir partenaire. Vous pouvez m\u2019en dire plus ?',
      en: 'Hello! I manage social media accounts and would love to become a partner of OverLine Digital — can you share the details?',
      es: 'Hola OverLine Digital, gestiono redes sociales y me interesaría ser socio. ¿Podrían contarme más?',
      pt: 'Olá! Trabalho com gestão de redes sociais e tenho interesse em ser parceiro da OverLine Digital. Podem dar mais detalhes?',
    },
  }

  function pickPartnerType(type: PartnerType) {
    const message = partnerMessages[type][lang] ?? partnerMessages[type].fr
    const url = `https://wa.me/244952378216?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const partnerOptions: { type: PartnerType; icon: typeof Building2; labelKey: string }[] = [
    { type: 'company', icon: Building2, labelKey: 'partnership.companyOption' },
    { type: 'designer', icon: Palette, labelKey: 'partnership.designerOption' },
    { type: 'marketing', icon: Megaphone, labelKey: 'partnership.marketingOption' },
    { type: 'social', icon: Share2, labelKey: 'partnership.socialOption' },
  ]

  return (
    <section id="partnership" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass relative overflow-hidden rounded-3xl px-8 py-16 text-center lg:px-16 lg:py-20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/partnership-work.webp"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.14]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="relative">
            <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 glow-blue">
              <Handshake className="h-6 w-6 text-primary" aria-hidden="true" />
            </span>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t('partnership.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              {t('partnership.desc')}
            </p>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-blue"
            >
              {t('partnership.cta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-lg rounded-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">{t('partnership.pickTitle')}</h3>
                <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">{t('partnership.pickDesc')}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {partnerOptions.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => pickPartnerType(option.type)}
                    className="flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/20"
                  >
                    <option.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
