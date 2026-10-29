'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Check, Copy, LoaderCircle, X } from 'lucide-react';
import { courses } from '../lib/content';

const countries = [
  { code: 'NG', name: 'Nigeria', dial: '+234' },
  { code: 'ZA', name: 'South Africa', dial: '+27' },
  { code: 'EG', name: 'Egypt', dial: '+20' },
  { code: 'KE', name: 'Kenya', dial: '+254' },
  { code: 'MA', name: 'Morocco', dial: '+212' },
  { code: 'ET', name: 'Ethiopia', dial: '+251' },
  { code: 'DZ', name: 'Algeria', dial: '+213' },
];

const whatsappSupportUrl =
  'https://wa.me/2348034826276?text=' +
  encodeURIComponent('Hello Tech Trailblazer Academy, I need help with my application.');
const whatsappCommunityUrl = 'https://whatsapp.com/channel/0029Vb7yD0fBA1f1GHOHqJ2l';

interface ApplicationModalProps {
  open: boolean;
  course: string;
  email: string;
  onClose: () => void;
}

export default function ApplicationModal({
  open,
  course,
  email,
  onClose,
}: ApplicationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [studentCode, setStudentCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [dialCode, setDialCode] = useState('+234');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      const scrollY = window.scrollY;
      const root = document.documentElement;
      const previousRootStyles = {
        overflow: root.style.overflow,
        overscrollBehavior: root.style.overscrollBehavior,
      };
      const previousBodyStyles = {
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
        overflow: document.body.style.overflow,
      };
      root.style.overflow = 'hidden';
      root.style.overscrollBehavior = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      setStudentCode('');
      setCopied(false);
      setError('');
      setDialCode('+234');
      dialog.showModal();
      const restorePageScroll = () => {
        root.style.overflow = previousRootStyles.overflow;
        root.style.overscrollBehavior = previousRootStyles.overscrollBehavior;
        document.body.style.position = previousBodyStyles.position;
        document.body.style.top = previousBodyStyles.top;
        document.body.style.width = previousBodyStyles.width;
        document.body.style.overflow = previousBodyStyles.overflow;
        window.scrollTo(0, scrollY);
      };
      dialog.addEventListener('close', restorePageScroll, { once: true });
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const fullName = String(data.get('full_name') ?? '').trim();
    const phone = String(data.get('phone') ?? '').replace(/\D/g, '');
    const countryCode = String(data.get('country') ?? '');
    const countryName = countries.find((item) => item.code === countryCode)?.name ?? '';
    const selectedDialCode = String(data.get('dial_code') ?? '');
    const selectedCourse = String(data.get('course') ?? '');
    const reason = String(data.get('learning_reason') ?? '').trim();

    if (fullName.split(/\s+/).length < 2) {
      setError('Please enter your first and last name.');
      return;
    }
    if (phone.length < 7 || phone.length > 14 || /^(\d)\1{4,}$/.test(phone)) {
      setError('Enter a valid WhatsApp number.');
      return;
    }
    if (!countryName || !selectedCourse || !reason) {
      setError('Complete all required fields before continuing.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          date_of_birth: data.get('date_of_birth'),
          email: String(data.get('email') ?? '').trim().toLowerCase(),
          phone_whatsapp: `${selectedDialCode}${phone}`,
          sex: data.get('sex'),
          country: countryName,
          state: String(data.get('state') ?? '').trim() || null,
          course_applying_for: selectedCourse,
          employment_status: data.get('employment_status'),
          has_laptop: data.get('has_laptop'),
          heard_about_us: 'registration',
          learning_reason: reason,
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

      const code = result.data?.student_code;
      if (typeof code !== 'string' || !code.trim()) {
        throw new Error('Your application was received, but we could not retrieve your student ID. Please contact support.');
      }
      setStudentCode(code);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit your application. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyStudentCode = async () => {
    try {
      await navigator.clipboard.writeText(studentCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      console.error('Unable to copy the student ID:', copyError);
      setError('Unable to copy the student ID. Select and copy it manually.');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="application-dialog"
      aria-labelledby="application-dialog-title"
      onClose={handleClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
    >
      <div className="application-dialog-card" data-lenis-prevent>
        <button
          className="application-dialog-close"
          type="button"
          aria-label="Close application"
          onClick={() => dialogRef.current?.close()}
        >
          <X aria-hidden="true" size={20} />
        </button>

        {studentCode ? (
          <section className="application-success" aria-live="polite">
            <span className="application-success-icon">
              <Check aria-hidden="true" size={28} />
            </span>
            <p className="eyebrow">APPLICATION RECEIVED</p>
            <h2 id="application-dialog-title">Your next chapter starts here.</h2>
            <p>Your application is saved. Keep your student ID safe:</p>
            <div className="student-code">
              <strong>{studentCode}</strong>
              <button type="button" onClick={() => void copyStudentCode()} aria-label="Copy student ID">
                {copied ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
              </button>
            </div>
            <p className="application-verification">
              Once your classroom access is approved, use this ID to sign in. We’ll send a one-time
              verification code to your registered email.
            </p>
            <a className="whatsapp-button" href={whatsappSupportUrl} target="_blank" rel="noreferrer">
              Need help? Verify with our team on WhatsApp
            </a>
            <a
              className="community-button"
              href={whatsappCommunityUrl}
              target="_blank"
              rel="noreferrer"
            >
              Join our WhatsApp community
            </a>
            <button className="application-done" type="button" onClick={() => dialogRef.current?.close()}>
              Done
            </button>
          </section>
        ) : (
          <>
            <p className="eyebrow">ACADEMY APPLICATION</p>
            <h2 id="application-dialog-title">Tell us a little about yourself.</h2>
            <p className="application-intro">
              Complete your details to apply for {course || 'your selected program'}.
            </p>
            {error && (
              <p className="application-error" role="alert">
                {error}
              </p>
            )}
            <form key={`${course}:${email}`} className="application-form" onSubmit={submitApplication}>
              <fieldset disabled={submitting}>
                <legend>Personal information</legend>
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
                <h3>Contact details</h3>
                <label>
                  Email address *
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={email}
                    required
                  />
                </label>
                <label>
                  WhatsApp number *
                  <span className="phone-input">
                    <select
                      name="dial_code"
                      aria-label="Country calling code"
                      value={dialCode}
                      onChange={(event) => setDialCode(event.target.value)}
                    >
                      {countries.map((item) => (
                        <option key={item.code} value={item.dial}>
                          {item.dial}
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
                <h3>About you</h3>
                <div className="application-form-grid">
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
                        const selectedCountry = countries.find((item) => item.code === event.target.value);
                        if (selectedCountry) setDialCode(selectedCountry.dial);
                      }}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {countries.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.name}
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
                    <select name="course" defaultValue={course} required>
                      <option value="" disabled>
                        Select a program
                      </option>
                      {courses.map((item) => (
                        <option key={item.title} value={item.title}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Employment status *
                    <select name="employment_status" defaultValue="" required>
                      <option value="" disabled>
                        Select
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
                        Select
                      </option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </label>
                </div>
                <label>
                  Why do you want to learn this skill? *
                  <textarea name="learning_reason" rows={3} required maxLength={1500} />
                </label>
              </fieldset>
              <button className="application-submit" type="submit" disabled={submitting}>
                {submitting && <LoaderCircle aria-hidden="true" size={18} className="spinner" />}
                {submitting ? 'Submitting your application…' : 'Submit application'}
              </button>
              <p className="application-privacy">
                Your details are used to process your academy application.
              </p>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
