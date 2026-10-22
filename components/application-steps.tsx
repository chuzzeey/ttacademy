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

const APPLICATION_COURSE_SLUGS = [
    'cybersecurity',
    'uiux-design',
    'cloud-computing',
    'web-development',
    'data-analysis',
    'ai-video-creation',
    'ai-automation',
    'ai-agent-development',
    'backend-development',
    'frontend-development',
    'ethical-hacking',
    'graphic-design-branding',
]

const applicationCourses = COURSE_CATALOG.filter(({ slug }) => APPLICATION_COURSE_SLUGS.includes(slug))

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
    return (
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
                        <a
                            href={`/?course=${encodeURIComponent(slug)}#contact`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#83945a] px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:border-[#82b310] hover:text-[#82b310] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                        >
                            Apply
                            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </a>
                    </li>
                    )
                })}
            </ul>
        </div>
    </section>
    )
}

export default ApplicationSteps
