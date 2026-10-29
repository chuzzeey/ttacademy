'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Home,
  Info,
  Phone,
  ReceiptText,
  X,
} from 'lucide-react';
import AcademyBrand from './academy-brand';
import ApplicationModal from './application-modal';
import PaymentProofSubmission, {
  OPEN_ACADEMY_PAYMENT_EVENT,
} from '@/components/payment-proof-submission';

const links = [
  { label: 'Home', href: '/academy', Icon: Home },
  { label: 'Classroom', href: '/academy/classroom', Icon: GraduationCap },
  { label: 'Courses', href: '/academy/courses', Icon: BookOpen },
  { label: 'About', href: '/academy/about', Icon: Info },
  { label: 'Contact', href: '/academy/contact', Icon: Phone },
];

export default function AcademyHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const openPaymentProof = () => {
    window.dispatchEvent(new Event(OPEN_ACADEMY_PAYMENT_EVENT));
  };

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <header className="site-header academy-header">
        <div className="header-inner">
          <AcademyBrand />
          <nav className="primary-navigation" aria-label="Main navigation">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className={
                  pathname === href || (href !== '/academy' && pathname.startsWith(`${href}/`))
                    ? 'active'
                    : undefined
                }
              >
                {label}
              </a>
            ))}
            <a
              className="nav-payment-proof"
              href="#"
              onClick={(event) => {
                event.preventDefault();
                openPaymentProof();
              }}
            >
              Payment
            </a>
            <button className="nav-cta" type="button" onClick={() => setApplicationOpen(true)}>
              Enroll
            </button>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="academy-side-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="side-menu-layer">
          <button
            className="side-menu-backdrop"
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside id="academy-side-menu" className="academy-side-menu" aria-label="More navigation">
            <div className="side-menu-heading">
              <AcademyBrand />
              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X aria-hidden="true" size={20} />
              </button>
            </div>
            <nav aria-label="Academy menu">
              {links.map(({ label, href, Icon }) => (
                <a className="side-menu-link" key={label} href={href} onClick={() => setMenuOpen(false)}>
                  <Icon aria-hidden="true" size={19} />
                  <span>{label}</span>
                  <ArrowUpRight aria-hidden="true" className="side-menu-link-arrow" size={16} />
                </a>
              ))}
              <a
                className="side-menu-link"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setMenuOpen(false);
                  openPaymentProof();
                }}
              >
                <ReceiptText aria-hidden="true" size={19} />
                <span>Payment</span>
                <ArrowUpRight aria-hidden="true" className="side-menu-link-arrow" size={16} />
              </a>
            </nav>
            <div className="side-menu-footer">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setApplicationOpen(true);
                }}
              >
                Apply to the academy <ArrowUpRight aria-hidden="true" size={17} />
              </button>
            </div>
          </aside>
        </div>
      )}

      <ApplicationModal
        open={applicationOpen}
        course=""
        email=""
        onClose={() => setApplicationOpen(false)}
      />
      <PaymentProofSubmission modalOnly />
    </>
  );
}
