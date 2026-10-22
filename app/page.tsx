'use client'

import Home from '@/components/home'
import Benefits from '@/components/benefits'
import ApplicationSteps from '@/components/application-steps'
import Contact, { HeaderNav } from '@/components/contact'
import Join from '@/components/join'
import FAQ from '@/components/faq'
import Footer from '@/components/footer'

export default function HomePage() {
  return (
    <main className="landing-page min-w-0 overflow-x-clip bg-white text-slate-950">
      <HeaderNav />
      <Home />
      <ApplicationSteps />
      <Contact />
      <Benefits />
      <FAQ />
      <Join />
      <Footer />
    </main>
  )
}