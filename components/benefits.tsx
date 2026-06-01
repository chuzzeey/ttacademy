'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const Benefits = () => {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    const benefits = [
        {
            title: "Get Hired Fast",
            description: "Direct job placement with partner tech companies. 85% of our students land jobs quickly after completing our programs.",
            icon: "briefcase"
        },
        {
            title: "Learn by Doing",
            description: "Build real projects, not just theory. Graduate with a portfolio that gets you hired.",
            icon: "code"
        },
        {
            title: "Industry Mentors",
            description: "Learn directly from tech professionals at Google, Meta, and top startups.",
            icon: "users"
        }
    ]

    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true)
                    }
                })
            },
            { threshold: 0.1 }
        )

        observer.observe(section)
        return () => observer.disconnect()
    }, [])

    const getIcon = (iconName: string) => {
        const icons: { [key: string]: React.ReactElement } = {
            briefcase: (
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            users: (
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            code: (
                <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
        }
        return icons[iconName] || icons.code
    }

    const [currentBgIndex, setCurrentBgIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % 5)
        }, 4000)
        return () => clearInterval(interval)
    }, [])
    
    const bgImages = [
        'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339409/meeting_sm_bumn_wnglyv.jpg',
        'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339409/meeting_sm_bumn_wnglyv.jpg',
        'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339409/meeting_sm_bumn_wnglyv.jpg',
        'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339409/meeting_sm_bumn_wnglyv.jpg',
        'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339411/Bessemer_Trust_Zoom_uahozm.jpg'
    ]

    return (
        <div ref={sectionRef} id="benefits-section" className="w-full px-4 py-16 md:py-24 relative overflow-hidden">
            {/* Pure white top fade to blend with hero */}
            <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-white via-white/90 to-transparent pointer-events-none z-20" />
            
            {/* Background Images - Sliding Crossfade */}
            <div className="absolute inset-0 pointer-events-none">
                {bgImages.map((src, index) => (
                    <div 
                        key={index} 
                        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                        style={{ opacity: currentBgIndex === index ? 0.35 : 0 }}
                    >
                        <Image
                            src={src}
                            alt=""
                            fill
                            sizes="100vw"
                            quality={80}
                            loading="lazy"
                            className="object-cover scale-105"
                        />
                    </div>
                ))}
                {/* Overlay to keep content readable */}
                <div className="absolute inset-0 bg-white/50" />
            </div>
            
            {/* Decorative Blurs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
                <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-bl from-[#ef4444]/8 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-0 w-72 h-72 bg-gradient-to-tr from-[#991b1b]/8 to-transparent rounded-full blur-3xl" />
            </div>
            
            {/* Bottom white fade to next section */}
            <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-20" />
            
            <div className="mx-auto max-w-4xl relative z-10">
                <div className={`text-center mb-10 md:mb-14 ${isVisible ? 'animate-[fadeIn_0.8s_ease-out_forwards]' : 'opacity-0'}`}>
                    {/* Pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Why Choose Us</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a2e] mb-4 tracking-tight leading-[1.05]">
                        Why Choose{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent">
                                Tech Trailblazer Academy
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 8 Q25 2 50 8 T100 6" stroke="url(#swooshGradientBenefits)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="swooshGradientBenefits" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                                        <stop offset="50%" stopColor="#dc2626" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h2>
                    
                    <p className="text-base md:text-xl text-[#6b6b7b] max-w-2xl mx-auto leading-relaxed font-medium">
                        Real results, not just certificates
                    </p>
                    
                    {/* Divider */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-300" />
                        <div className="w-2 h-2 bg-red-400 rounded-full rotate-45" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-300" />
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className={`group card-premium rounded-2xl p-5 md:p-7 flex items-start gap-4 md:gap-6 bg-white/90 backdrop-blur-sm ${isVisible ? 'animate-[slideInUp_0.6s_ease-out_forwards]' : 'opacity-0'}`}
                            style={{ animationDelay: `${0.2 + (index * 0.15)}s` }}
                        >
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#dc2626] to-[#991b1b] rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-[#ef4444]/20 group-hover:shadow-xl group-hover:shadow-[#ef4444]/30 transition-shadow">
                                {getIcon(benefit.icon)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1a1a2e] mb-1.5 md:mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-[#5a5a6e] text-sm sm:text-base md:text-lg leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Benefits