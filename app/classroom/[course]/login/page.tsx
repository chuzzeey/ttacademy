'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookOpen, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, GraduationCap, Shield, Star } from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'
import { createClient } from '@/lib/supabase/client'

export default function CourseLoginPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  
  // Validate course slug immediately - prevent "undefined" from being processed
  const isValidSlug = courseSlug && courseSlug !== 'undefined' && courseSlug !== ''
  
  // Get course data only if slug is valid
  const courseData = isValidSlug ? getCourseData(courseSlug) : null
  
  // Validate course data
  const isValidCourse = courseData && courseData.title && courseData.title !== 'undefined'
  
  // Redirect to classroom selection if invalid
  useEffect(() => {
    if (!isValidSlug || !isValidCourse) {
      router.push('/classroom')
    }
  }, [isValidSlug, isValidCourse, router])
  
  // Show loading state while redirecting or if invalid
  if (!isValidSlug || !isValidCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a242c] to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#25d366]/30 border-t-[#25d366] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    )
  }
  
  const [imageError, setImageError] = useState(false)
  
  // Ensure imageSrc is never undefined - use a safe fallback chain
  const getInitialImageSrc = () => {
    const banner = courseData?.banner
    const icon = courseData?.icon
    
    if (banner && banner !== 'undefined' && banner !== '') {
      return banner
    }
    if (icon && icon !== 'undefined' && icon !== '') {
      return icon
    }
    return '/placeholder.jpg'
  }
  
  const [imageSrc, setImageSrc] = useState(getInitialImageSrc())
  
  // Safe display values that are never undefined
  const displayTitle = courseData?.title && courseData.title !== 'undefined' 
    ? courseData.title 
    : 'Course Login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      })

      if (error) {
        setError('Invalid email or password')
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Get user metadata to check course access
        const userCourseRaw = data.user.user_metadata?.course || ''
        const requestedCourse = courseSlug?.toLowerCase() || ''
        
        // Normalize user course to match URL slug format (lowercase, replace spaces/special chars with hyphens)
        const userCourse = userCourseRaw
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')           // Replace spaces with hyphens
          .replace(/[^a-z0-9-]/g, '')     // Remove special characters except hyphens
          .replace(/-+/g, '-')             // Replace multiple hyphens with single
          .replace(/^-|-$/g, '')           // Remove leading/trailing hyphens

        // Verify that the user can only access their registered course
        if (userCourse !== requestedCourse) {
          // Sign out the user since they're trying to access wrong course
          await supabase.auth.signOut()
          setError(`You are not authorized to access this course. You registered for: ${userCourseRaw}`)
          setIsLoading(false)
          return
        }

        // Successful login with correct course access
        setSuccess(true)
        setTimeout(() => {
          router.push(`/classroom/${courseSlug}/dashboard`)
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.')
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1a242c] rounded-3xl border border-[#25d366]/20 p-8 text-center shadow-2xl shadow-black/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#25d366]/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[#25d366] to-[#1a8a44] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#25d366]/30">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100 mb-3">Welcome Back!</h2>
            <p className="text-gray-400 mb-2">Redirecting to your classroom...</p>
            <div className="mt-4 flex justify-center">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#25d366] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#25d366] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#25d366] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a242c] to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#25d366]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#25d366]/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a242c]/80 backdrop-blur-md border border-[#2a3942] rounded-full shadow-lg">
            <GraduationCap className="w-5 h-5 text-[#25d366]" />
            <span className="text-sm font-medium text-gray-300">TT Academy</span>
            <span className="w-1 h-1 bg-[#25d366] rounded-full" />
            <span className="text-xs text-gray-500">Student Portal</span>
          </div>
        </div>

        {/* Single Unified Card */}
        <div className="bg-[#1a242c] rounded-3xl border border-[#2a3942] overflow-hidden shadow-2xl shadow-black/20">
          <div className="grid md:grid-cols-5">
            {/* Left Side - Course Preview with Image Background */}
            <div className="md:col-span-3 relative min-h-[280px]">
              {/* Full height background image */}
              <div className="absolute inset-0">
                <Image
                  src={imageSrc}
                  alt={displayTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 500px"
                  onError={() => {
                    if (!imageError) {
                      setImageSrc('/placeholder.jpg')
                      setImageError(true)
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[#1a242c] via-[#1a242c]/80 to-[#1a242c]" />
              </div>

              {/* Content on top of image */}
              <div className="relative h-full flex flex-col justify-between p-6 sm:p-8">
                <div>
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a242c]/80 backdrop-blur-md border border-[#25d366]/30 rounded-full text-xs font-semibold text-[#25d366] shadow-lg">
                      <Lock className="w-3 h-3" />
                      Private Access
                    </span>
                  </div>

                  {/* Course Title */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 leading-tight">
                    {displayTitle}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#25d366] to-[#1a8a44] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#25d366]/20">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-100 mb-1">Sign In</h2>
                <p className="text-sm text-gray-400">
                  Access your classroom
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500 group-focus-within:text-[#25d366] transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter registered email"
                      className="w-full pl-10 pr-3.5 py-3 bg-[#111b21] border border-[#2a3942] rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#25d366] transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-[#25d366] transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 bg-[#111b21] border border-[#2a3942] rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#25d366] transition-all text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-[#25d366] hover:text-[#20bd5a] transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#25d366] to-[#1a8a44] hover:from-[#20bd5a] hover:to-[#167a3a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#25d366]/20 hover:shadow-[#25d366]/30 flex items-center justify-center gap-2 group text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Classroom</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Back Link */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => router.back()}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Back to courses
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Secured with 256-bit SSL encryption
          </p>
          <p className="text-xs text-gray-600">
            Need help?{' '}
            <a href="mailto:support@ttacademy.com" className="text-[#25d366] hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}