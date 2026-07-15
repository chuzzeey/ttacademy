'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'

const COURSES: Record<string, string> = {
  'cybersecurity': 'Cybersecurity',
  'data-science': 'Data Science',
  'ai-automation': 'AI Automation',
  'computer-networking': 'Computer Networking',
  'ethical-hacking': 'Ethical Hacking',
  'graphic-design': 'Graphic Design',
  'uiux-design': 'UI/UX Design',
  'full-stack-development': 'Full Stack Development',
  'frontend-development': 'Frontend Development',
  'backend-development': 'Backend Development',
  'web-development': 'Web Development',
  'digital-marketing': 'Digital Marketing',
  'cloud-computing': 'Cloud Computing',
  'data-analysis': 'Data Analysis',
}

const DEFAULT_PASSWORD = '#121212TT'

export default function DynamicCourseLoginPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params.course as string
  const courseTitle = COURSES[courseSlug] || courseSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Expected email for this course
    const expectedEmail = `mentor${courseSlug}@ttacademy`

    // Validate email
    if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // Validate password
    if (password !== DEFAULT_PASSWORD) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 600))

    setLoading(false)
    router.push(`/teachers/${courseSlug}`)
  }

  return (
    <main className="relative overflow-x-hidden min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-white">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#6366f1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-64 h-64 bg-gradient-to-tr from-[#4338ca]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <Link 
        href="/teachers" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="loader"></div>
            <p className="text-sm font-medium text-gray-700">Signing in...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full blur opacity-30" />
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold relative ring-4 ring-white">
                  {courseTitle.charAt(0)}
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{courseTitle}</h1>
            <p className="text-sm text-gray-500">Sign in to access your mentor dashboard</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#4338ca]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your email"
                    required
                    autoFocus
                    className="relative w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#4338ca]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your password"
                    required
                    className="relative w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-3.5 rounded-lg shadow-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="loader"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Tech Trailblazer Academy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loader Styles */}
      <style jsx>{`
        .loader {
          width: 24px;
          height: 24px;
          border: 3px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}