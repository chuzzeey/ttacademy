'use client'

const heroSpiralPath = Array.from({ length: 361 }, (_, index) => {
    const progress = index / 360
    const angle = -Math.PI * 4 + progress * Math.PI * 8
    const latitude = (progress - 0.5) * Math.PI * 0.84
    const x = 1080 + 285 * Math.cos(latitude) * Math.cos(angle)
    const y = 450 + 205 * Math.sin(latitude)

    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
}).join(' ')

const Home = () => {
    return (
        <section id="hero" className="relative overflow-hidden bg-[#10251b] text-white">
            <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#a7f3d0_0.65px,transparent_0.65px)] [background-size:24px_24px]" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-emerald-500/15 blur-[110px]" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-64 left-[20%] h-[30rem] w-[30rem] rounded-full bg-emerald-800/30 blur-[100px]" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-gradient-to-b from-transparent via-emerald-300/60 to-transparent lg:block" aria-hidden="true" />
            <svg
                className="hero-orbit-artwork pointer-events-none absolute inset-0 h-full w-full opacity-20 sm:opacity-30"
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                aria-hidden="true"
            >
                <defs>
                    <radialGradient id="hero-orbit-glow">
                        <stop stopColor="#34d399" stopOpacity=".16" />
                        <stop offset="1" stopColor="#34d399" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="hero-orbit-line" x1="0" y1="0" x2="1" y2="1">
                        <stop stopColor="#a7f3d0" stopOpacity=".05" />
                        <stop offset=".5" stopColor="#34d399" stopOpacity=".7" />
                        <stop offset="1" stopColor="#a7f3d0" stopOpacity=".08" />
                    </linearGradient>
                </defs>
                <circle cx="1080" cy="450" r="390" fill="url(#hero-orbit-glow)" />
                <g className="hero-orbit-sphere" stroke="url(#hero-orbit-line)" strokeWidth="1.2">
                    <circle cx="1080" cy="450" r="310" strokeOpacity=".45" />
                    <ellipse cx="1080" cy="450" rx="310" ry="112" transform="rotate(-28 1080 450)" strokeOpacity=".65" />
                    <ellipse cx="1080" cy="450" rx="310" ry="112" transform="rotate(28 1080 450)" strokeOpacity=".55" />
                    <ellipse cx="1080" cy="450" rx="145" ry="310" transform="rotate(-24 1080 450)" strokeOpacity=".55" />
                    <ellipse cx="1080" cy="450" rx="145" ry="310" transform="rotate(24 1080 450)" strokeOpacity=".45" />
                    <path d="M790 450c115-180 465-180 580 0-115 180-465 180-580 0Z" strokeOpacity=".65" />
                    <path d="M805 450c110 180 440 180 550 0-110-180-440-180-550 0Z" strokeDasharray="5 9" strokeOpacity=".5" />
                </g>
                <g className="hero-spiral-wrap" fill="none" strokeLinecap="round">
                    <path d={heroSpiralPath} className="hero-spiral-halo" />
                    <path d={heroSpiralPath} className="hero-spiral-track" />
                    <path d={heroSpiralPath} className="hero-spiral-light" />
                    <circle className="hero-spiral-node hero-spiral-node-one" cx="837" cy="450" r="4" />
                    <circle className="hero-spiral-node hero-spiral-node-two" cx="1080" cy="245" r="3" />
                    <circle className="hero-spiral-node hero-spiral-node-three" cx="1323" cy="450" r="3.5" />
                </g>
                <g className="hero-orbit-trails" stroke="#6ee7b7" strokeOpacity=".32" strokeWidth="1">
                    <path d="M0 700c300-180 470-210 690-110s425 85 750-155" strokeDasharray="3 12" />
                    <path d="M0 190c290 140 490 190 700 100s455-160 740-90" strokeDasharray="2 14" />
                    <path d="M160 900c240-210 380-300 610-285s390 90 670-110" strokeDasharray="2 16" />
                </g>
            </svg>
            <div className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-[1440px] items-center px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-16 lg:py-24">
                <div className="relative z-10 max-w-4xl">
                    <h1 className="text-[clamp(2.75rem,6.5vw,5.75rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-white">
                        <span className="block">Tuition Free Tech</span>
                        <span className="block bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-300 bg-clip-text text-transparent">Scholarships — Start</span>
                        <span className="block">Your Career Today</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-50/75 sm:mt-7 sm:text-lg sm:leading-8">
                        Launch your career in tech with up to <strong className="font-semibold text-white">₦0 tuition</strong>. Learn from expert tutors, gain hands-on experience, and get mentorship to guide your journey.
                    </p>
                    <ul className="mt-6 grid gap-3 text-sm text-emerald-50/85 sm:text-base">
                        {[
                            "Beginner Friendly — No prior experience required",
                            "Flexible Learning — Online, Physical, or Hybrid",
                            "Internship & Job Placement Support",
                        ].map((benefit) => (
                            <li key={benefit} className="flex items-start gap-3">
                                <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <a
                            href="#contact"
                            className="inline-flex min-h-12 items-center justify-center gap-2 bg-emerald-400 px-6 text-sm font-semibold text-emerald-950 shadow-[0_8px_24px_rgba(4,120,87,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 hover:shadow-[0_12px_30px_rgba(4,120,87,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
                        >
                            Explore Courses
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                            </svg>
                        </a>
                        <a href="#contact" className="inline-flex min-h-12 items-center justify-center px-5 text-sm font-semibold text-emerald-100/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200">
                            Apply
                        </a>
                    </div>
                </div>

            </div>
        </section>
    )
}

export default Home
