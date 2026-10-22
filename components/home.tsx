'use client'

import { COURSE_CATALOG } from '@/lib/course-catalog'

const Home = () => (
    <section
        id="home"
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden bg-[#f8faf8]"
    >
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[48%] bg-gradient-to-br from-emerald-50 via-[#f0f5f1] to-white lg:block" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[48%] opacity-30 lg:block landing-grid-pattern" />
        <div aria-hidden="true" className="hero-green-wash pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full lg:right-[4%] lg:top-1/2 lg:-translate-y-1/2" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[1.06fr_0.94fr] lg:gap-12 lg:px-10 lg:py-16">
            <div className="relative z-10 max-w-2xl">
                <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-emerald-800/10 bg-white/80 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-900 shadow-sm sm:text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
                    Education that works
                </div>

                <h1
                    id="hero-title"
                    className="text-[clamp(3.25rem,6.2vw,5.75rem)] font-semibold leading-[0.94] tracking-[-0.065em] text-slate-950"
                >
                    <span className="block">LEARN.</span>
                    <span className="block">GROW.</span>
                    <span className="hero-headline-accent mt-1 block text-emerald-800">SUCCEED.</span>
                </h1>

                <p className="mt-7 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                    Learn from industry experts and gain the skills to advance your career.
                </p>

                <div className="mt-9 flex flex-col gap-3 min-[430px]:flex-row">
                    <a
                        href="#contact"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-900 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 motion-reduce:transform-none"
                    >
                        Start your application
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                    </a>
                    <a
                        href="#application-process"
                        className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
                    >
                        See how it works
                    </a>
                </div>

                <p className="mt-5 text-xs text-slate-500">
                    Choose a course that fits your goals. We&apos;ll guide you through the next steps.
                </p>
            </div>

            <aside aria-label="A glimpse of the Tech Trailblazer learning experience" className="pointer-events-none absolute right-0 top-36 z-0 w-[310px] translate-x-[54%] opacity-45 sm:top-28 sm:w-[360px] sm:opacity-60 md:w-[420px] md:opacity-75 lg:pointer-events-auto lg:static lg:z-10 lg:ml-auto lg:w-full lg:max-w-xl lg:translate-x-0 lg:opacity-100">
                <div className="hero-orbit-stage" aria-hidden="true">
                    <div className="hero-orbit-glow" />
                    <div className="hero-orbit">
                        <div className="hero-orbit-ring hero-orbit-ring-outer" />
                        <div className="hero-orbit-ring hero-orbit-ring-inner" />
                        <div className="hero-orbit-sphere">
                            <div className="hero-orbit-sphere-shine" />
                            <div className="hero-orbit-sphere-continent hero-orbit-continent-one" />
                            <div className="hero-orbit-sphere-continent hero-orbit-continent-two" />
                        </div>
                    </div>
                    <span className="hero-orbit-point hero-orbit-point-one" />
                    <span className="hero-orbit-point hero-orbit-point-two" />
                </div>

                <div className="hero-orbit-caption mx-auto mt-2 hidden max-w-sm rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.24)] backdrop-blur-sm lg:block">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-800">Your next chapter</p>
                            <p className="mt-1 truncate text-sm font-semibold tracking-tight text-slate-900">Skills to move you forward</p>
                        </div>
                        <span className="shrink-0 text-xl font-semibold tracking-tight text-emerald-800">{COURSE_CATALOG.length}<span className="ml-1 text-xs font-medium text-slate-500">paths</span></span>
                    </div>
                    <div className="mt-3 flex gap-1.5" aria-hidden="true">
                        <span className="h-1 flex-1 rounded-full bg-emerald-700" />
                        <span className="h-1 flex-1 rounded-full bg-emerald-600/50" />
                        <span className="h-1 flex-1 rounded-full bg-emerald-500/25" />
                        <span className="h-1 flex-1 rounded-full bg-slate-200" />
                    </div>
                </div>
            </aside>
        </div>
    </section>
)

export default Home
