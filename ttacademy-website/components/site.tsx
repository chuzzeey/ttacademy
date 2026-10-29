'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { benefits, courses, values } from '../lib/content';
import { courseIcons } from '../../lib/course-icons';
import { socialLinks } from '../../lib/social-links';
import ApplicationModal from './application-modal';

type SitePage = 'home' | 'courses' | 'about' | 'contact';

const applicationCountries = [
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'EG', name: 'Egypt', dial: '+20' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'MA', name: 'Morocco', dial: '+212' },
  { code: 'ET', name: 'Ethiopia', dial: '+251' },
  { code: 'DZ', name: 'Algeria', dial: '+213' },
];

export default function Site({ page }: { page: SitePage }) {
  const communityVideoRef = useRef<HTMLVideoElement>(null);
  const communityVideoAttemptedRef = useRef(false);
  const communityVideoPausedByUserRef = useRef(false);
  const [communityVideoMessage, setCommunityVideoMessage] = useState('');
  const [openCourse, setOpenCourse] = useState('AI Automation');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollStudentCode, setEnrollStudentCode] = useState('');
  const [enrollDialCode, setEnrollDialCode] = useState('+234');
  const [processing, setProcessing] = useState(false);
  const [proceedError, setProceedError] = useState('');
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [applicationCourse, setApplicationCourse] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const featuredCourses = [courses[4], courses[5], courses[6]];

  const submitEnrollment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (enrollSubmitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get('full_name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').replace(/\D/g, '');
    const selectedCountry = applicationCountries.find(
      (country) => country.name === data.get('country'),
    );
    setEnrollSubmitting(true);
    setEnrollError('');

    try {
      if (fullName.split(/\s+/).length < 2) {
        throw new Error('Please enter your first and last name.');
      }
      if (phone.length < 7 || phone.length > 14 || /^(\d)\1{4,}$/.test(phone)) {
        throw new Error('Enter a valid WhatsApp number.');
      }
      if (!selectedCountry) {
        throw new Error('Select your country.');
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          date_of_birth: data.get('date_of_birth'),
          email: String(data.get('email') ?? '').trim().toLowerCase(),
          phone_whatsapp: `${enrollDialCode}${phone}`,
          sex: data.get('sex'),
          country: selectedCountry.name,
          state: String(data.get('state') ?? '').trim() || null,
          course_applying_for: data.get('course'),
          employment_status: data.get('employment_status'),
          has_laptop: data.get('has_laptop'),
          heard_about_us: 'academy-enroll-form',
          learning_reason: String(data.get('learning_reason') ?? '').trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.code === 'EMAIL_EXISTS'
            ? 'This email is already registered. Contact support if you need help accessing your existing account.'
            : typeof result.error === 'string'
              ? result.error
              : 'Unable to submit your application. Please try again.',
        );
      }

      if (typeof result.data?.student_code !== 'string' || !result.data.student_code.trim()) {
        throw new Error(
          'Your application was received, but we could not retrieve your student ID. Please contact support.',
        );
      }
      setEnrollStudentCode(result.data.student_code);
    } catch (submitError) {
      console.error('Unable to submit Academy enrollment:', submitError);
      setEnrollError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit your application. Please try again.',
      );
    } finally {
      setEnrollSubmitting(false);
    }
  };

  useEffect(() => {
    if (page !== 'about') return;

    const video = communityVideoRef.current;
    if (!video) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigation?.type === 'reload') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    if (video.readyState >= 1) {
      video.currentTime = 0;
    }

    let videoIsVisible = false;
    let observer: IntersectionObserver;
    const startVideoFromBeginning = () => {
      if (
        !videoIsVisible ||
        video.readyState < 1 ||
        communityVideoAttemptedRef.current ||
        communityVideoPausedByUserRef.current
      ) {
        return;
      }

      communityVideoAttemptedRef.current = true;
      video.currentTime = 0;
      observer.disconnect();
      void video.play().catch((playError: unknown) => {
        if (playError instanceof Error && playError.name === 'NotAllowedError') {
          setCommunityVideoMessage(
            'Your browser blocked autoplay with sound. Press play to start the video.',
          );
          return;
        }

        console.error('Unable to autoplay the academy community video:', playError);
        setCommunityVideoMessage('The video could not start automatically. Press play to retry.');
      });
    };

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        videoIsVisible = Boolean(entry?.isIntersecting);
        startVideoFromBeginning();
      },
      { threshold: 0.35 },
    );

    video.addEventListener('loadedmetadata', startVideoFromBeginning);
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener('loadedmetadata', startVideoFromBeginning);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [page]);

  const proceedToApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (processing) return;

    const formData = new FormData(event.currentTarget);
    const selectedCourse = String(formData.get('program') ?? '');
    const email = String(formData.get('email') ?? '').trim();
    if (!selectedCourse) {
      setProceedError('Please select a program.');
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProceedError('Enter a valid email address to continue.');
      return;
    }

    setProceedError('');
    setProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1100));
    setApplicationCourse(selectedCourse);
    setApplicationEmail(email);
    setApplicationOpen(true);
    setProcessing(false);
  };

  const openApplication = (selectedCourse: string) => {
    setApplicationCourse(selectedCourse);
    setApplicationEmail('');
    setApplicationOpen(true);
  };

  return (
    <div className="site" data-page={page}>
      {page === 'home' && (
        <main>
          <section className="home-hero decorative">
            <div className="plus-pattern" aria-hidden="true">
              ＋　＋　＋　＋　＋<br />＋　＋　＋　＋　＋<br />＋　＋
            </div>
            <div className="dot-pattern dot-top" aria-hidden="true" />
            <div className="hero-content">
              <h1>
                Learn deeply.
                <br />
                <span>Stand out.</span>
              </h1>
              <p>
                For the next generation of African tech talent. Learn practical skills, build real
                projects, and grow with a community that helps you move forward.
              </p>
            </div>
            <form className="quick-form" onSubmit={(event) => void proceedToApplication(event)}>
              <h2>Start your next chapter.</h2>
              <label htmlFor="quick-program">Select your program</label>
              <select id="quick-program" name="program" required defaultValue="">
                <option value="" disabled>
                  Please select
                </option>
                {courses.map((course) => (
                  <option key={course.title} value={course.title}>
                    {course.title}
                  </option>
                ))}
              </select>
              <label htmlFor="quick-email">Email</label>
              <input
                id="quick-email"
                name="email"
                type="email"
                placeholder="Please enter email"
                autoComplete="email"
                required
              />
              {proceedError && (
                <p className="application-error" role="alert">
                  {proceedError}
                </p>
              )}
              <button className="quick-form-submit" type="submit" disabled={processing}>
                Proceed
              </button>
            </form>
            <div className="dot-pattern dot-bottom" aria-hidden="true" />
          </section>

          <section className="programs-section">
            <div className="section-shell">
              <p className="eyebrow eyebrow-lime">ACADEMY PROGRAMS</p>
              <h2>Find your path. Build skills that move you forward.</h2>
              <div className="program-cards">
                {featuredCourses.map((course) => (
                  <article className="program-card" key={course.title}>
                    <div className="program-title">
                      <h3>{course.title}</h3>
                      <span className="program-icon" aria-hidden="true">
                        {course.icon}
                      </span>
                    </div>
                    <p>{course.description}</p>
                    <div className="card-bottom">
                      <span>Structured learning</span>
                      <a href="/academy/courses">Learn More</a>
                    </div>
                  </article>
                ))}
              </div>
              <a className="small-cta" href="/academy/courses">
                View all courses
              </a>
            </div>
          </section>

          <section className="learner-section">
            <div className="section-shell">
              <p className="eyebrow">LEARNER EXPERIENCE</p>
              <h2>Learn by doing. Grow with every project.</h2>
              <div className="experience-cards">
                <article className="experience-card">
                  <p>
                    Practice on meaningful briefs, explain your decisions, and leave with work you
                    can confidently show.
                  </p>
                  <div>
                    <span className="avatar">P</span>
                    <p>
                      <strong>Project-Based Learning</strong>
                      <small>Build, test, refine, and present.</small>
                    </p>
                  </div>
                </article>
                <article className="experience-card">
                  <p>
                    Learn alongside motivated peers and get feedback that helps you turn ideas into
                    stronger solutions.
                  </p>
                  <div>
                    <span className="avatar">C</span>
                    <p>
                      <strong>Collaborative Community</strong>
                      <small>Share progress, critique, and grow together.</small>
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="testimonial-section section-shell">
            <p className="eyebrow">THE TRAILBLAZER JOURNEY</p>
            <h2>
              Learn. Grow. <span>Succeed.</span>
            </h2>
            <div className="testimonial-cards">
              <article className="testimonial muted">
                <span>01</span>
                <p>Build practical skills through structured lessons and hands-on practice.</p>
                <small>LEARN WITH PURPOSE</small>
              </article>
              <article className="testimonial">
                <span>02</span>
                <p>Grow your confidence by creating projects and learning with a community.</p>
                <small>GROW THROUGH PRACTICE</small>
              </article>
              <article className="testimonial muted">
                <span>03</span>
                <p>Show what you can do and take your next step in the world of technology.</p>
                <small>MAKE YOUR NEXT MOVE</small>
              </article>
            </div>
          </section>

          <section className="story-section" id="about-story">
            <div className="story-overlay">
              <h2>For the next generation of African tech talent.</h2>
              <h3>Learn deeply. Stand out.</h3>
              <p>
                At Tech Trailblazer Academy, we believe practical education, mentorship, and a
                supportive community can open new paths. Our programs help learners build confidence,
                create meaningful projects, and prepare for their next opportunity.
              </p>
            </div>
          </section>

          <section className="journey-cta decorative">
            <div className="dot-pattern cta-dots-left" aria-hidden="true" />
            <div>
              <h2>
                Learn deeply.
                <br />
                Stand out.
              </h2>
              <p>
                Join the next generation of African tech talent. Start learning,
                <br className="desktop-break" /> build with purpose, and grow into what’s next.
              </p>
              <a href="/academy/about#enroll">Become a Tech Trailblazer</a>
            </div>
            <div className="dot-pattern cta-dots-right" aria-hidden="true" />
          </section>
        </main>
      )}

      {page === 'courses' && (
        <main className="courses-page">
          <section className="courses-hero decorative">
            <div className="plus-pattern" aria-hidden="true">
              ＋　＋　＋　＋　＋<br />＋　＋　＋　＋　＋<br />＋　＋
            </div>
            <div className="dot-pattern dot-top" aria-hidden="true" />
            <h1>
              Your Journey Into Tech
              <br />
              Starts <span>Here.</span> <b aria-hidden="true">↘</b>
            </h1>
            <div className="dot-pattern dot-bottom" aria-hidden="true" />
          </section>
          <section className="course-list">
            {courses.map((course) => {
              const isOpen = openCourse === course.title;
              const CourseIcon = courseIcons[course.title];
              return (
                <article className={`course-item${isOpen ? ' is-open' : ''}`} key={course.title}>
                  <button
                    className="course-toggle"
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenCourse(isOpen ? '' : course.title)}
                  >
                    <span className="course-title">
                      <span>{course.title}</span>
                      <CourseIcon className="course-course-icon" aria-hidden="true" />
                    </span>
                    <span className="toggle-icon" aria-hidden="true">
                      {isOpen ? '×' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="course-detail">
                      <img src={course.image} alt={`${course.title} course`} />
                      <p>{course.description}</p>
                      <p className="duration">
                        <strong>Duration:</strong> 4 months
                      </p>
                      <p className="curriculum-title">CURRICULUM:</p>
                      <ol className="curriculum">
                        {course.curriculum.map((module, index) => (
                          <li key={module}>
                            Module {index + 1}: {module}
                          </li>
                        ))}
                      </ol>
                      <p className="price">
                        Price: <del>400,000</del> NOW <strong>50,000</strong>
                      </p>
                      <div className="course-footer">
                        <strong>Structured learning</strong>
                        <button type="button" onClick={() => openApplication(course.title)}>
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
          <JourneyCallout />
        </main>
      )}

      {page === 'about' && (
        <main>
          <section className="about-hero decorative">
            <div className="plus-pattern" aria-hidden="true">
              ＋　＋　＋　＋　＋<br />＋　＋　＋　＋　＋<br />＋　＋
            </div>
            <div className="dot-pattern dot-top" aria-hidden="true" />
            <h1>
              Empowering the Next
              <br />
              Generation of <span>African<br />Tech Talent.</span>
            </h1>
            <p>
              We believe that high-quality tech education should not be a luxury—it
              <br className="desktop-break" /> should be an accessible bridge to financial freedom
              and global
              <br className="desktop-break" /> opportunities.
            </p>
            <img
              className="about-hero-photo"
              src="https://res.cloudinary.com/qz5m8bhg/image/upload/v1793266219/IMG_1822.JPG_tsd8bw.jpg"
              alt="A moment from Tech Trailblazer Academy"
              loading="lazy"
            />
            <div className="dot-pattern dot-bottom" aria-hidden="true" />
          </section>
          <section className="about-media-section">
            <div className="section-shell">
              <div className="about-media-heading">
                <p className="eyebrow">OUR COMMUNITY</p>
                <h2>Meet the people and moments behind the journey.</h2>
                <p>
                  A glimpse into the community learning, building, and growing together at Tech
                  Trailblazer Academy.
                </p>
              </div>
              <div className="about-media-grid">
                <figure className="about-video-card">
                  <video
                    ref={communityVideoRef}
                    controls
                    playsInline
                    muted={false}
                    preload="metadata"
                    onPlay={() => setCommunityVideoMessage('')}
                    onPause={() => {
                      if (communityVideoAttemptedRef.current) {
                        communityVideoPausedByUserRef.current = true;
                      }
                    }}
                  >
                    <source
                      src="https://res.cloudinary.com/qz5m8bhg/video/upload/f_mp4,vc_h264,q_auto/v1793266233/IMG_6440_dcpdd9.mov"
                      type="video/mp4"
                    />
                    Your browser does not support video playback.
                  </video>
                  <figcaption aria-live="polite">
                    {communityVideoMessage || 'Hear from our academy community.'}
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>
          <section className="about-intro section-shell">
            <div>
              <p className="eyebrow">WHO WE ARE</p>
              <p>
                We are Africa’s leading tech training platform dedicated to transforming passionate
                learners into industry-ready tech professionals. Unlike fast-paced bootcamps that
                rush through complex concepts, we prioritize deep, long-term learning. We give our
                students the time, hands-on practice, and personal support needed to master
                high-demand tech skills with complete confidence.
              </p>
            </div>
            <article className="mission-card">
              <span>↗</span>
              <h2>Our Mission</h2>
              <p>
                To make world-class tech education affordable for every African student and aspiring
                professional, while creating direct pathways to jobs and lifelong career success.
              </p>
            </article>
          </section>
          <section className="approach-section">
            <div className="approach-inner section-shell">
              <div>
                <p className="eyebrow">OUR APPROACH</p>
                <h2>
                  Why Learn
                  <br />
                  With Us?
                </h2>
                <div className="dot-pattern approach-dots" />
              </div>
              <div className="benefit-list">
                {benefits.map((benefit) => (
                  <article key={benefit.title}>
                    <span className="check">✓</span>
                    <div>
                      <h3>{benefit.title}:</h3>
                      <p>{benefit.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <section className="enroll-section" id="enroll">
            <div className="enroll-inner section-shell">
              <div className="enroll-copy">
                <p className="eyebrow eyebrow-lime">ENROLL</p>
                <h2>
                  Your journey into
                  <br />
                  tech starts <span>here.</span>
                </h2>
                <p>
                  Take the first step. Share your interests and goals so we can help you explore a
                  learning path that fits you.
                </p>
                <ol>
                  <li>
                    <span>01</span>
                    <div>
                      <strong>Express your interest</strong>
                      <small>Tell us what you want to learn.</small>
                    </div>
                  </li>
                  <li>
                    <span>02</span>
                    <div>
                      <strong>Explore your options</strong>
                      <small>Discuss programs, requirements and fees.</small>
                    </div>
                  </li>
                  <li>
                    <span>03</span>
                    <div>
                      <strong>Choose your next step</strong>
                      <small>Decide when you’re ready to begin.</small>
                    </div>
                  </li>
                </ol>
                <div className="dot-pattern enroll-dots" />
              </div>
              <form
                className="interest-form application-inline-form"
                onSubmit={submitEnrollment}
              >
                {enrollStudentCode ? (
                  <div className="inline-application-success" role="status">
                    <span className="eyebrow">APPLICATION RECEIVED</span>
                    <h3>Your next chapter starts here.</h3>
                    <p>Your application is saved. Keep your student ID safe:</p>
                    <strong>{enrollStudentCode}</strong>
                    <small>We’ll send a one-time verification code to your registered email.</small>
                  </div>
                ) : (
                  <>
                    <p className="eyebrow">ACADEMY APPLICATION</p>
                    <h3>Tell us a little about yourself.</h3>
                    <p>Complete your details to apply for your selected program.</p>
                    <fieldset disabled={enrollSubmitting}>
                      <section className="inline-form-section">
                        <h4>Personal information</h4>
                        <div className="inline-form-grid">
                          <label>
                            Full name *
                            <input name="full_name" autoComplete="name" required minLength={3} />
                          </label>
                          <label>
                            Date of birth *
                            <input
                              name="date_of_birth"
                              type="date"
                              autoComplete="bday"
                              max={new Date().toISOString().slice(0, 10)}
                              onClick={(event) => event.currentTarget.showPicker()}
                              required
                            />
                          </label>
                        </div>
                      </section>
                      <section className="inline-form-section">
                        <h4>Contact details</h4>
                        <div className="inline-form-grid">
                          <label>
                            Email address *
                            <input name="email" type="email" autoComplete="email" required />
                          </label>
                          <label>
                            WhatsApp number *
                            <span className="inline-phone-input">
                              <select
                                name="dial_code"
                                aria-label="Country calling code"
                                value={enrollDialCode}
                                onChange={(event) => setEnrollDialCode(event.target.value)}
                              >
                                {applicationCountries.map((country) => (
                                  <option key={country.code} value={country.dial}>
                                    {country.dial}
                                  </option>
                                ))}
                              </select>
                              <input
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                minLength={7}
                                maxLength={14}
                                required
                              />
                            </span>
                          </label>
                        </div>
                      </section>
                      <section className="inline-form-section">
                        <h4>About you</h4>
                        <div className="inline-form-grid">
                          <label>
                            Sex *
                            <select name="sex" defaultValue="" required>
                              <option value="" disabled>
                                Select
                              </option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </label>
                          <label>
                            Country *
                            <select
                              name="country"
                              defaultValue=""
                              required
                              onChange={(event) => {
                                const selectedCountry = applicationCountries.find(
                                  (country) => country.name === event.target.value,
                                );
                                if (selectedCountry) setEnrollDialCode(selectedCountry.dial);
                              }}
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              {applicationCountries.map((country) => (
                                <option key={country.code} value={country.name}>
                                  {country.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            State / province
                            <input name="state" autoComplete="address-level1" />
                          </label>
                          <label>
                            Program *
                            <select name="course" defaultValue="" required>
                              <option value="" disabled>
                                Select a program
                              </option>
                              {courses.map((course) => (
                                <option key={course.title} value={course.title}>
                                  {course.title}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label>
                            Employment status *
                            <select name="employment_status" defaultValue="" required>
                              <option value="" disabled>
                                Select status
                              </option>
                              <option value="employed">Employed</option>
                              <option value="unemployed">Unemployed</option>
                              <option value="student">Student</option>
                              <option value="freelancer">Freelancer</option>
                            </select>
                          </label>
                          <label>
                            Do you have a laptop? *
                            <select name="has_laptop" defaultValue="" required>
                              <option value="" disabled>
                                Select option
                              </option>
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </label>
                        </div>
                      </section>
                      <label>
                        Why do you want to learn this skill? *
                        <textarea name="learning_reason" rows={3} maxLength={1500} required />
                      </label>
                    </fieldset>
                    {enrollError && (
                      <p className="error-message" role="alert">
                        {enrollError}
                      </p>
                    )}
                    <button className="lime-button" type="submit" disabled={enrollSubmitting}>
                      {enrollSubmitting ? 'Submitting your application…' : 'Submit application'}
                      {!enrollSubmitting && <span>↗</span>}
                    </button>
                    <small>Your details are used to process your academy application.</small>
                  </>
                )}
              </form>
            </div>
          </section>
          <section className="values-section section-shell">
            <div className="statements">
              <article>
                <p className="eyebrow">VISION STATEMENT</p>
                <p>
                  To become Africa’s leading tech career launchpad—empowering millions of students
                  and aspiring professionals with affordable, deep technical mastery and direct
                  pathways to global career success.
                </p>
              </article>
              <article>
                <p className="eyebrow">MISSION STATEMENT</p>
                <p>
                  To break down financial barriers to tech education by providing affordable,
                  long-term learning programs backed by hands-on mentorship, practical
                  job-opportunity creation, and the strategic guidance needed to help every student
                  stand out in the global market.
                </p>
              </article>
            </div>
            <hr />
            <h2>Core Values</h2>
            <div className="values-grid">
              {values.map((value, index) => (
                <article key={value.title}>
                  <span>{index + 1}</span>
                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}

      {page === 'contact' && (
        <main>
          <section className="contact-hero decorative">
            <div className="plus-pattern" aria-hidden="true">
              ＋　＋　＋　＋　＋<br />＋　＋　＋　＋　＋<br />＋　＋
            </div>
            <div className="dot-pattern dot-top" aria-hidden="true" />
            <div>
              <h1>
                Your next chapter starts
                <br />
                with a <span>conversation.</span>
              </h1>
              <p>
                Have a question about learning with us?
                <br />
                Tell us where you are in your tech journey. We’ll help you explore your
                <br className="desktop-break" /> next step.
              </p>
            </div>
            <div className="dot-pattern dot-bottom" aria-hidden="true" />
          </section>
          <section className="guidance-section">
            <div className="section-shell">
              <div className="guidance-heading">
                <h2>A little guidance before you begin.</h2>
                <span>FOR PROSPECTIVE STUDENTS</span>
              </div>
              <div className="guidance-grid">
                <article>
                  <i />
                  <h3>New to tech?</h3>
                  <p>
                    Tell us about your interests and experience—even if you’re starting from zero.
                    Ask which learning path may suit you.
                  </p>
                </article>
                <article>
                  <i />
                  <h3>Balancing study with life?</h3>
                  <p>
                    Share your schedule and ask about the expected learning commitment so you can
                    plan with confidence.
                  </p>
                </article>
                <article>
                  <i />
                  <h3>Questions about affordability?</h3>
                  <p>
                    Ask about current fees and available payment options. Get the details you need
                    before deciding to enroll.
                  </p>
                </article>
              </div>
            </div>
          </section>
          <section className="social-contact-section section-shell" aria-labelledby="social-contact-title">
            <div className="social-contact-heading">
              <p className="eyebrow eyebrow-lime">STAY CONNECTED</p>
              <h2 id="social-contact-title">Connect with Tech Trailblazer Academy.</h2>
              <p>Follow our channels for updates, inspiration, and ways to get in touch.</p>
            </div>
            <div className="social-contact-grid">
              {socialLinks.map((social) => (
                <a
                  className="social-contact-card"
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.name}: ${social.handle}`}
                >
                  <span className="social-contact-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: social.svg }} />
                  </span>
                  <span className="social-contact-copy">
                    <strong>{social.name}</strong>
                    <small>{social.handle}</small>
                  </span>
                  <span className="social-contact-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
        </main>
      )}

      {processing && (
        <div className="proceed-processing-overlay" role="status" aria-live="polite">
          <div className="proceed-processing-content">
            <div className="processing-orbit">
              <span className="processing-dots" aria-hidden="true" />
              <p className="processing-word">Processing</p>
            </div>
            <p className="processing-caption">Preparing your application</p>
          </div>
        </div>
      )}
      <ApplicationModal
        open={applicationOpen}
        course={applicationCourse}
        email={applicationEmail}
        onClose={() => setApplicationOpen(false)}
      />

    </div>
  );
}

function JourneyCallout() {
  return (
    <section className="journey-cta decorative">
      <div className="dot-pattern cta-dots-left" aria-hidden="true" />
      <div>
        <h2>
          Ready to start your
          <br />
          journey?
        </h2>
        <p>
          Take the next step toward practical skills, real projects, and a
          <br className="desktop-break" /> community built around innovation.
        </p>
        <a href="/academy/about#enroll">Become a Tech Trailblazer</a>
      </div>
      <div className="dot-pattern cta-dots-right" aria-hidden="true" />
    </section>
  );
}
