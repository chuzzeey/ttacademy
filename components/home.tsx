'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Stat from './stat'

const Home = () => {
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0)

    const scrollToFeaturedCourses = () => {
        const featuredCourses = document.getElementById('featured-courses')
        if (featuredCourses) {
            featuredCourses.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % 3)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden" style={{background: 'linear-gradient(175deg, #ffffff 0%, #fef2f2 20%, #fee2e2 45%, #faf5f5 65%, #ffffff 85%, #ffffff 100%)'}}>
                {/* Decorative Elements */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef4444]/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-20 w-64 h-64 bg-gradient-to-tr from-[#991b1b]/8 to-transparent rounded-full blur-3xl" />

                {/* Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#ef4444]/40 to-transparent hidden lg:block" />

                {/* Fade transition to next section */}
                <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

                {/* Stats - Desktop Only */}
                <div className="hidden lg:block absolute bottom-8 left-0 right-0 z-10 px-8">
                    <Stat />
                </div>

                <div className="max-w-9xl mx-auto px-4 sm:px-6 md:px-8 lg:pl-20 w-full pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Hero Content */}
                        <div className="text-center md:text-left lg:text-left space-y-5 md:space-y-6 relative z-10 px-4 sm:px-6 md:px-8 lg:px-0">
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#ef4444]/20 rounded-full px-4 py-1.5 animate-[fadeIn_1s_ease-out_forwards] opacity-0">
                                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                                <span className="text-xs font-semibold text-[#dc2626] tracking-wide">Education That Works</span>
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#1a1a2e] leading-[1.02] tracking-tight">
                                <span className="inline-block animate-[slideUp_0.6s_ease-out_forwards]">LEARN.</span>{' '}
                                <span className="inline-block animate-[slideUp_0.6s_ease-out_0.15s_forwards]">GROW.</span><br/>
                                <span className="inline-block bg-gradient-to-r from-[#dc2626] to-[#991b1b] bg-clip-text text-transparent animate-[slideUp_0.6s_ease-out_0.3s_forwards]">SUCCEED.</span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#5a5a6e] max-w-xl mx-auto md:mx-auto lg:mx-0 leading-relaxed animate-[slideUp_0.8s_ease-out_0.5s_forwards]">
                                Learn from industry experts and gain the skills to advance your career.
                            </p>
                            <button
                                onClick={scrollToFeaturedCourses}
                                className="bg-gradient-to-r from-[#dc2626] to-[#991b1b] text-white hover:from-[#b91c1c] hover:to-[#7f1d1d] px-8 lg:px-10 py-3.5 lg:py-4 text-base sm:text-lg lg:text-xl font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-[#ef4444]/25 transform hover:-translate-y-0.5 mx-auto lg:mx-0 animate-[slideUp_0.8s_ease-out_0.7s_forwards]"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Explore courses
                            </button>
                        </div>

                        {/* Hero Image - Blended with Background */}
                        <div className="relative flex justify-center">
                            <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] lg:w-[650px] lg:h-[650px]">
                                {[
                                    'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339410/ceoo-Photoroom_fr28w6.png',
                                    'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339410/so3-Photoroom_chmd5i.png',
                                    'https://res.cloudinary.com/dwry4zb9z/image/upload/q_auto/f_auto/v1779339410/so2-Photoroom_i3ih86.png'
                                ].map((src, index) => (
                                    <Image
                                        key={src}
                                        src={src}
                                        alt={`Professional ${index + 1}`}
                                        width={700}
                                        height={800}
                                        sizes="(max-width: 768px) 320px, (max-width: 1024px) 480px, 650px"
                                        quality={90}
                                        className={`object-cover absolute inset-0 transition-all duration-1000 ease-in-out ${currentHeroIndex === index ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                        priority={index === 0}
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Home
