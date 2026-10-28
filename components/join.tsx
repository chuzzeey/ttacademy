import Image from 'next/image'
import SocialFollowButton from './social-follow-button'

const learners = ['/stud1.jpeg', '/stud2.jpeg', '/stud3.jpeg', '/stud4.jpeg']

const Join = () => (
    <section id="join-section" aria-labelledby="community-title" className="scroll-mt-16 bg-slate-900 px-5 py-14 text-white sm:px-8 sm:py-16 md:scroll-mt-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-300">Community</p>
                <h2 id="community-title" className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                    Learn alongside a community.
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                    Start your learning journey now and connect with other learners.
                </p>
                <div className="mt-6">
                    <SocialFollowButton />
                </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Learners in the community">
                {learners.map((src, index) => (
                    <div key={src} className={`relative aspect-[4/5] overflow-hidden bg-slate-800 ${index % 2 === 1 ? 'mt-5' : ''}`}>
                        <Image
                            src={src}
                            alt={`Tech Trailblazer learner ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 22vw, (max-width: 1024px) 18vw, 13vw"
                            quality={75}
                            loading="lazy"
                            className="object-cover transition duration-500 hover:scale-105 motion-reduce:transform-none"
                        />
                    </div>
                ))}
            </div>
        </div>
    </section>
)

export default Join
