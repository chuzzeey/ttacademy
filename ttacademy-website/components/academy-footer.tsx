'use client';

import AcademyBrand from './academy-brand';
import { socialLinks } from '@/lib/social-links';
import { OPEN_ACADEMY_PAYMENT_EVENT } from '@/components/payment-proof-submission';

export default function AcademyFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner section-shell">
        <AcademyBrand />
        <nav aria-label="Footer navigation">
          <a href="/academy">Home</a>
          <a href="/academy/classroom">Classroom</a>
          <a href="/academy/courses">Courses</a>
          <a href="/academy/about">About</a>
          <a href="/academy/contact">Contact</a>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              window.dispatchEvent(new Event(OPEN_ACADEMY_PAYMENT_EVENT));
            }}
          >
            Payment
          </a>
          <a className="footer-enroll" href="/academy/about#enroll">
            Enroll
          </a>
        </nav>
        <div className="footer-meta">
          <span>Tech Trailblazer Academy · Learn deeply. Stand out.</span>
          <span>For the next generation of African tech talent.</span>
          <div className="academy-social-links" aria-label="Follow Tech Trailblazer Academy">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                aria-label={`Tech Trailblazer Academy on ${social.name}`}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: social.svg }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
