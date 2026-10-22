import { ArrowRight, BookOpenCheck, ClipboardList, MailCheck } from 'lucide-react'
import { COURSE_CATALOG } from '@/lib/course-catalog'

const steps = [
    {
        number: '01',
        title: 'Choose a course',
        description: `Explore ${COURSE_CATALOG.length} learning paths and select one in the application form.`,
        icon: BookOpenCheck,
    },
    {
        number: '02',
        title: 'Share your details',
        description: 'Tell us about your goals, location, and learning setup.',
        icon: ClipboardList,
    },
    {
        number: '03',
        title: 'Hear from our team',
        description: 'After you apply, we follow up using your email and WhatsApp details.',
        icon: MailCheck,
    },
]

function ApplicationSteps() {
    return (
    <section id="application-process" aria-labelledby="application-process-title" className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-800">Application process</p>
                    <h2 id="application-process-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        A straightforward way to get started
                    </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-slate-500">
                    Three clear steps take you from choosing a learning path to hearing from our team.
                </p>
            </div>

            <ol className="grid gap-3 md:grid-cols-3">
                {steps.map(({ number, title, description, icon: Icon }, index) => (
                    <li key={number} className="relative min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.025)] sm:p-6">
                        <div className="mb-7 flex items-center justify-between">
                            <span className="text-xs font-semibold tabular-nums tracking-[0.12em] text-emerald-800">{number} / 03</span>
                            <span className="flex h-9 w-9 items-center justify-center bg-emerald-50 text-emerald-800">
                                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                            </span>
                        </div>
                        <h3 className="text-base font-semibold tracking-tight text-slate-950">{title}</h3>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
                        {index < steps.length - 1 && (
                            <ArrowRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 bg-white p-0.5 text-emerald-700 md:block" />
                        )}
                    </li>
                ))}
            </ol>
        </div>
    </section>
    )
}

export default ApplicationSteps
