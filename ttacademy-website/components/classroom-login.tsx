'use client';

import { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, LoaderCircle, MailCheck, ShieldCheck } from 'lucide-react';
import AcademyBrand from './academy-brand';
import { COURSE_CATALOG } from '../../lib/course-catalog';

export default function ClassroomLogin() {
  const params = useParams<{ course: string }>();
  const router = useRouter();
  const course = COURSE_CATALOG.find((item) => item.slug === params.course);
  const [studentCode, setStudentCode] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/classroom/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginType: 'student',
          courseSlug: course?.slug,
          studentCode: studentCode.trim().toUpperCase(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send a verification code.');
      setChallengeId(result.challengeId);
      setMaskedEmail(result.maskedEmail);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Unable to send a verification code.',
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/classroom/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, code: otp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to verify this code.');
      const verifiedCourseSlug = course?.slug;
      if (!verifiedCourseSlug || result.role !== 'student' || result.courseSlug !== verifiedCourseSlug) {
        throw new Error('This verification code is not for this classroom.');
      }
      setVerified(true);
      window.setTimeout(() => {
        router.replace(`/academy/classroom/${verifiedCourseSlug}/dashboard`);
        router.refresh();
      }, 700);
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Unable to verify this code.');
    } finally {
      setLoading(false);
    }
  };

  if (!course) {
    return (
      <main className="classroom-login-page">
        <section className="classroom-login-card">
          <h1>Classroom not found</h1>
          <a className="classroom-login-link" href="/academy/classroom">
            Return to classrooms
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="classroom-login-page">
      <a className="classroom-login-back" href="/academy/classroom">
        <ArrowLeft aria-hidden="true" size={16} /> All classrooms
      </a>
      <section className="classroom-login-card">
        <AcademyBrand className="classroom-login-brand" />
        <p className="eyebrow">STUDENT LEARNING PORTAL</p>
        <h1>{verified ? 'You’re verified!' : 'Welcome to your classroom'}</h1>
        <p className="classroom-login-course">{course.title}</p>

        {verified ? (
          <div className="classroom-login-success" role="status">
            <CheckCircle2 aria-hidden="true" size={38} />
            <p>Opening your classroom…</p>
            <LoaderCircle aria-hidden="true" size={20} className="spinner" />
          </div>
        ) : (
          <>
            <p className="classroom-login-intro">
              {challengeId
                ? `Enter the six-digit verification code sent to ${maskedEmail}.`
                : 'Enter the student ID on your application. If your classroom access is approved, we’ll email you a one-time sign-in code.'}
            </p>
            {error && (
              <p className="classroom-login-error" role="alert">
                {error}
              </p>
            )}
            {!challengeId ? (
              <form className="classroom-login-form" onSubmit={(event) => void requestCode(event)}>
                <label htmlFor="student-code">Student ID</label>
                <input
                  id="student-code"
                  autoComplete="username"
                  value={studentCode}
                  onChange={(event) => setStudentCode(event.target.value.toUpperCase())}
                  placeholder="TTA-12345A"
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? (
                    <LoaderCircle aria-hidden="true" size={18} className="spinner" />
                  ) : (
                    <MailCheck aria-hidden="true" size={18} />
                  )}
                  {loading ? 'Checking ID…' : 'Send verification code'}
                </button>
              </form>
            ) : (
              <form className="classroom-login-form" onSubmit={(event) => void verifyCode(event)}>
                <div className="classroom-code-note">
                  <ShieldCheck aria-hidden="true" size={19} />
                  The secure code expires in 15 minutes. Check your inbox and spam folder.
                </div>
                <label htmlFor="classroom-otp">Six-digit code</label>
                <input
                  id="classroom-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                />
                <button type="submit" disabled={loading || otp.length !== 6}>
                  {loading && <LoaderCircle aria-hidden="true" size={18} className="spinner" />}
                  {loading ? 'Verifying…' : 'Verify and enter class'}
                </button>
                <button
                  className="classroom-login-secondary"
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setChallengeId('');
                    setOtp('');
                    setError('');
                  }}
                >
                  Use a different student ID
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}
