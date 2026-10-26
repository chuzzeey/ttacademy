'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, BookOpen, Search, X } from 'lucide-react'
import { useState } from 'react'
import { COURSE_CATALOG } from '@/lib/course-catalog'

const courses = COURSE_CATALOG

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-[#f5f7f5] text-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-[34rem] h-96 w-96 rounded-full bg-teal-200/25 blur-3xl" />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#102a56] via-[#174ea6] to-[#123b79] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-[30rem] w-[30rem] rounded-full border border-white/[0.08]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-2 top-10 h-[22rem] w-[22rem] rounded-full border border-white/[0.08]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-9 lg:px-10 lg:pb-20">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-emerald-50/90 transition hover:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08]"><BookOpen aria-hidden="true" className="h-4 w-4" /></span>
            Tech Trailblazer Academy
          </Link>

          <div className="mt-14 max-w-3xl md:mt-20">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100/15 bg-white/[0.08] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Teacher portal
            </div>
            <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-6xl">
              Lead the learning.
              <span className="block text-emerald-200">Choose your classroom.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base sm:leading-7">
              Open your assigned class to connect with students, share announcements, and guide the conversation.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Your teaching space</p>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">Explore classrooms</h2>
            <p className="mt-1.5 text-sm text-slate-500">Select your assigned course to sign in securely.</p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search classrooms</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search classrooms"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X aria-hidden="true" className="h-4 w-4" /></button>}
          </label>
        </div>

        <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
          <span>{filteredCourses.length} {filteredCourses.length === 1 ? 'classroom' : 'classrooms'}</span>
          {searchTerm && <span>Results for “{searchTerm}”</span>}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 px-5 py-16 text-center">
            <Search aria-hidden="true" className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-800">No classrooms found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different course name or search term.</p>
            <button type="button" onClick={() => setSearchTerm('')} className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">Clear search</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <Link
                key={course.slug}
                href={`/teachers/login/${course.slug}`}
                className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_-6px_rgba(15,23,42,.12)] transition duration-300 hover:-translate-y-1 hover:border-emerald-700/25 hover:shadow-[0_22px_50px_-24px_rgba(6,78,59,.28)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-emerald-950">
                  <Image src={course.image} alt="" fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071f17]/75 via-transparent to-black/10" />
                  <span className="absolute bottom-3 left-4 right-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80">Classroom</span>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-800">{course.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">{course.description}</p>
                  <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                      Open classroom
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}