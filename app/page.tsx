'use client'

import { useLayoutEffect, useState } from 'react'
import Home from '@/components/home'
import Benefits from '@/components/benefits'
import ApplicationSteps from '@/components/application-steps'
import Contact, { HeaderNav } from '@/components/contact'
import Join from '@/components/join'
import FAQ from '@/components/faq'
import Footer from '@/components/footer'
import LiveSupport from '@/components/live-support'

export default function HomePage() {
  const [showLoader, setShowLoader] = useState(true)
  const [loaderExiting, setLoaderExiting] = useState(false)

  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousRootOverflow = document.documentElement.style.overflow
    const previousScrollRestoration = window.history.scrollRestoration
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    window.history.scrollRestoration = 'manual'

    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      )
    }
    window.scrollTo(0, 0)

    const exitTimer = window.setTimeout(() => setLoaderExiting(true), 3400)
    const removeTimer = window.setTimeout(() => {
      setShowLoader(false)
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
      window.history.scrollRestoration = previousScrollRestoration
      window.scrollTo(0, 0)
    }, 3750)

    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(removeTimer)
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousRootOverflow
      window.history.scrollRestoration = previousScrollRestoration
    }
  }, [])

  return (
    <>
      <main inert={showLoader} className="landing-page min-w-0 overflow-x-clip bg-white text-slate-950">
        <HeaderNav />
        <Home />
        <ApplicationSteps />
        <Contact />
        <Benefits />
        <FAQ />
        <Join />
        <Footer />
        <LiveSupport />
      </main>
      {showLoader && (
        <div
          role="status"
          aria-label="Loading Tech Trailblazer Academy"
          aria-live="polite"
          className={`landing-intro-loader${loaderExiting ? ' landing-intro-loader-exit' : ''}`}
        >
          <div className="landing-intro-content">
            <p className="landing-intro-kicker">A new way to learn tech</p>
            <div className="landing-intro-mark" aria-hidden="true">TECH</div>
            <p className="landing-intro-name">TECH TRAILBLAZER ACADEMY</p>
            <div
              className="landing-intro-progress"
              role="progressbar"
              aria-label="Loading landing page"
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span />
            </div>
            <p className="landing-intro-caption">We Tech Different</p>
          </div>
        </div>
      )}
    </>
  )
}