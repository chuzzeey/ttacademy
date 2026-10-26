'use client'

import { useState } from 'react'
import {
    ArrowUpRight,
    BarChart3,
    Bot,
    Bug,
    Cloud,
    Code2,
    Monitor,
    Paintbrush,
    Palette,
    Server,
    ShieldCheck,
    Video,
    Workflow,
    type LucideIcon,
} from 'lucide-react'
import { COURSE_CATALOG } from '@/lib/course-catalog'

const applicationCourses = COURSE_CATALOG

const courseIcons: Record<string, LucideIcon> = {
    cybersecurity: ShieldCheck,
    'uiux-design': Palette,
    'cloud-computing': Cloud,
    'web-development': Code2,
    'data-analysis': BarChart3,
    'ai-video-creation': Video,
    'ai-automation': Workflow,
    'ai-agent-development': Bot,
    'backend-development': Server,
    'frontend-development': Monitor,
    'ethical-hacking': Bug,
    'graphic-design-branding': Paintbrush,
}

function ApplicationSteps() {
    const [selectedCourse, setSelectedCourse] = useState<{ slug: string; title: string } | null>(null)

    const confirmCourseApplication = () => {
        if (!selectedCourse) return

        window.dispatchEvent(new CustomEvent('ttacademy:select-application-course', {
            detail: { course: selectedCourse.title.toLowerCase() },
        }))
        setSelectedCourse(null)
        window.requestAnimationFrame(() => {
            const courseField = document.getElementById('application-course')
            courseField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            courseField?.focus({ preventScroll: true })
        })
    }

    return (
        <>
            <section id="application-process" aria-labelledby="application-process-title" className="scroll-mt-16 bg-white px-5 py-16 sm:px-8 sm:py-20 md:scroll-mt-20 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-800">Application process</p>
                            <h2 id="application-process-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                Choose a course and apply
                            </h2>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-slate-500">
                            Find the learning path that interests you and start your application.
                        </p>
                    </div>

                    <ul className="grid gap-3 sm:grid-cols-2">
                        {applicationCourses.map(({ slug, title }) => {
                            const CourseIcon = courseIcons[slug]

                            return (
                                <li key={slug} className="flex min-w-0 items-center justify-between gap-4 border border-slate-200/90 bg-white px-4 py-4 transition-colors hover:border-[#83945a] sm:px-5">
                                    <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-slate-800">
                                        <CourseIcon aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={1.8} />
                                        <span>{title}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedCourse({ slug, title })}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#83945a] px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:border-[#82b310] hover:text-[#82b310] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                                    >
                                        Apply
                                        <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </section>

            {selectedCourse && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedCourse(null)
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="course-confirmation-title"
                        className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Course application</p>
                        <h2 id="course-confirmation-title" className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                            Apply for {selectedCourse.title}?
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            We&apos;ll select this course in the application form and take you there now.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => setSelectedCourse(null)}
                                className="min-h-11 border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                            >
                                No
                            </button>
                            <button
                                type="button"
                                onClick={confirmCourseApplication}
                                className="inline-flex min-h-11 items-center justify-center bg-[#a0c44b] px-4 text-sm font-semibold text-slate-950 transition hover:bg-[#91b13f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                            >
                                Yes
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    )
}

export default ApplicationSteps
