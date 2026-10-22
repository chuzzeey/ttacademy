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
    <section id="benefits-section" aria-labelledby="benefits-title" className="scroll-mt-16 bg-[#f7f8f7] px-5 py-16 sm:px-8 sm:py-20 md:scroll-mt-20 lg:px-10">
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1ebe5d] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 motion-reduce:transform-none"
            >
                <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.327-1.682a9.86 9.86 0 0 0 5.26 1.483h.004c5.45 0 9.884-4.434 9.884-9.884 0-2.64-1.03-5.122-2.898-6.988z" />
                </svg>
                Join our WhatsApp group
            </a>
        </div>
    </section>
)

export default Benefits
