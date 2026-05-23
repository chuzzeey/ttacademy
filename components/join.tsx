'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import TelegramButton from './tele'

const Join = () => {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

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
            { threshold: 0.2 }
        )

        observer.observe(section)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={sectionRef} id="join-section" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ef4444]/8 to-transparent rounded-full blur-3xl" />
            </div>
            
            <div className="mx-auto max-w-4xl relative z-10">
                {/* Top Row Images */}
                <div className="flex justify-between items-center mb-6 md:mb-10">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-[#ef4444]/20 to-transparent rounded-2xl blur-sm" />
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/stud1.jpeg"
                                alt="Learner 1"
                                fill
                                sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
                                quality={85}
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-[#ef4444]/20 to-transparent rounded-2xl blur-sm" />
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/stud2.jpeg"
                                alt="Learner 2"
                                fill
                                sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
                                quality={85}
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className={`text-center mb-6 md:mb-10 ${isVisible ? 'animate-[scaleIn_0.8s_ease-out_forwards]' : 'opacity-0'}`}>
                    <span className="label-text text-[#dc2626] mb-3 block">Community</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a2e] mb-4 leading-tight">
                        JOIN 8,000+ LEARNERS<br />
                        <span className="gradient-text">TODAY!</span>
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-[#5a5a6e] mb-6 md:mb-8">
                        Start your learning journey now!
                    </p>
                    <TelegramButton />
                </div>

                {/* Bottom Row Images */}
                <div className="flex justify-between items-center">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-[#ef4444]/20 to-transparent rounded-2xl blur-sm" />
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/stud3.jpeg"
                                alt="Learner 3"
                                fill
                                sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
                                quality={85}
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-[#ef4444]/20 to-transparent rounded-2xl blur-sm" />
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/stud4.jpeg"
                                alt="Learner 4"
                                fill
                                sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 144px"
                                quality={85}
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Join