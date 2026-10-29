'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Search, X } from 'lucide-react';
import { classroomCourses } from '../lib/content';

export default function ClassroomPortal() {
  const [query, setQuery] = useState('');
  const visibleCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return classroomCourses.filter(
      (course) =>
        !normalizedQuery ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.description.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <main className="classroom-page">
      <section className="classroom-hero decorative">
        <div className="plus-pattern" aria-hidden="true">
          ＋　＋　＋　＋　＋<br />＋　＋　＋　＋　＋<br />＋　＋
        </div>
        <div className="dot-pattern dot-top" aria-hidden="true" />
        <div className="classroom-hero-copy">
          <p className="eyebrow">STUDENT LEARNING PORTAL</p>
          <h1>
            Your next chapter
            <br />
            starts <span>in class.</span>
          </h1>
          <p>
            Find your learning group and continue building skills that move you forward.
            Sign in with your student ID to receive a secure email verification code.
          </p>
        </div>
      </section>

      <section className="classroom-catalog section-shell">
        <div className="classroom-catalog-heading">
          <div>
            <p className="eyebrow">FIND YOUR GROUP</p>
            <h2>Explore classrooms</h2>
            <p>Choose your registered course to sign in securely.</p>
          </div>
          <label className="classroom-search">
            <Search aria-hidden="true" size={18} />
            <span className="sr-only">Search classrooms</span>
            <input
              type="search"
              placeholder="Search classrooms"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                <X aria-hidden="true" size={16} />
              </button>
            )}
          </label>
        </div>

        <p className="classroom-count">
          {visibleCourses.length} {visibleCourses.length === 1 ? 'classroom' : 'classrooms'}
        </p>
        {visibleCourses.length ? (
          <div className="classroom-grid">
            {visibleCourses.map((course) => (
              <a
                className="classroom-card"
                key={course.slug}
                href={`/academy/classroom/${course.slug}/login`}
              >
                <div className="classroom-card-image">
                  <img src={course.image} alt="" />
                  <span>CLASSROOM</span>
                </div>
                <div className="classroom-card-copy">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <span>
                    Enter class <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="classroom-empty">
            <BookOpen aria-hidden="true" size={28} />
            <h3>No classrooms found</h3>
            <p>Try a different search term.</p>
          </div>
        )}
      </section>

    </main>
  );
}
