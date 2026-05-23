'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

const WhatYouGet = () => {
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLDivElement>(null)

    const courses = [
        {
            title: "Cybersecurity",
            description: "Learn to protect systems, networks, and data from digital attacks and security breaches.",
            duration: "3 Months",
            lessons: "40 Lessons",
            hours: "12 Hours",
            size: "Advanced",
            image: "/cybersecurity_course.jpeg"
        },
        {
            title: "Data science",
            description: "Analyze complex data, build predictive models, and extract insights from large datasets.",
            duration: "4 Months",
            lessons: "35 Lessons",
            hours: "10 Hours",
            size: "Intermediate",
            image: "/data_science_course.jpeg"
        },
        {
            title: "AI automation",
            description: "Build intelligent automated systems using machine learning and advanced AI techniques.",
            duration: "4 Months",
            lessons: "42 Lessons",
            hours: "14 Hours",
            size: "Advanced",
            image: "/ai_course.jpeg"
        },
        {
            title: "Computer networking",
            description: "Master network protocols, infrastructure, and system connectivity fundamentals.",
            duration: "2 Months",
            lessons: "30 Lessons",
            hours: "9 Hours",
            size: "Intermediate",
            image: "/neti.jpeg"
        },
        {
            title: "Ethical hacking",
            description: "Learn penetration testing and security assessment to protect systems from vulnerabilities.",
            duration: "3 Months",
            lessons: "38 Lessons",
            hours: "13 Hours",
            size: "Advanced",
            image: "/ethical_hack.jpeg"
        },
        {
            title: "Graphic Design",
            description: "Create stunning visual content using industry-standard design tools and principles.",
            duration: "2 Months",
            lessons: "28 Lessons",
            hours: "8 Hours",
            size: "Beginner",
            image: "/graphic_design_course.jpeg"
        },
        {
            title: "UI/UX design",
            description: "Design beautiful and intuitive user interfaces with modern design principles.",
            duration: "3 Months",
            lessons: "32 Lessons",
            hours: "9 Hours",
            size: "Beginner",
            image: "/uiux_course.jpeg"
        },
        {
            title: "3D animation",
            description: "Create stunning 3D animations and visual effects using professional animation software.",
            duration: "4 Months",
            lessons: "45 Lessons",
            hours: "15 Hours",
            size: "Intermediate",
            image: "/3d.jpeg"
        },
        {
            title: "Full stack development",
            description: "Master both frontend and backend development to build complete web applications.",
            duration: "4 Months",
            lessons: "40 Lessons",
            hours: "12 Hours",
            size: "Intermediate",
            image: "/fullstack_course.jpeg"
        },
        {
            title: "Frontend development",
            description: "Build responsive and interactive user interfaces with modern frontend technologies.",
            duration: "2 Months",
            lessons: "35 Lessons",
            hours: "10 Hours",
            size: "Beginner",
            image: "/fronti.jpeg"
        },
        {
            title: "Backend development",
            description: "Develop robust server-side applications and APIs with modern backend technologies.",
            duration: "2 Months",
            lessons: "36 Lessons",
            hours: "11 Hours",
            size: "Intermediate",
            image: "/backend_course.jpeg"
        },
        {
            title: "Web development",
            description: "Learn fundamental web technologies to build modern websites and web applications.",
            duration: "3 Months",
            lessons: "30 Lessons",
            hours: "8 Hours",
            size: "Beginner",
            image: "/webi.jpeg"
        },
        {
            title: "Digital Marketing",
            description: "Master digital marketing strategies including SEO, social media, and online advertising.",
            duration: "2 Months",
            lessons: "25 Lessons",
            hours: "7 Hours",
            size: "Beginner",
            image: "/digital_marketing_couse.jpeg"
        },
        {
            title: "Cloud computing",
            description: "Learn cloud architecture, deployment, and management using major cloud platforms.",
            duration: "3 Months",
            lessons: "38 Lessons",
            hours: "12 Hours",
            size: "Intermediate",
            image: "/cloud_course.jpeg"
        },
        {
            title: "Data Analysis",
            description: "Master data analysis techniques to interpret complex datasets and drive business decisions.",
            duration: "3 Months",
            lessons: "32 Lessons",
            hours: "10 Hours",
            size: "Intermediate",
            image: "https://res.cloudinary.com/djdbcoyot/image/upload/v1779569012/c91h3hde2gujqh087u8w.jpg"
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

    return (
        <div ref={sectionRef} id="featured-courses" className="w-full px-3 md:px-6 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef4444]/8 to-transparent rounded-full blur-3xl" />
            </div>
            
            <div className="mx-auto max-w-8xl relative z-10">
                {/* Header */}
                <div className={`text-center mb-10 md:mb-14 ${isVisible ? 'animate-[fadeIn_0.8s_ease-out_forwards]' : 'opacity-0'}`}>
                    <span className="label-text text-[#dc2626] mb-3 block">Our Programs</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a2e] mb-3">
                        FEATURED COURSES
                    </h2>
                    <p className="text-base md:text-lg text-[#5a5a6e] max-w-2xl mx-auto">
                        Industry-relevant curriculum designed for your success
                    </p>
                </div>

                {/* Course Cards - Premium Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
                    {courses.map((course, index) => (
                        <div 
                            key={index} 
                            className={`card-premium rounded-xl overflow-hidden ${isVisible ? 'animate-[scaleIn_0.5s_ease-out_forwards]' : 'opacity-0'}`}
                            style={{ animationDelay: `${Math.floor(index / 2) * 0.1}s` }}
                        >
                            {/* Course Image */}
                            <div className="relative w-full aspect-[4/3] overflow-hidden">
                                <Image
                                    src={course.image}
                                    alt={course.title}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                    quality={85}
                                    loading="lazy"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                {/* Duration Badge */}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#dc2626] text-[10px] md:text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                    {course.duration}
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="p-3 md:p-4">
                                <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#1a1a2e] mb-3 leading-tight">
                                    {course.title}
                                </h3>
                                <a 
                                    href="https://chat.whatsapp.com/H3iTluQFKWh9i9X9wqFMEe"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] md:text-xs font-semibold rounded-lg bg-[#25D366] text-white hover:bg-[#128C7E] transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.327-1.682a9.86 9.86 0 005.26 1.483h.004c5.45 0 9.884-4.434 9.884-9.884 0-2.64-1.03-5.122-2.898-6.988z"/>
                                    </svg>
                                    <span>Inquire</span>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WhatYouGet