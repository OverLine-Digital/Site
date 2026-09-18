'use client'

import Link from 'next/link'
import { Mail, MapPin } from 'lucide-react'
import { WhatsAppIcon } from './icons/whatsapp-icon'
import { useLanguage } from '@/lib/language-context'
import { langMeta, type Lang } from '@/lib/i18n'

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const socials = [
  { icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/overline_digital/' },
]

export function Footer() {
  const { lang, setLang, t } = useLanguage()

  const columns = [
    {
      title: t('footer.quickLinks'),
      links: [
        { label: t('nav.about'), href: '#about' },
        { label: t('nav.dashboard'), href: '#dashboard' },
        { label: t('nav.services'), href: '#services' },
        { label: t('nav.partnership'), href: '#partnership' },
        { label: t('faq.eyebrow'), href: '#faq' },
        { label: t('nav.contact'), href: '#contact' },
      ],
    },
  ]

  return (
    <footer className="relative border-t border-border">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a12] p-1.5">
                <img src="/images/logo-icon.png" alt="OverLine Digital" className="h-full w-full object-contain" />
              </span>
              <span className="font-semibold tracking-tight text-foreground">
                OverLine <span className="text-muted-foreground">Digital</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">{t('footer.tagline')}</p>
            <div className="mt-6 flex gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="glass flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
                >
                  <s.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-label={t('footer.languages')}>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t('footer.languages')}</p>
            <ul className="flex flex-col gap-2.5">
              {(Object.keys(langMeta) as Lang[]).map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => setLang(code)}
                    className={`text-sm transition-colors hover:text-foreground ${
                      code === lang ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {langMeta[code].flag} {langMeta[code].label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t('footer.contact')}</p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="https://wa.me/244952378216"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  🇦🇴 Angola — +244 952 378 216
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/242065342402"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  🇨🇬 Congo — +242 06 534 24 02
                </a>
              </li>
              <li>
                <a
                  href="mailto:overlinedigitall@gmail.com"
                  className="flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  overlinedigitall@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>🇨🇬 🇦🇴</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OverLine Digital. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/politique-confidentialite"
              className="text-xs text-primary transition-colors hover:brightness-110"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="/conditions-utilisation"
              className="text-xs text-primary transition-colors hover:brightness-110"
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
