'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Star,
  UploadCloud,
  X,
} from 'lucide-react'
import { allServices, type Service, type DurationOption } from '@/lib/services'
import {
  validateFullName,
  validateEmail,
  validateLocalPhone,
  validateWhatsapp,
  validateDescription,
  validateRequired,
} from '@/lib/validation'
import { africanCountries, defaultCountry, type AfricanCountry } from '@/lib/african-countries'
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon'
import { formatLocalPhone } from '@/lib/phone-format'

// Services pour lesquels l'étape "Fichiers joints" est proposée.
const FILE_UPLOAD_SERVICE_IDS = ['website-development', 'mobile-applications', 'desktop-software']
// Services pour lesquels un délai a du sens.
const TIMED_SERVICE_IDS = ['website-development', 'mobile-applications', 'desktop-software', 'source-code-marketplace']

const establishmentTypes = [
  'Hôtel', 'École', 'Supermarché', 'Garage', 'Hôpital', 'Entreprise',
  'E-commerce', 'Personnel / Commerçant', 'Restaurant', 'ONG', 'Autre',
]

const WHATSAPP_NUMBER = '244952378216'

const ALL_STEP_KEYS = ['service', 'delai', 'projet', 'fichiers', 'coordonnees', 'resume'] as const
type StepKey = (typeof ALL_STEP_KEYS)[number]

const STEP_TITLES: Record<StepKey, string> = {
  service: 'Choix du service',
  delai: 'Délai',
  projet: 'Description du projet',
  fichiers: 'Exemple / schéma du projet',
  coordonnees: 'Coordonnées',
  resume: 'Résumé',
}

type CustomerInfo = {
  fullName: string
  company: string
  email: string
  phone: string
  whatsapp: string
}

const emptyCustomer: CustomerInfo = {
  fullName: '', company: '', email: '', phone: '', whatsapp: '',
}

const inputClass =
  'w-full rounded-xl border border-input bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40 transition-colors'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo — doit correspondre à la limite du bucket Supabase
const MAX_FILES_PER_ZONE = 10
const DOC_ACCEPT = '.pdf,.doc,.docx'
const DOC_AND_IMAGE_ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg'

type UploadedFile = {
  name: string
  path: string
  uploading?: boolean
  error?: string
}

function makeUploadSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function DemandeProjetContent() {
  const searchParams = useSearchParams()

  const [stepIndex, setStepIndex] = useState(0)
  const [service, setService] = useState<Service | null>(null)
  const [sector, setSector] = useState('')
  const [duration, setDuration] = useState<DurationOption | null>(null)
  const [customTimeline, setCustomTimeline] = useState(false)
  const [description, setDescription] = useState('')
  const [exampleFiles, setExampleFiles] = useState<UploadedFile[]>([])
  const [docFiles, setDocFiles] = useState<UploadedFile[]>([])
  const [uploadSessionId] = useState(makeUploadSessionId)
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer)
  // Honeypot anti-bot : champ caché visuellement (voir le <input> plus bas)
  // qu'aucun humain ne peut remplir, mais que les bots de spam remplissent
  // presque toujours en soumettant le formulaire automatiquement. Si non vide,
  // le serveur ignore silencieusement la demande (voir api/project-request).
  const [website, setWebsite] = useState('')
  const [phoneCountry, setPhoneCountry] = useState<AfricanCountry>(defaultCountry)
  const [countryPickerOpen, setCountryPickerOpen] = useState(false)
  // Pays du projet/entreprise — DISTINCT du pays du numéro de téléphone
  // ci-dessus. Un client de la diaspora peut avoir un numéro d'un pays et un
  // projet basé dans un autre : les deux sélecteurs sont indépendants.
  const [businessCountry, setBusinessCountry] = useState<AfricanCountry | null>(null)
  const [businessCountryPickerOpen, setBusinessCountryPickerOpen] = useState(false)
  const [confirmAccepted, setConfirmAccepted] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Envoi des fichiers via la route serveur /api/upload-file (limite de
  // débit + validation), plus un upload direct client → Supabase Storage
  // (l'ancienne policy publique qui le permettait a été révoquée).
  async function uploadFilesToZone(
    fileList: FileList,
    folder: 'schema' | 'documents',
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
    currentCount: number,
  ) {
    const selected = Array.from(fileList).slice(0, Math.max(0, MAX_FILES_PER_ZONE - currentCount))
    if (selected.length === 0) return

    for (const file of selected) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setter((prev) => [...prev, { name: file.name, path: '', error: 'Fichier trop volumineux (max 10 Mo).' }])
        continue
      }
      const entry: UploadedFile = { name: file.name, path: '', uploading: true }
      setter((prev) => [...prev, entry])

      const body = new FormData()
      body.append('file', file)
      body.append('folder', folder)
      body.append('sessionId', uploadSessionId)

      try {
        const res = await fetch('/api/upload-file', { method: 'POST', body })
        if (!res.ok) throw new Error('upload failed')
        const data = await res.json()
        setter((prev) => prev.map((f) => (f === entry ? { name: file.name, path: data.path } : f)))
      } catch {
        setter((prev) =>
          prev.map((f) => (f === entry ? { name: file.name, path: '', error: "Échec de l'envoi, réessayez." } : f)),
        )
      }
    }
  }

  function removeUploadedFile(index: number, setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  // Présélection du service via ?service=xxx
  useEffect(() => {
    const preselected = searchParams.get('service')
    if (preselected) {
      const match = allServices.find((s) => s.id === preselected)
      if (match) setService(match)
    }
  }, [searchParams])

  const hasTimeline = service ? TIMED_SERVICE_IDS.includes(service.id) : false
  const showFiles = service ? FILE_UPLOAD_SERVICE_IDS.includes(service.id) : false
  const isWebsite = service?.id === 'website-development'
  const isAppOrSoftware = service?.id === 'mobile-applications' || service?.id === 'desktop-software'
  const isSourceCode = service?.id === 'source-code-marketplace'

  const visibleSteps: StepKey[] = ALL_STEP_KEYS.filter((k) => k !== 'fichiers' || showFiles)
  const step = visibleSteps[Math.min(stepIndex, visibleSteps.length - 1)]
  const progressPercent = Math.round(((stepIndex + 1) / visibleSteps.length) * 100)

  // On ne nettoie plus la saisie avant de valider : si l'utilisateur tape des
  // lettres, elles doivent être détectées et rejetées, pas supprimées en silence.
  const fullPhone = `${phoneCountry.dial}${customer.phone.replace(/[\s().-]/g, '')}`
  const fieldErrors = {
    fullName: validateFullName(customer.fullName),
    email: validateEmail(customer.email),
    phone: validateLocalPhone(customer.phone, phoneCountry.digits, phoneCountry),
    whatsapp: validateWhatsapp(customer.whatsapp),
    businessCountry: businessCountry === null ? 'Sélectionnez le pays de votre projet.' : null,
  }
  const descriptionError = validateDescription(description, 50)

  useEffect(() => {
    if (!service) return
    if (isSourceCode) {
      setDuration({ label: 'Maximum 1 an (incertain)', weeks: 52 })
    } else if (!hasTimeline) {
      setDuration(null)
    }
  }, [service, isSourceCode, hasTimeline])

  const canNext = () => {
    switch (step) {
      case 'service':
        return service !== null && sector !== ''
      case 'delai':
        return hasTimeline ? duration !== null : true
      case 'projet':
        return descriptionError === null
      case 'fichiers':
        return true
      case 'coordonnees':
        return (
          fieldErrors.fullName === null &&
          fieldErrors.email === null &&
          fieldErrors.phone === null &&
          fieldErrors.whatsapp === null &&
          fieldErrors.businessCountry === null
        )
      default:
        return true
    }
  }

  function goNext() {
    if (!canNext()) {
      setTouched((p) => ({ ...p, fullName: true, email: true, phone: true, whatsapp: true, description: true, sector: true }))
      return
    }
    setStepIndex((s) => Math.min(visibleSteps.length - 1, s + 1))
  }

  function goBack() {
    setStepIndex((s) => Math.max(0, s - 1))
  }

  async function handleSubmit() {
    if (!service || !confirmAccepted || !privacyAccepted || !canNext()) {
      setTouched((p) => ({ ...p, confirm: true, privacy: true }))
      return
    }
    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/project-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          durationLabel: duration?.label ?? null,
          durationWeeks: duration?.weeks ?? null,
          requestType: sector || null,
          description,
          files: docFiles.filter((f) => f.path).map((f) => f.path),
          exampleFiles: showFiles ? exampleFiles.filter((f) => f.path).map((f) => f.path) : [],
          fullName: customer.fullName,
          company: customer.company,
          email: customer.email,
          phone: fullPhone,
          whatsapp: customer.whatsapp,
          country: businessCountry ? `${businessCountry.flag} ${businessCountry.name}` : null,
          website, // honeypot — doit rester vide (voir state plus haut)
        }),
      })

      const data = await res.json()
      setSubmitting(false)

      if (!res.ok) {
        setSubmitError(data.errorKey ?? 'Une erreur est survenue, merci de réessayer.')
        return
      }
      setProjectId(data.projectId)
      setSubmitted(true)
    } catch {
      setSubmitting(false)
      setSubmitError('Impossible de contacter le serveur. Vérifiez votre connexion.')
    }
  }

  function copyId() {
    if (!projectId) return
    navigator.clipboard?.writeText(projectId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const whatsappHref = projectId
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Bonjour OverLine Digital, je viens de faire une demande de projet (référence ${projectId}). J'aimerais avoir un premier retour, merci !`
      )}`
    : `https://wa.me/${WHATSAPP_NUMBER}`

  // ---------------------------------------------------------------------
  // Écran de confirmation (après envoi)
  // ---------------------------------------------------------------------
  if (submitted && projectId) {
    const timelineSteps = [
      { title: 'Demande reçue', desc: 'Votre projet est enregistré dans notre système.' },
      { title: 'Étude du projet', desc: 'Notre équipe analyse vos besoins, vos objectifs et les informations transmises.' },
      { title: 'Prise de contact', desc: 'Nous vous contactons si nous avons besoin de précisions supplémentaires.' },
      { title: 'Proposition', desc: 'Nous préparons une proposition adaptée à votre projet : solution, fonctionnalités, délai et budget.' },
      { title: 'Validation', desc: 'Vous examinez la proposition et confirmez si vous souhaitez poursuivre.' },
      { title: 'Développement', desc: 'Une fois le projet validé, notre équipe commence sa réalisation selon les conditions convenues.' },
    ]

    return (
      <main className="mx-auto min-h-screen max-w-xl px-5 py-14">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 glow-blue"
          >
            <Check className="h-7 w-7 text-primary" />
          </motion.span>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-primary">
            Demande confirmée
          </p>
          <h1 className="mb-3 font-voice text-2xl font-semibold text-foreground">
            Merci pour votre confiance.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Votre projet vient d&rsquo;être transmis à OverLine Digital. Notre équipe va maintenant
            examiner votre demande afin de comprendre précisément vos besoins et de préparer la
            meilleure approche pour votre projet.
          </p>
        </div>

        {/* Référence + copier */}
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/8 px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Votre référence
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="font-mono text-lg font-semibold text-primary">{projectId}</p>
            <button
              type="button"
              onClick={copyId}
              aria-label="Copier la référence"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary/40"
            >
              {copied ? (
                <>
                  <CheckCheck className="h-3.5 w-3.5 text-primary" /> Copié !
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copier
                </>
              )}
            </button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Conservez cette référence. Elle vous permettra de suivre l&rsquo;évolution de votre
            demande à tout moment.
          </p>
        </div>

        {/* Timeline verticale */}
        <div className="mt-8">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Que se passe-t-il maintenant ?
          </p>
          <ol className="flex flex-col gap-0">
            {timelineSteps.map((s, i) => {
              const state = i === 0 ? 'done' : i === 1 ? 'current' : 'future'
              return (
                <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < timelineSteps.length - 1 && (
                    <span
                      className={`absolute left-[15px] top-8 h-full w-px ${
                        state === 'done' ? 'bg-primary/50' : 'bg-border'
                      }`}
                    />
                  )}
                  <span
                    className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${
                      state === 'done'
                        ? 'bg-primary text-primary-foreground'
                        : state === 'current'
                          ? 'border-2 border-primary bg-primary/15 text-primary'
                          : 'border border-border bg-secondary text-muted-foreground'
                    }`}
                  >
                    {state === 'done' ? <Check className="h-4 w-4" /> : String(i + 1).padStart(2, '0')}
                  </span>
                  <div className={state === 'future' ? 'opacity-50' : ''}>
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Prochaine étape */}
        <div className="mt-2 rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
          <p className="text-xs leading-relaxed text-foreground">
            📩 <span className="font-medium">Prochaine étape</span> — Vous recevrez notre retour
            sous 24 à 48h par WhatsApp ou par e-mail.
          </p>
          <p className="mt-1.5 text-xs italic leading-relaxed text-muted-foreground">
            Aucune réalisation ne commence avant votre validation.
          </p>
        </div>

        <Link
          href={`/track?id=${encodeURIComponent(projectId)}`}
          className="mt-6 flex items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-blue"
        >
          Suivre mon projet <ChevronRight className="h-4 w-4" />
        </Link>

        <div className="mt-10 rounded-2xl border border-border bg-card px-5 py-5 text-center">
          <p className="text-sm font-medium text-foreground">
            Une question concernant votre projet ?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Notre équipe est disponible pour vous accompagner.
          </p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40"
          >
            <WhatsAppIcon className="h-4 w-4 text-primary" /> Contacter OverLine Digital
          </a>
        </div>

        <Link href="/" className="mt-8 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&rsquo;accueil
        </Link>
      </main>
    )
  }

  // ---------------------------------------------------------------------
  // Formulaire multi-étapes
  // ---------------------------------------------------------------------
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/12">
            <Image src="/images/logo-icon.png" alt="OverLine Digital" width={20} height={20} className="h-full w-full object-contain" />
          </span>
          <span className="font-voice text-sm font-semibold text-foreground">OverLine Digital</span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour à l&rsquo;accueil
        </Link>
      </div>

      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Demande de projet &gt; {STEP_TITLES[step]}
      </p>
      <h1 className="mb-6 font-voice text-xl font-semibold text-foreground">{STEP_TITLES[step]}</h1>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-1.5 text-right text-[11px] text-muted-foreground">{progressPercent}%</p>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="glass-strong rounded-3xl p-6"
        >
          {/* Étape 1 : Service + Secteur */}
          {step === 'service' && (
            <div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {allServices.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setService(s)
                      setDuration(null)
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      service?.id === s.id
                        ? 'border-primary/60 bg-primary/10'
                        : 'border-border bg-secondary/50 hover:border-primary/30'
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/12">
                      <s.icon className="h-4 w-4 text-primary" />
                    </span>
                    <span className="text-sm text-foreground">{s.name}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <label htmlFor="field-sector" className="mb-1.5 block text-xs text-muted-foreground">
                  Secteur du service (hôtel, école, restaurant…) *
                </label>
                <select
                  id="field-sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, sector: true }))}
                  className={`${inputClass} ${touched.sector && !sector ? 'border-red-400/60' : ''}`}
                >
                  <option value="">Sélectionner…</option>
                  {establishmentTypes.map((et) => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
                {touched.sector && !sector && (
                  <p className="mt-1 text-xs text-red-400">Le secteur est obligatoire.</p>
                )}
              </div>
            </div>
          )}

          {/* Étape 2 : Délai */}
          {step === 'delai' && service && isWebsite && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Choisissez un délai pour <span className="text-foreground">{service.name}</span>.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => { setCustomTimeline(false); setDuration({ label: 'Maximum 4 mois', weeks: 17 }) }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    !customTimeline && duration?.label === 'Maximum 4 mois'
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border bg-secondary/50 hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">Maximum 4 mois</p>
                  <p className="mt-1 text-xs text-muted-foreground">Délai standard, sans supplément</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomTimeline(true); setDuration(null) }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    customTimeline
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border bg-secondary/50 hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">Date personnalisée</p>
                  <p className="mt-1 text-xs text-muted-foreground">Choisissez un délai plus court</p>
                </button>
              </div>
              {customTimeline && (
                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { label: '2 semaines', weeks: 2, premium: false },
                    { label: '3 semaines', weeks: 3, premium: false },
                    { label: '4 semaines', weeks: 4, premium: false },
                    { label: '1 semaine', weeks: 1, premium: true },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setDuration({ label: opt.label, weeks: opt.weeks })}
                      className={`relative rounded-xl border p-3 text-center text-xs transition-all ${
                        duration?.label === opt.label
                          ? 'border-primary/60 bg-primary/10 text-foreground'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {opt.premium && (
                        <span className="absolute -top-2 right-1.5 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
                          <Star className="h-2 w-2 fill-current" /> Premium
                        </span>
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'delai' && service && isAppOrSoftware && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Choisissez un délai pour <span className="text-foreground">{service.name}</span>.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => { setCustomTimeline(false); setDuration({ label: 'Maximum 1 an', weeks: 52 }) }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    !customTimeline && duration?.label === 'Maximum 1 an'
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border bg-secondary/50 hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">Maximum 1 an</p>
                  <p className="mt-1 text-xs text-muted-foreground">Délai standard, sans supplément</p>
                </button>
                <button
                  type="button"
                  onClick={() => { setCustomTimeline(true); setDuration(null) }}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    customTimeline
                      ? 'border-primary/60 bg-primary/10'
                      : 'border-border bg-secondary/50 hover:border-primary/30'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">Date personnalisée (Premium)</p>
                  <p className="mt-1 text-xs text-muted-foreground">Livraison accélérée</p>
                </button>
              </div>
              {customTimeline && (
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {[
                    { label: '1 mois', weeks: 4 },
                    { label: '4 mois', weeks: 17 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setDuration({ label: opt.label, weeks: opt.weeks })}
                      className={`relative rounded-xl border p-3 text-center text-xs transition-all ${
                        duration?.label === opt.label
                          ? 'border-primary/60 bg-primary/10 text-foreground'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      <span className="absolute -top-2 right-1.5 flex items-center gap-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground">
                        <Star className="h-2 w-2 fill-current" /> Premium
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'delai' && service && isSourceCode && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Délai pour <span className="text-foreground">{service.name}</span>.
              </p>
              <div className="rounded-xl border border-border bg-secondary/50 p-4">
                <p className="text-sm font-medium text-foreground">Maximum 1 an</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ce délai est incertain, car il dépend de votre demande personnalisée.
                </p>
              </div>
            </div>
          )}

          {step === 'delai' && service && !hasTimeline && (
            <div className="flex flex-col items-center rounded-2xl border border-border bg-secondary/40 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Aucun délai fixe pour ce service</p>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                Votre demande sera enregistrée et notre équipe vous répondra sous un délai minimum
                de 24h et maximum de 48h.
              </p>
            </div>
          )}

          {/* Étape 3 : Description */}
          {step === 'projet' && (
            <div>
              <label htmlFor="project-description" className="mb-2 block text-sm text-muted-foreground">
                Décrivez votre projet, vos objectifs et vos éventuelles références
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, description: true }))}
                rows={8}
                placeholder="Parlez-nous de votre vision, votre public cible, les fonctionnalités clés et tout ce qui nous aidera à comprendre votre projet..."
                className={`${inputClass} resize-none leading-relaxed`}
              />
              <p className={`mt-2 text-xs ${touched.description && descriptionError ? 'text-red-400' : 'text-muted-foreground'}`}>
                {touched.description && descriptionError
                  ? descriptionError
                  : `Minimum 50 caractères · ${description.trim().length} écrits`}
              </p>

              <label
                htmlFor="doc-upload"
                className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <UploadCloud className="mb-2.5 h-6 w-6 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  {showFiles ? 'Joindre un document décrivant votre projet' : 'Joindre un document décrivant votre projet (optionnel)'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {showFiles ? 'PDF, document ou image — optionnel, 10 Mo max' : 'PDF ou document — optionnel, 10 Mo max'}
                </p>
                <input
                  id="doc-upload"
                  type="file"
                  multiple
                  accept={showFiles ? DOC_AND_IMAGE_ACCEPT : DOC_ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length) {
                      uploadFilesToZone(e.target.files, 'documents', setDocFiles, docFiles.length)
                    }
                    e.target.value = ''
                  }}
                />
              </label>
              {docFiles.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {docFiles.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground">
                      <span className="flex min-w-0 items-center gap-2">
                        {f.uploading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
                        <span className="truncate">{f.name}</span>
                        {f.error && <span className="shrink-0 text-xs text-red-400">{f.error}</span>}
                      </span>
                      <button
                        type="button"
                        aria-label={`Retirer ${f.name}`}
                        onClick={() => removeUploadedFile(i, setDocFiles)}
                        className="ml-3 shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Étape 4 : Exemple / schéma du projet (uniquement site / app / logiciel) */}
          {step === 'fichiers' && (
            <div>
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <UploadCloud className="mb-3 h-8 w-8 text-primary" />
                <p className="text-sm font-medium text-foreground">Joindre un exemple, un schéma ou une photo de référence</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, document ou image — optionnel, 10 Mo max par fichier
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept={DOC_AND_IMAGE_ACCEPT}
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length) {
                      uploadFilesToZone(e.target.files, 'schema', setExampleFiles, exampleFiles.length)
                    }
                    e.target.value = ''
                  }}
                />
              </label>
              {exampleFiles.length > 0 && (
                <ul className="mt-4 flex flex-col gap-2">
                  {exampleFiles.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground">
                      <span className="flex min-w-0 items-center gap-2">
                        {f.uploading && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />}
                        <span className="truncate">{f.name}</span>
                        {f.error && <span className="shrink-0 text-xs text-red-400">{f.error}</span>}
                      </span>
                      <button
                        type="button"
                        aria-label={`Retirer ${f.name}`}
                        onClick={() => removeUploadedFile(i, setExampleFiles)}
                        className="ml-3 shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Étape 5 : Coordonnées */}
          {step === 'coordonnees' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="field-fullName" className="mb-1.5 block text-xs text-muted-foreground">Nom complet *</label>
                <input
                  id="field-fullName"
                  type="text"
                  value={customer.fullName}
                  placeholder="Pedro Tepina"
                  onChange={(e) => setCustomer((p) => ({ ...p, fullName: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                  className={`${inputClass} ${touched.fullName && fieldErrors.fullName ? 'border-red-400/60' : ''}`}
                />
                {touched.fullName && fieldErrors.fullName && <p className="mt-1 text-xs text-red-400">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="field-company" className="mb-1.5 block text-xs text-muted-foreground">Entreprise</label>
                <input
                  id="field-company"
                  type="text"
                  value={customer.company}
                  placeholder="Votre entreprise"
                  onChange={(e) => setCustomer((p) => ({ ...p, company: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="field-email" className="mb-1.5 block text-xs text-muted-foreground">Email *</label>
                <input
                  id="field-email"
                  type="email"
                  value={customer.email}
                  placeholder="vous@entreprise.com"
                  onChange={(e) => setCustomer((p) => ({ ...p, email: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                  className={`${inputClass} ${touched.email && fieldErrors.email ? 'border-red-400/60' : ''}`}
                />
                {touched.email && fieldErrors.email && <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="field-business-country" className="mb-1.5 block text-xs text-muted-foreground">
                  Pays du projet / de l&rsquo;entreprise *
                </label>
                <div className="relative">
                  <button
                    id="field-business-country"
                    type="button"
                    onClick={() => setBusinessCountryPickerOpen((v) => !v)}
                    onBlur={() => setTouched((p) => ({ ...p, businessCountry: true }))}
                    className={`flex w-full items-center justify-between rounded-xl border border-input bg-secondary px-3.5 py-2.5 text-sm text-foreground ${
                      touched.businessCountry && fieldErrors.businessCountry ? 'border-red-400/60' : ''
                    }`}
                  >
                    {businessCountry ? (
                      <span className="flex items-center gap-1.5">
                        <span>{businessCountry.flag}</span>
                        <span>{businessCountry.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Sélectionnez un pays</span>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <AnimatePresence>
                    {businessCountryPickerOpen && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="glass-strong absolute left-0 top-full z-10 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl p-1.5"
                      >
                        {africanCountries.map((c) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              onClick={() => {
                                setBusinessCountry(c)
                                setTouched((p) => ({ ...p, businessCountry: true }))
                                setBusinessCountryPickerOpen(false)
                              }}
                              className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-secondary ${
                                businessCountry?.code === c.code ? 'text-primary' : 'text-foreground'
                              }`}
                            >
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
                {touched.businessCountry && fieldErrors.businessCountry && (
                  <p className="mt-1 text-xs text-red-400">{fieldErrors.businessCountry}</p>
                )}
              </div>

              <div>
                <label htmlFor="field-phone" className="mb-1.5 block text-xs text-muted-foreground">Téléphone *</label>
                <div className="flex gap-2">
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setCountryPickerOpen((v) => !v)}
                      className="flex h-full items-center gap-1.5 rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm text-foreground"
                    >
                      {phoneCountry.flag} {phoneCountry.dial}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {countryPickerOpen && (
                        <motion.ul
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="glass-strong absolute left-0 top-full z-10 mt-1.5 max-h-64 w-64 overflow-y-auto rounded-xl p-1.5"
                        >
                          {africanCountries.map((c) => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhoneCountry(c)
                                  setCustomer((p) => ({ ...p, phone: '' }))
                                  setCountryPickerOpen(false)
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-secondary ${
                                  c.code === phoneCountry.code ? 'text-primary' : 'text-foreground'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{c.flag}</span>
                                  <span>{c.name}</span>
                                </span>
                                <span className="text-muted-foreground">{c.dial}</span>
                              </button>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                  <input
                    id="field-phone"
                    type="text"
                    value={customer.phone}
                    placeholder={phoneCountry.example}
                    onChange={(e) =>
                      setCustomer((p) => ({ ...p, phone: formatLocalPhone(e.target.value, phoneCountry.example) }))
                    }
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    className={`${inputClass} ${touched.phone && fieldErrors.phone ? 'border-red-400/60' : ''}`}
                  />
                </div>
                {touched.phone && fieldErrors.phone && <p className="mt-1 text-xs text-red-400">{fieldErrors.phone}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="field-whatsapp" className="mb-1.5 block text-xs text-muted-foreground">WhatsApp *</label>
                <input
                  id="field-whatsapp"
                  type="text"
                  value={customer.whatsapp}
                  placeholder={`${phoneCountry.flag} ${phoneCountry.dial} ${phoneCountry.example}`}
                  onChange={(e) => setCustomer((p) => ({ ...p, whatsapp: e.target.value }))}
                  onBlur={() => setTouched((p) => ({ ...p, whatsapp: true }))}
                  className={`${inputClass} ${touched.whatsapp && fieldErrors.whatsapp ? 'border-red-400/60' : ''}`}
                />
                {touched.whatsapp && fieldErrors.whatsapp && <p className="mt-1 text-xs text-red-400">{fieldErrors.whatsapp}</p>}
              </div>

              {/* Honeypot anti-bot : invisible et inatteignable au clavier pour un
                  humain (absolute + hors écran + tabIndex -1 + aria-hidden), mais
                  présent dans le DOM donc rempli par la plupart des bots de spam
                  qui remplissent tous les <input> automatiquement. */}
              <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="field-website">Site web</label>
                <input
                  id="field-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Étape 6 : Résumé */}
          {step === 'resume' && service && (
            <div className="flex flex-col gap-3">
              {(
                [
                  ['Solution', service.name],
                  ['Secteur', sector || '—'],
                  ...(duration ? [['Délai', duration.label]] : [['Délai', 'Réponse sous 24–48h']]),
                  ['Nom', customer.fullName],
                  ['Pays', businessCountry ? `${businessCountry.flag} ${businessCountry.name}` : '—'],
                  ['Email', customer.email],
                  ['Téléphone', `${phoneCountry.flag} ${phoneCountry.dial} ${customer.phone}`],
                  ['WhatsApp', customer.whatsapp],
                  ...(showFiles ? [['Exemple / schéma', exampleFiles.filter((f) => f.path).length > 0 ? `${exampleFiles.filter((f) => f.path).length} joint(s)` : 'Aucun']] : []),
                  ['Documents', docFiles.filter((f) => f.path).length > 0 ? `${docFiles.filter((f) => f.path).length} joint(s)` : 'Aucun'],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-border bg-secondary/50 px-4 py-3">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
              <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3">
                <p className="mb-1 text-xs text-muted-foreground">Description du projet</p>
                <p className="text-sm leading-relaxed text-foreground">{description}</p>
              </div>

              <label className="mt-2 flex items-start gap-2.5 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={confirmAccepted}
                  onChange={(e) => { setConfirmAccepted(e.target.checked); setTouched((p) => ({ ...p, confirm: true })) }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Je confirme les informations transmises dans cette demande de projet. *
                </span>
              </label>
              {touched.confirm && !confirmAccepted && (
                <p className="text-xs text-red-400">Vous devez confirmer votre demande pour continuer.</p>
              )}

              <label className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => { setPrivacyAccepted(e.target.checked); setTouched((p) => ({ ...p, privacy: true })) }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  J&rsquo;ai lu et j&rsquo;accepte la{' '}
                  <a
                    href="/politique-confidentialite"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary underline"
                  >
                    politique de confidentialité
                  </a>{' '}
                  d&rsquo;OverLine Digital. *
                </span>
              </label>
              {touched.privacy && !privacyAccepted && (
                <p className="text-xs text-red-400">Vous devez accepter la politique de confidentialité pour continuer.</p>
              )}

              {submitError && <p className="text-xs text-red-400">Une erreur est survenue : {submitError}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Retour
        </button>
        {step !== 'resume' ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext()}
            className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 glow-blue"
          >
            Continuer <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !confirmAccepted || !privacyAccepted}
            className="flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 glow-blue disabled:opacity-60"
          >
            {submitting ? 'Envoi…' : 'Envoyer la demande'} <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  )
}

export default function DemandeProjetPage() {
  return (
    <Suspense fallback={null}>
      <DemandeProjetContent />
    </Suspense>
  )
}
