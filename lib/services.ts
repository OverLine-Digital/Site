import {
  Globe,
  Smartphone,
  Monitor,
  Code2,
  AtSign,
  Link2,
  Mail,
  Palette,
  Share2,
  Bot,
  Megaphone,
  ShieldCheck,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'

export type DurationOption = {
  label: string
  weeks: number
  price: number
  recommended?: boolean
}

export type Service = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  durations: DurationOption[]
  comingSoon?: boolean
}

export type ServiceCategory = {
  id: string
  name: string
  services: Service[]
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'development',
    name: 'Development',
    services: [
      {
        id: 'website-development',
        name: 'Website Development',
        description:
          'High-performance, SEO-optimized websites engineered to convert visitors into customers.',
        icon: Globe,
        durations: [
          { label: '1 Week', weeks: 1, price: 450 },
          { label: '2 Weeks', weeks: 2, price: 750 },
          { label: '3 Weeks', weeks: 3, price: 1100, recommended: true },
          { label: '4 Weeks', weeks: 4, price: 1500 },
        ],
      },
      {
        id: 'mobile-applications',
        name: 'Mobile Applications',
        description:
          'Native-quality iOS and Android applications built for scale, speed and beautiful UX.',
        icon: Smartphone,
        durations: [
          { label: '2 Weeks', weeks: 2, price: 900 },
          { label: '4 Weeks', weeks: 4, price: 1800, recommended: true },
          { label: '6 Weeks', weeks: 6, price: 2600 },
          { label: '8 Weeks', weeks: 8, price: 3400 },
        ],
      },
      {
        id: 'desktop-software',
        name: 'Desktop Software',
        description:
          'Robust cross-platform desktop software tailored to your business operations.',
        icon: Monitor,
        durations: [
          { label: '2 Weeks', weeks: 2, price: 1000 },
          { label: '4 Weeks', weeks: 4, price: 1900, recommended: true },
          { label: '6 Weeks', weeks: 6, price: 2800 },
          { label: '8 Weeks', weeks: 8, price: 3600 },
        ],
      },
      {
        id: 'source-code-marketplace',
        name: 'Source Code Marketplace',
        description:
          'Production-ready source code, templates and starter kits to launch faster.',
        icon: Code2,
        durations: [
          { label: 'Instant', weeks: 0, price: 150 },
          { label: '1 Week (Customized)', weeks: 1, price: 350, recommended: true },
          { label: '2 Weeks (Extended)', weeks: 2, price: 600 },
        ],
      },
    ],
  },
  {
    id: 'digital-identity',
    name: 'Digital Identity',
    services: [
      {
        id: 'domain-registration',
        name: 'Domain Registration',
        description:
          'Secure the perfect domain for your brand with full DNS management included.',
        icon: AtSign,
        durations: [
          { label: '24 Hours', weeks: 0, price: 25, recommended: true },
          { label: '1 Week (Premium Search)', weeks: 1, price: 80 },
        ],
        comingSoon: true,
      },
      {
        id: 'subdomains',
        name: 'Subdomains',
        description:
          'Structured subdomain architecture for products, regions and internal tools.',
        icon: Link2,
        durations: [
          { label: '24 Hours', weeks: 0, price: 15, recommended: true },
          { label: '3 Days (With Routing)', weeks: 0, price: 40 },
        ],
      },
      {
        id: 'professional-email',
        name: 'Professional Email',
        description:
          'Branded email addresses with enterprise-grade deliverability and security.',
        icon: Mail,
        durations: [
          { label: '24 Hours', weeks: 0, price: 30, recommended: true },
          { label: '1 Week (Full Migration)', weeks: 1, price: 120 },
        ],
      },
    ],
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    services: [
      {
        id: 'graphic-design',
        name: 'Graphic Design',
        description:
          'Logos, brand identities and marketing visuals crafted with precision and taste.',
        icon: Palette,
        durations: [
          { label: '3 Days', weeks: 0, price: 120 },
          { label: '1 Week', weeks: 1, price: 250, recommended: true },
          { label: '2 Weeks (Full Identity)', weeks: 2, price: 500 },
        ],
      },
    ],
  },
  {
    id: 'social-media',
    name: 'Social Media',
    services: [
      {
        id: 'social-media-management',
        name: 'Social Media Management',
        description:
          'Strategy, content and community management that grows your audience every month.',
        icon: Share2,
        durations: [
          { label: '2 Weeks', weeks: 2, price: 200 },
          { label: '1 Month', weeks: 4, price: 350, recommended: true },
          { label: '3 Months', weeks: 12, price: 900 },
        ],
      },
    ],
  },
  {
    id: 'artificial-intelligence',
    name: 'Artificial Intelligence',
    services: [
      {
        id: 'virtual-ai-assistant',
        name: 'Virtual AI Assistant',
        description:
          'Custom AI assistants that answer customers, qualify leads and work 24/7 for you.',
        icon: Bot,
        durations: [
          { label: '1 Week', weeks: 1, price: 400 },
          { label: '2 Weeks', weeks: 2, price: 700, recommended: true },
          { label: '4 Weeks (Advanced)', weeks: 4, price: 1300 },
        ],
      },
    ],
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    services: [
      {
        id: 'digital-marketing-service',
        name: 'Digital Marketing',
        description:
          'Data-driven campaigns across search and social that deliver measurable growth.',
        icon: Megaphone,
        durations: [
          { label: '2 Weeks', weeks: 2, price: 250 },
          { label: '1 Month', weeks: 4, price: 450, recommended: true },
          { label: '3 Months', weeks: 12, price: 1200 },
        ],
      },
    ],
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    services: [
      {
        id: 'cybersecurity-agent',
        name: 'Cybersecurity Agent',
        description:
          'Continuous monitoring and threat detection protecting your digital infrastructure.',
        icon: ShieldCheck,
        durations: [
          { label: '1 Week (Setup)', weeks: 1, price: 500 },
          { label: '1 Month', weeks: 4, price: 900, recommended: true },
          { label: '3 Months', weeks: 12, price: 2400 },
        ],
      },
      {
        id: 'cybersecurity-consulting',
        name: 'Cybersecurity Consulting',
        description:
          'Expert audits, hardening plans and compliance guidance from senior specialists.',
        icon: ShieldAlert,
        durations: [
          { label: '1 Week', weeks: 1, price: 400 },
          { label: '2 Weeks', weeks: 2, price: 700, recommended: true },
          { label: '4 Weeks (Full Audit)', weeks: 4, price: 1300 },
        ],
      },
    ],
  },
]

export const allServices: Service[] = serviceCategories.flatMap((c) => c.services)

export function formatPrice(price: number) {
  return `$${price.toLocaleString('en-US')}`
}

export function estimatedDelivery(weeks: number) {
  const date = new Date()
  date.setDate(date.getDate() + (weeks === 0 ? 2 : weeks * 7))
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
