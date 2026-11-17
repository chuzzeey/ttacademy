import type { Metadata } from 'next';
import AcademyHeader from '../../ttacademy-website/components/academy-header';
import AcademyFooter from '../../ttacademy-website/components/academy-footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tech Trailblazer Academy',
  description:
    'Build your future in tech with affordable, in-depth learning and mentorship from Tech Trailblazer Academy.',
  metadataBase: new URL('https://www.techtblazeracademy.com'),
  openGraph: {
    url: 'https://www.techtblazeracademy.com',
    images: [{ url: '/academy-logo.webp', alt: 'Tech Trailblazer Academy' }],
  },
  twitter: {
    images: ['/academy-logo.webp'],
  },
};

export default function AcademyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="academy-shell">
      <AcademyHeader />
      {children}
      <AcademyFooter />
    </div>
  );
}
