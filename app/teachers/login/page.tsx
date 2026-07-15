'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, ArrowLeft, GraduationCap, Shield } from 'lucide-react'

const COURSES = [
  { id: 'cybersecurity', title: 'Cybersecurity' },
  { id: 'data-science', title: 'Data Science' },
  { id: 'ai-automation', title: 'AI Automation' },
  { id: 'computer-networking', title: 'Computer Networking' },
  { id: 'ethical-hacking', title: 'Ethical Hacking' },
  { id: 'graphic-design', title: 'Graphic Design' },
  { id: 'uiux-design', title: 'UI/UX Design' },
  { id: 'full-stack-development', title: 'Full Stack Development' },
  { id: 'frontend-development', title: 'Frontend Development' },
  { id: 'backend-development', title: 'Backend Development' },
  { id: 'web-development', title: 'Web Development' },
  { id: 'digital-marketing', title: 'Digital Marketing' },
  { id: 'cloud-computing', title: 'Cloud Computing' },
  { id: 'data-analysis', title: 'Data Analysis' },
]

const DEFAULT_PASSWORD = '#121212TT'

export default function MentorLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestedEmail, setSuggestedEmail] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const handleCourseSelect = (courseId: string, courseTitle: string) => {
    setSelectedCourseId(courseId)
    setSuggestedEmail(`mentor${courseId}@ttacademy`)
    setEmail(`mentor${courseId}@ttacademy`)
    setError('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate email format
    const emailRegex = /^mentor[a-z-]+@ttacademy$/
    if (!emailRegex.test(email)) {
      setError('Invalid email format. Use: mentor{course-name}@ttacademy')
      setLoading(false)
      return
    }

    // Extract course slug from email
    const courseSlug = email.replace('mentor', '').replace('@ttacademy', '')
    
    // Find the matching course
    const matchedCourse = COURSES.find(c => c.id === courseSlug)
    if (!matchedCourse) {
      setError('Invalid course mentor email. No matching course found.')
      setLoading(false)
      return
    }

    // Validate password
    if (password !== DEFAULT_PASSWORD) {
      setError('Invalid password. Please try again.')
      setLoading(false)
      return
    }

    // Simulate a brief loading state for UX
    await new Promise(resolve => setTimeout(resolve, 600))

    setLoading(false)
    
    // Redirect to the course mentor dashboard — no localStorage, no restrictions
    router.push(`/teachers/${matchedCourse.id}`)
  }

  return (
    <main className="relative overflow-x-hidden min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-white">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#6366f1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-64 h-64 bg-gradient-to-tr from-[#4338ca]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors z-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <div className="loader"></div>
            <p className="text-sm font-medium text-gray-700">Verifying credentials...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-12 sm:py-16 lg:py-20">
        {/* Header */}
        <div className="text-center space-y-5 md:space-y-6 mb-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#6366f1]/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-500 tracking-wide">Mentor Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-[1.02] tracking-tight">
            Mentor{' '}
            <span className="bg-gradient-to-r from-indigo-500 to-indigo-600/80 bg-clip-text text-transparent">
              Login
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Sign in to access your course mentor dashboard and manage your students.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">
          {/* Course Selection - Left Side */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
                Select Your Course
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Choose the course you are mentoring to auto-fill your login email.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COURSES.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseSelect(course.id, course.title)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      selectedCourseId === course.id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/50'
                    }`}
                  >
                    {course.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Login Form - Right Side */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mentor Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#4338ca]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setSelectedCourseId('')
                        setSuggestedEmail('')
                        setError('')
                      }}
                      placeholder="mentor{course-name}@ttacademy"
                      required
                      className="relative w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  {suggestedEmail && (
                    <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      Auto-filled: <span className="font-medium">{suggestedEmail}</span>
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Format: mentor<span className="text-indigo-400">[course-name]</span>@ttacademy
                  </p>
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
                      placeholder="••••••••••••"
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
                  <p className="text-xs text-gray-400 mt-1">
                    Default password: <span className="font-mono text-indigo-400">#121212TT</span>
                  </p>
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
                        Sign In to Dashboard
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Mentor Credentials</p>
                    <p className="text-xs text-indigo-600/70 mt-1">
                      Each course has a dedicated mentor email. Select your course above or type your email manually.
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Powered by Tech Trailblazer Academy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-sm text-gray-400">
            Tech Trailblazer Academy — Mentor Portal
          </p>
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