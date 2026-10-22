'use client'

import { COURSE_CATALOG } from '@/lib/course-catalog'

const Home = () => (
    <section id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-[#10251b] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#a7f3d0_0.65px,transparent_0.65px)] [background-size:24px_24px]" />
        <div aria-hidden="true" className="hero-green-wash pointer-events-none absolute -right-44 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full opacity-90 lg:right-[4%]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 left-[14%] h-[30rem] w-[30rem] rounded-full bg-emerald-800/25 blur-[110px]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-emerald-300/50 to-transparent lg:block" />

        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:gap-8 lg:px-10 lg:py-16">
            <div className="relative z-10 max-w-3xl">
                <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-200/15 bg-white/[0.04] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-100/90 sm:text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                    Tech Trailblazer Academy
                </p>

                <h1 id="hero-title" className="text-[clamp(2.65rem,6vw,5.5rem)] font-semibold leading-[0.99] tracking-[-0.06em] text-white">
                    <span className="block">Tuition Free Tech</span>
                    <span className="hero-headline-accent block">Scholarships — Start</span>
                    <span className="block">Your Career Today</span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-50/75 sm:mt-7 sm:text-lg sm:leading-8">
                    Launch your career in tech with up to <strong className="font-semibold text-white">₦0 tuition</strong>. Learn from expert tutors, gain hands-on experience, and get mentorship to guide your journey.
                </p>

                <ul className="mt-6 grid gap-3 text-sm text-emerald-50/85 sm:text-base">
                    {[
                        'Beginner Friendly — No prior experience required',
                        'Flexible Learning — Online, Physical, or Hybrid',
                        'Internship & Job Placement Support',
                    ].map((benefit) => (
                        <li key={benefit} className="flex items-start gap-3">
                            <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row min-[430px]:items-center">
                    <a
                        href="#contact"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 text-sm font-semibold text-emerald-950 shadow-[0_8px_24px_rgba(4,120,87,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_12px_30px_rgba(4,120,87,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 motion-reduce:transform-none"
                    >
                        Explore Courses
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                    </a>
                    <a href="#contact" className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold text-emerald-100/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200">
                        Apply
                    </a>
                </div>
            </div>

            <aside aria-label={`${COURSE_CATALOG.length} available learning paths`} className="pointer-events-none absolute right-0 top-1/2 z-0 w-[310px] -translate-y-1/2 translate-x-[54%] opacity-50 sm:w-[360px] sm:opacity-60 md:w-[420px] md:opacity-75 lg:pointer-events-auto lg:static lg:z-10 lg:ml-auto lg:w-full lg:max-w-[480px] lg:translate-x-0 lg:opacity-100">
                <div className="hero-orbit-stage" aria-hidden="true">
                    <div className="hero-orbit-glow" />
                    <div className="hero-orbit">
                        <div className="hero-orbit-ring hero-orbit-ring-outer" />
                        <div className="hero-orbit-ring hero-orbit-ring-inner" />
                        <div className="premium-orbit-core">
                            <div className="premium-orbit-shine" />
                            <div className="premium-orbit-land premium-orbit-land-one" />
                            <div className="premium-orbit-land premium-orbit-land-two" />
                        </div>
                    </div>
                    <span className="hero-orbit-point hero-orbit-point-one" />
                    <span className="hero-orbit-point hero-orbit-point-two" />
                </div>

                <div className="mx-auto mt-2 hidden max-w-sm rounded-2xl border border-white/15 bg-white/[0.06] p-4 shadow-[0_12px_32px_-20px_rgba(0,0,0,0.45)] backdrop-blur-sm lg:block">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-200">Your next chapter</p>
                            <p className="mt-1 truncate text-sm font-semibold tracking-tight text-white">Skills to move you forward</p>
                        </div>
                        <span className="shrink-0 text-xl font-semibold tracking-tight text-emerald-300">
                            {COURSE_CATALOG.length}<span className="ml-1 text-xs font-medium text-emerald-50/65">paths</span>
                        </span>
                    </div>
                    <div className="mt-3 flex gap-1.5" aria-hidden="true">
                        <span className="h-1 flex-1 rounded-full bg-emerald-300" />
                        <span className="h-1 flex-1 rounded-full bg-emerald-300/50" />
                        <span className="h-1 flex-1 rounded-full bg-emerald-300/25" />
                        <span className="h-1 flex-1 rounded-full bg-white/15" />
                    </div>
                </div>
            </aside>
        </div>
    </section>
)

export default Home
