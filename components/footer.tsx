'use client'
import React from 'react'

const Footer = () => {
    const footerLinks = {
        'Quick Links': ['Home', 'Courses', 'FAQ']
    }

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const scrollToFeaturedCourses = () => {
        const featuredCourses = document.getElementById('featured-courses')
        if (featuredCourses) {
            featuredCourses.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const scrollToFAQ = () => {
        const faqSection = document.getElementById('faq-section')
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <footer className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-20 relative overflow-hidden bg-white">
            {/* Decorative */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-t from-[#ef4444]/5 to-transparent rounded-full blur-3xl" />
            </div>
            
            <div className="w-full relative z-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 max-w-4xl mx-auto text-center md:text-left">
                    {/* Logo & Brand */}
                    <div className="md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <button 
                            onClick={() => window.location.reload()}
                            className="flex flex-col items-center md:items-start bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <img 
                                src="/rad.jpeg" 
                                alt="Tech Trailblazer Academy" 
                                className="h-8 md:h-10 mb-3"
                            />
                            <span className="text-[10px] md:text-xs font-bold text-gray-900 tracking-wide">
                                Tech Trailblazer Academy
                            </span>
                        </button>
                        <p className="text-sm text-gray-500 mt-3 max-w-xs">
                            Empowering the next generation of tech professionals with industry-leading education.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="text-[10px] md:text-xs font-semibold text-red-600 tracking-wide uppercase mb-4">
                                {category}
                            </h4>
                            <ul className="space-y-3">
                                {links.map((link) => {
                                    const handleClick = () => {
                                        switch(link) {
                                            case 'Home': scrollToTop(); break
                                            case 'Courses': scrollToFeaturedCourses(); break
                                            case 'FAQ': scrollToFAQ(); break
                                        }
                                    }
                                    return (
                                        <li key={link}>
                                            <button 
                                                onClick={handleClick}
                                                className="text-gray-500 hover:text-red-600 transition-colors text-sm bg-transparent border-none cursor-pointer font-medium"
                                            >
                                                {link}
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-8 flex flex-col items-center max-w-2xl mx-auto">
                    {/* Social Icons */}
                    <div className="flex space-x-4 mb-6">
                        <a href="https://x.com/techacademy4all?s=21" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 hover:shadow-sm transition-all duration-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </a>
                        <a href="https://www.instagram.com/techtrailacademy4all?igsh=MTY2ajR4NXNvMW9hcw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 hover:shadow-sm transition-all duration-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                            </svg>
                        </a>
                        <a href="https://web.facebook.com/profile.php?id=61550210562440&_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 hover:shadow-sm transition-all duration-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="https://t.me/techblazeracademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 hover:border-red-300 hover:shadow-sm transition-all duration-200">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56l-1.68 7.92c-.12.54-.44.68-.89.42l-2.49-1.84-1.2 1.16c-.13.13-.24.24-.49.24l.17-2.47 4.63-4.18c.2-.18-.05-.28-.31-.1l-5.72 3.6-2.47-.78c-.54-.17-.55-.54.11-.8l9.66-3.72c.45-.16.84.11.7.81z"/>
                            </svg>
                        </a>
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                    <span className="text-xs text-gray-500">&copy; </span>
                        <span className="text-xs font-semibold text-gray-900 tracking-wide">
                            Tech Trailblazer Academy 2026
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer