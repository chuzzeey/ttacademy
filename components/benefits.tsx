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

                {/* WhatsApp Group CTA */}
                <div className={`mt-10 md:mt-14 flex flex-col items-center gap-3 ${isVisible ? 'animate-[slideInUp_0.6s_ease-out_forwards]' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                    <p className="text-sm md:text-base text-[#5a5a6e] text-center max-w-md">
                        Want to connect with our mentors and other learners? Join our WhatsApp group below.
                    </p>
                    <a
                        href="https://chat.whatsapp.com/CQwV51o9q4ZHp9kRXDM9qQ?s=cl&p=i&mlu=0"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3.5 bg-[#25D366] text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#25D366]/25 transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.327-1.682a9.86 9.86 0 005.26 1.483h.004c5.45 0 9.884-4.434 9.884-9.884 0-2.64-1.03-5.122-2.898-6.988z"/>
                        </svg>
                        Join our WhatsApp Group
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Benefits
