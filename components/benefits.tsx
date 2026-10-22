import { BriefcaseBusiness, Code2, UsersRound } from 'lucide-react'

const benefits = [
    {
        number: '01',
        title: 'Get hired faster',
        description: 'Direct job placement with partner tech companies.',
        icon: BriefcaseBusiness,
    },
    {
        number: '02',
        title: 'Learn by doing',
        description: 'Build real projects, not just theory. Graduate with a portfolio that gets you hired.',
        icon: Code2,
    },
    {
        number: '03',
        title: 'Learn from industry mentors',
        description: 'Learn directly from tech professionals at Google, Meta, and top startups.',
        icon: UsersRound,
    },
]

const Benefits = () => (
    <section id="benefits-section" aria-labelledby="benefits-title" className="bg-[#f7f8f7] px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div className="flex flex-col items-start">
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-800">Why choose us</p>
                <h2 id="benefits-title" className="mt-3 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
                    Build skills for the work you want to do.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
                    Learn practical skills with guidance from people who work in tech, and put what you learn into practice.
                </p>

                <div className="mt-8 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-[0_12px_30px_-20px_rgba(15,23,42,0.5)] sm:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">The Tech Trailblazer approach</p>
                    <p className="mt-3 text-lg font-medium leading-7 tracking-tight sm:text-xl">
                        Education that works — built around practical learning and real projects.
                    </p>
                    <a href="#contact" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white underline decoration-emerald-400 underline-offset-4 transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
                        Apply to learn with us
                        <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>

            <ol className="divide-y divide-slate-200 border-y border-slate-200">
                {benefits.map(({ number, title, description, icon: Icon }) => (
                    <li key={number} className="grid grid-cols-[2.5rem_2.75rem_minmax(0,1fr)] items-start gap-3 py-5 sm:grid-cols-[3.5rem_3rem_minmax(0,1fr)] sm:gap-4 sm:py-6">
                        <span className="pt-2 text-xs font-semibold tabular-nums tracking-[0.1em] text-slate-400">{number}</span>
                        <span className="flex h-10 w-10 items-center justify-center bg-emerald-50 text-emerald-800 sm:h-11 sm:w-11">
                            <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold tracking-tight text-slate-950 sm:text-lg">{title}</h3>
                            <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">Connect with mentors and other learners in our WhatsApp group.</p>
            <a
                href="https://chat.whatsapp.com/CQwV51o9q4ZHp9kRXDM9qQ?s=cl&p=i&mlu=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
            >
                Join our WhatsApp group
            </a>
        </div>
    </section>
)

export default Benefits
