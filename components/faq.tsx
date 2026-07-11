'use client'
import React, { useState, useRef, useEffect } from 'react'

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    const faqs = [
        {
            question: "Are your courses self paced or live?",
            answer: "Live"
        },
        {
            question: "Can I access the courses on my mobile device?",
            answer: "Yes"
        },
        {
            question: "Do you provide certification upon course completion?",
            answer: "Yes"
        },
        {
            question: "Are there refund requests?",
            answer: "No"
        },
        {
            question: "What types of courses do you offer?",
            answer: "A real time job opportunity tech skills"
        },
        {
            question: "Can I pay by installment?",
            answer: "No"
        }
    ]

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

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

    return (
        <div ref={sectionRef} id="faq-section" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#ef4444]/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#991b1b]/5 to-transparent rounded-full blur-3xl" />
            </div>
            
            <div className="mx-auto max-w-3xl relative z-10">
                <div className={`text-center mb-10 md:mb-14 ${isVisible ? 'animate-[fadeIn_0.8s_ease-out_forwards]' : 'opacity-0'}`}>
                    {/* Pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Support</span>
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight leading-[1.05]">
                        FREQUENTLY ASKED<br />
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent">
                                QUESTIONS
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 8 Q25 2 50 8 T100 6" stroke="url(#swooshGradientFAQ)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="swooshGradientFAQ" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                                        <stop offset="50%" stopColor="#dc2626" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h2>
                    
                    <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                        Everything you need to know
                    </p>
                    
                    {/* Divider */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-300" />
                        <div className="w-2 h-2 bg-red-400 rounded-full rotate-45" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-300" />
                    </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 card-premium ${isVisible ? 'animate-[slideInLeft_0.5s_ease-out_forwards]' : 'opacity-0'}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <button
                                className="w-full text-left p-4 md:p-6 flex justify-between items-center gap-4 bg-transparent border-none cursor-pointer"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="text-sm sm:text-base md:text-lg font-semibold text-foreground flex-1">
                                    {faq.question}
                                </span>
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}>
                                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </button>
                            <div className={`overflow-hidden transition-all duration-400 ease-in-out ${openIndex === index ? 'max-h-48' : 'max-h-0'}`}>
                                <div className="px-4 md:px-6 pb-4 md:pb-6">
                                    <div className="w-full h-px bg-gradient-to-r from-[#ef4444]/30 to-transparent mb-4" />
                                    <p className="text-muted-foreground text-sm sm:text-base">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default FAQ