'use client'
import React, { useRef } from 'react'

const WhatYouGet = () => {
    const sectionRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={sectionRef} id="featured-courses" className="w-full px-4 md:px-8 lg:px-12 xl:px-20 py-20 md:py-28 bg-white relative overflow-hidden">
            {/* Top fade from previous section */}
            <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-white via-white/90 to-transparent pointer-events-none z-20" />
            
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Subtle dot pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle, #1a1a2e 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }} />
                
                {/* Large ambient blurs */}
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-red-100/40 via-rose-50/30 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/30 via-indigo-50/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-50/20 via-fuchsia-50/10 to-cyan-50/20 rounded-full blur-3xl" />
                
                {/* Floating geometric shapes */}
                <div className="absolute top-20 left-[15%] w-16 h-16 border border-red-200/40 rounded-2xl rotate-12 animate-[float_8s_ease-in-out_infinite]" />
                <div className="absolute top-40 right-[10%] w-10 h-10 border border-blue-200/40 rounded-full animate-[float_6s_ease-in-out_infinite_1s]" />
                <div className="absolute bottom-32 left-[8%] w-12 h-12 border border-amber-200/40 rounded-xl rotate-45 animate-[float_7s_ease-in-out_infinite_2s]" />
                <div className="absolute bottom-48 right-[20%] w-14 h-14 border border-emerald-200/40 rounded-2xl -rotate-6 animate-[float_9s_ease-in-out_infinite_0.5s]" />
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-20" />

            <div className="mx-auto max-w-full relative z-10">
               
            </div>
        </div>
    )
}

export default WhatYouGet
