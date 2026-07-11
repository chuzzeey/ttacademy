import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login - Tech Trailblazer Academy",
  description: "Admin login page",
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                localStorage.setItem('theme', 'light');
                document.documentElement.classList.remove('dark');
              } catch(e) {}
            })();
          `,
        }}
      />
      {children}
    </div>
  )
}
