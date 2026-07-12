'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const WhatYouGet = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const sectionRef = useRef<HTMLDivElement>(null)

    const courses = [
        {
            title: "Cybersecurity",
            description: "Learn to protect systems, networks, and data from digital attacks and security breaches.",
            duration: "3 Mounths",
            lessons: "40 Lessons",
            hours: "12 Hours",
            image: "/cybersecurity_course.jpeg",
            accent: "from-emerald-500 to-teal-600",
            gradient: "from-emerald-500/80 via-emerald-600/40 to-black/70",
        },
        {
            title: "Data science",
            description: "Analyze complex data, build predictive models, and extract insights from large datasets.",
            duration: "4 Months",
            lessons: "35 Lessons",
            hours: "10 Hours",
            image: "/data_science_course.jpeg",
            accent: "from-violet-500 to-purple-600",
            gradient: "from-violet-500/80 via-violet-600/40 to-black/70",
        },
        {
            title: "AI automation",
            description: "Build intelligent automated systems using machine learning and advanced AI techniques.",
            duration: "4 Months",
            lessons: "42 Lessons",
            hours: "14 Hours",
            image: "/ai_course.jpeg",
            accent: "from-fuchsia-500 to-pink-600",
            gradient: "from-fuchsia-500/80 via-fuchsia-600/40 to-black/70",
        },
        {
            title: "Computer networking",
            description: "Master network protocols, infrastructure, and system connectivity fundamentals.",
            duration: "2 Months",
            lessons: "30 Lessons",
            hours: "9 Hours",
            image: "/neti.jpeg",
            accent: "from-blue-500 to-cyan-600",
            gradient: "from-blue-500/80 via-blue-600/40 to-black/70",
        },
        {
            title: "Ethical hacking",
            description: "Learn penetration testing and security assessment to protect systems from vulnerabilities.",
            duration: "3 Months",
            lessons: "38 Lessons",
            hours: "13 Hours",
            image: "/ethical_hack.jpeg",
            accent: "from-red-500 to-rose-600",
            gradient: "from-red-500/80 via-red-600/40 to-black/70",
        },
        {
            title: "Graphic Design",
            description: "Create stunning visual content using industry-standard design tools and principles.",
            duration: "2 Months",
            lessons: "28 Lessons",
            hours: "8 Hours",
            image: "/graphic_design_course.jpeg",
            accent: "from-orange-500 to-amber-600",
            gradient: "from-orange-500/80 via-orange-600/40 to-black/70",
        },
        {
            title: "UI/UX design",
            description: "Design beautiful and intuitive user interfaces with modern design principles.",
            duration: "3 Months",
            lessons: "32 Lessons",
            hours: "9 Hours",
            image: "/uiux_course.jpeg",
            accent: "from-rose-500 to-pink-600",
            gradient: "from-rose-500/80 via-rose-600/40 to-black/70",
        },
        {
            title: "Full stack development",
            description: "Master both frontend and backend development to build complete web applications.",
            duration: "4 Months",
            lessons: "40 Lessons",
            hours: "12 Hours",
            image: "/fullstack_course.jpeg",
            accent: "from-amber-500 to-yellow-600",
            gradient: "from-amber-500/80 via-amber-600/40 to-black/70",
        },
        {
            title: "Frontend development",
            description: "Build responsive and interactive user interfaces with modern frontend technologies.",
            duration: "2 Months",
            lessons: "35 Lessons",
            hours: "10 Hours",
            image: "/fronti.jpeg",
            accent: "from-sky-500 to-blue-600",
            gradient: "from-sky-500/80 via-sky-600/40 to-black/70",
        },
        {
            title: "Backend development",
            description: "Develop robust server-side applications and APIs with modern backend technologies.",
            duration: "2 Months",
            lessons: "36 Lessons",
            hours: "11 Hours",
            image: "/backend_course.jpeg",
            accent: "from-slate-500 to-gray-600",
            gradient: "from-slate-500/80 via-slate-600/40 to-black/70",
        },
        {
            title: "Web development",
            description: "Learn fundamental web technologies to build modern websites and web applications.",
            duration: "3 Months",
            lessons: "30 Lessons",
            hours: "8 Hours",
            image: "/webi.jpeg",
            accent: "from-cyan-500 to-teal-600",
            gradient: "from-cyan-500/80 via-cyan-600/40 to-black/70",
        },
        {
            title: "Digital Marketing",
            description: "Master digital marketing strategies including SEO, social media, and online advertising.",
            duration: "2 Months",
            lessons: "25 Lessons",
            hours: "7 Hours",
            image: "/digital_marketing_couse.jpeg",
            accent: "from-green-500 to-emerald-600",
            gradient: "from-green-500/80 via-green-600/40 to-black/70",
        },
        {
            title: "Cloud computing",
            description: "Learn cloud architecture, deployment, and management using major cloud platforms.",
            duration: "3 Months",
            lessons: "38 Lessons",
            hours: "12 Hours",
            image: "/cloud_course.jpeg",
            accent: "from-sky-500 to-indigo-600",
            gradient: "from-sky-500/80 via-sky-600/40 to-black/70",
        },
        {
            title: "Data Analysis",
            description: "Master data analysis techniques to interpret complex datasets and drive business decisions.",
            duration: "3 Months",
            lessons: "32 Lessons",
            hours: "10 Hours",
            image: "https://res.cloudinary.com/djdbcoyot/image/upload/v1779569012/c91h3hde2gujqh087u8w.jpg",
            accent: "from-lime-500 to-green-600",
            gradient: "from-lime-500/80 via-lime-600/40 to-black/70",
        }
    ]

    const filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
            { threshold: 0.05 }
        )

        observer.observe(section)
        return () => observer.disconnect()
    }, [])

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
                {/* Header Section */}
                <div className={`text-center mb-8 md:mb-12 ${isVisible ? 'animate-[fadeIn_0.8s_ease-out_forwards]' : 'opacity-0'}`}>
                    {/* Pill badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Our Programs</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.05]">
                        FEATURED{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent">
                                COURSES
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 8 Q25 2 50 8 T100 6" stroke="url(#swooshGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                <defs>
                                    <linearGradient id="swooshGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                                        <stop offset="50%" stopColor="#dc2626" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                    </h2>
                    
                    <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Industry-relevant curriculum designed for your success
                    </p>

                    {/* Search Bar */}
                    <div className="mt-6 relative max-w-md mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-full bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-300" />
                        <div className="w-2 h-2 bg-red-400 rounded-full rotate-45" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-300" />
                    </div>
                </div>

                {/* Course Cards Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No courses found matching your search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:pl-2 lg:pr-2 lg:pt-12 lg:pb-12 2xl:px-45">
                        {filteredCourses.map((course, index) => (
                            <div
                                key={index}
                                className={`group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1
                                    ${isVisible ? 'animate-[scaleIn_0.5s_ease-out_forwards]' : 'opacity-0'}
                                `}
                                style={{ animationDelay: `${0.1 + (index * 0.06)}s` }}
                            >
                                {/* Image Section */}
                                <div className="relative h-40 sm:h-44 overflow-hidden">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        quality={90}
                                        loading="lazy"
                                        className="object-cover brightness-90 transition-all duration-500 group-hover:brightness-100 group-hover:scale-105"
                                    />
                                    
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t ${course.gradient} opacity-40`} />
                                    
                                    {/* Duration Badge - top right */}
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 border border-white/40 shadow-sm">
                                            {course.duration}
                                        </span>
                                    </div>

                                    {/* Course Title Overlay on Image */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-sm md:text-base font-bold tracking-tight text-white drop-shadow-md">
                                            {course.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                                    <p className="text-sm text-gray-500 leading-relaxed flex-1">
                                        {course.description}
                                    </p>
                                    
                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <button className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                                            Enroll Now
                                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default WhatYouGet