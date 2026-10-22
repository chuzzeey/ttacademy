'use client'

import { useState } from 'react'

const faqs = [
    {
        question: 'Are your courses self paced or live?',
        answer: 'Live',
    },
    {
        question: 'Can I access the courses on my mobile device?',
        answer: 'Yes',
    },
    {
        question: 'Do you provide certification upon course completion?',
        answer: 'Yes',
    },
    {
        question: 'Are there refund requests?',
        answer: 'No',
    },
    {
        question: 'What types of courses do you offer?',
        answer: 'A real time job opportunity tech skills',
    },
    {
        question: 'Can I pay by installment?',
        answer: 'No',
    },
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <section id="faq-section" aria-labelledby="faq-title" className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <div className="max-w-md">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-800">Support</p>
                    <h2 id="faq-title" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
                        Frequently asked questions
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-500">
                        A few useful details about learning with Tech Trailblazer Academy.
                    </p>
                    <a href="#contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700">
                        Continue to application
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                <div className="divide-y divide-slate-200 border-y border-slate-200">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index
                        const triggerId = `faq-trigger-${index}`
                        const answerId = `faq-answer-${index}`

                        return (
                            <div key={faq.question}>
                                <h3>
                                    <button
                                        id={triggerId}
                                        type="button"
                                        aria-expanded={isOpen}
                                        aria-controls={answerId}
                                        className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-slate-900 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-inset sm:text-base"
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                    >
                                        {faq.question}
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center border border-slate-200 text-emerald-800 transition ${isOpen ? 'rotate-45 border-emerald-200 bg-emerald-50' : ''}`} aria-hidden="true">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                                            </svg>
                                        </span>
                                    </button>
                                </h3>
                                <div
                                    id={answerId}
                                    role="region"
                                    aria-labelledby={triggerId}
                                    hidden={!isOpen}
                                    className="pb-4 pr-10 text-sm leading-6 text-slate-500"
                                >
                                    {faq.answer}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default FAQ
