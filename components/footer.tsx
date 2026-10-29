'use client'
import React from 'react'
import { socialLinks } from '@/lib/social-links'
import Brand from './brand'

const Footer = () => {
    const footerLinks = {
        Explore: [
            { label: 'Home', href: '#home' },
            { label: 'Courses', href: '#application-process' },
            { label: 'Benefits', href: '#benefits-section' },
            { label: 'Application', href: '#contact' },
            { label: 'FAQ', href: '#faq-section' },
            { label: 'Community', href: '#join-section' },
        ],
    }

    return (
        <footer className="w-full border-t border-slate-200 bg-[#f7f8f7] px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
            <div className="mx-auto max-w-7xl">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-10 border-b border-slate-200 pb-10 text-center sm:grid-cols-[1fr_auto] sm:text-left">
                    {/* Logo & Brand */}
                    <div className="flex flex-col items-center sm:items-start">
                        <Brand className="rounded-xl bg-[#17251c] px-4 py-3" />
                        <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                            Empowering the next generation of tech professionals with industry-leading education.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="sm:min-w-40">
                            <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-800">
                                {category}
                            </h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <a href={link.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col items-center justify-between gap-6 pt-7 sm:flex-row">
                    {/* Social Icons */}
                    <div className="flex gap-2">
                        {socialLinks.map((social) => (
                            <a
                                key={social.id}
                                aria-label={`Tech Trailblazer Academy on ${social.name}`}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                            >
                                <svg className="pointer-events-none h-4 w-4" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: social.svg }} />
                            </a>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-xs text-slate-500">© {new Date().getFullYear()} Tech Trailblazer Academy</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer