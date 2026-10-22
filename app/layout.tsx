import { Noto_Sans } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/smooth-scroll";
import { QueryProvider } from "@/lib/query-provider";
import { BRAND_LOGO_URL } from "@/lib/brand";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "Tech Trailblazer Academy - We Tech Different",
  description: "Join Tech Trailblazer Academy and master cutting-edge tech skills through practical, hands-on online learning. From coding to cybersecurity, we teach tech differently with real-world projects, expert mentors, and career-focused training that actually works.",
  keywords: "tech academy, online tech courses, coding bootcamp, web development, cybersecurity, data science, practical tech training, hands-on learning, tech skills, programming courses, tech education, career development",
  authors: [{ name: "Tech Trailblazer Academy" }],
  creator: "Tech Trailblazer Academy",
  publisher: "Tech Trailblazer Academy",
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/djdbcoyot/image/upload/v1792461501/f71wqoiubyqksegyfftn.jpg",
        type: "image/jpeg",
      },
    ],
    shortcut:
      "https://res.cloudinary.com/djdbcoyot/image/upload/v1792461501/f71wqoiubyqksegyfftn.jpg",
    apple: BRAND_LOGO_URL,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://techtrailblazeracademy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tech Trailblazer Academy - We Tech Different",
    description: "Master cutting-edge tech skills through practical, hands-on online learning. Real projects, expert mentors, career-focused training.",
    url: "https://techtrailblazeracademy.com",
    siteName: "Tech Trailblazer Academy",
    images: [
      {
        url: BRAND_LOGO_URL,
        alt: "Tech Trailblazer Academy - We Tech Different",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Trailblazer Academy - We Tech Different",
    description: "Master cutting-edge tech skills through practical, hands-on online learning. Real projects, expert mentors.",
    images: [BRAND_LOGO_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Tech Trailblazer Academy",
  "description": "Master cutting-edge tech skills through practical, hands-on online learning. Real projects, expert mentors, career-focused training.",
  "url": "https://techtrailblazeracademy.com",
  "logo": BRAND_LOGO_URL,
  "sameAs": [
    "https://twitter.com/techtrailblazer",
    "https://linkedin.com/company/techtrailblazer-academy"
  ],
  "offers": {
    "@type": "EducationalOccupationalProgram",
    "name": "Tech Skills Training Programs",
    "description": "Comprehensive online tech education with hands-on projects",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Tech Trailblazer Academy"
    }
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="facebook-domain-verification" content="duxa7kyhhskwb27009uj5ns45kvc9o" />
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1536313241419460');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1536313241419460&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
        {/* TikTok Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]=[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
                var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r;ttq._t=ttq._t||{},ttq._t[e]=+new Date;ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
                ;n.type="text/javascript",n.async=!0,n.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+e+"&lib="+t;e=d.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('D7IQTS3C77U9I9C36BK0');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
        {/* End TikTok Pixel Code */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className={notoSans.variable}>
        <QueryProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </QueryProvider>
      </body>
    </html>
  );
}