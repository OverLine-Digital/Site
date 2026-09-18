'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Menu, X, Globe, Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import { useTheme } from '@/lib/theme-context'
import { langMeta, type Lang } from '@/lib/i18n'

export function Navbar({ onStartProject }: { onStartProject: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const { lang, setLang, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()

  const navLinks = [
    { label: t('nav.about'), href: '#about' },
    { label: t('nav.dashboard'), href: '#dashboard' },
    { label: t('nav.services'), href: '#services' },
    { label: t('nav.partnership'), href: '#partnership' },
    { label: t('nav.contact'), href: '#contact' },
  ]

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileOpen(false)
    window.setTimeout(() => {
      const target = document.querySelector(href)
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 320)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-5 px-6 py-1.5 text-xs text-muted-foreground lg:px-8">
        <a href="/admin/login" className="transition-colors hover:text-foreground">
          {t('nav.login')}
        </a>
        <a href="#contact" className="transition-colors hover:text-foreground">
          {t('nav.support')}
        </a>
      </div>

      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a12] p-1.5">
            <Image src="/images/logo-icon.png" alt="OverLine Digital" width={28} height={28} className="h-full w-full object-contain" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            OverLine <span className="text-muted-foreground">Digital</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('theme.light') : t('theme.dark')}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:border-primary/40 md:flex"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Language selector */}
          <div className="relative hidden md:block" ref={langRef}>
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40"
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span>{langMeta[lang].flag}</span>
              <span className="hidden lg:inline">{langMeta[lang].label}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.ul
                  role="listbox"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-strong absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl p-1.5"
                >
                  {(Object.keys(langMeta) as Lang[]).map((code) => (
                    <li key={code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={code === lang}
                        onClick={() => {
                          setLang(code)
                          setLangOpen(false)
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary ${
                          code === lang ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        <span>{langMeta[code].flag}</span>
                        {langMeta[code].label}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <a
            href="/track"
            className="hidden rounded-full border border-primary/40 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 md:inline-flex"
          >
            {t('nav.track')}
          </a>

          <button
            type="button"
            onClick={onStartProject}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-blue"
          >
            {t('nav.cta')}
          </button>

          <button
            type="button"
            className="rounded-lg bg-secondary p-2 text-foreground md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-strong overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleMobileNavClick(e, link.href)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/track"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-full border border-primary/40 px-4 py-2.5 text-center text-sm font-medium text-primary"
              >
                {t('nav.track')}
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false)
                  onStartProject()
                }}
                className="rounded-full bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
              >
                {t('nav.cta')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
