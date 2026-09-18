'use client'

import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Services } from '@/components/services'
import { Solutions } from '@/components/solutions'
import { DashboardPreview } from '@/components/dashboard-preview'
import { Trust } from '@/components/trust'
import { Partnership } from '@/components/partnership'
import { Faq } from '@/components/faq'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import type { Service } from '@/lib/services'

export default function Home() {
  const router = useRouter()

  // "Demande un projet" n'ouvre plus une modal : redirection directe
  // vers la page dédiée /demande-projet (avec le service présélectionné
  // via ?service=... quand on clique depuis une carte de service précise).
  const goToRequest = (service: Service | null) => {
    router.push(service ? `/demande-projet?service=${service.id}` : '/demande-projet')
  }

  return (
    <>
      <Navbar onStartProject={() => goToRequest(null)} />
      <main>
        <Hero onStartProject={() => goToRequest(null)} />
        <About />
        <Services onRequestService={(s) => goToRequest(s)} />
        <Solutions onCustom={() => goToRequest(null)} />
        <DashboardPreview />
        <Trust />
        <Partnership />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
