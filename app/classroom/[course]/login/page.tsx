'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookOpen, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle, GraduationCap, Shield, ShieldOff, Star, MessageCircle } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [restrictedStudentInfo, setRestrictedStudentInfo] = useState<{name: string, email: string} | null>(null)
  const [showPinEntry, setShowPinEntry] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [isVerifyingPin, setIsVerifyingPin] = useState(false)
  const supabase = createClient()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Use custom login API to check enrollment status (without password)
      const response = await fetch('/api/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: 'dummy', // Send dummy password since API requires it
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle specific error codes
        if (result.code === 'NOT_ENROLLED') {
          setError('You cannot log in because you have not paid yet. Please contact admin to complete your payment.')
        } else if (result.code === 'NO_STUDENT_RECORD') {
          setError('Student record not found. Please contact admin.')
        } else if (result.code === 'ACCOUNT_RESTRICTED') {
          setError('ACCOUNT_RESTRICTED')
          setRestrictedStudentInfo({ name: result.studentName || email, email: result.studentEmail || email })
        } else {
          setError(result.error || 'Invalid email or password')
        }
        setIsLoading(false)
        return
      }

      // Email is valid - show PIN entry
      setShowPinEntry(true)
      setIsLoading(false)
    } catch (err) {
      setError('An error occurred during login. Please try again.')
      setIsLoading(false)
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    setIsVerifyingPin(true)

    try {
      // Verify PIN
      const pinResponse = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin: pinCode,
          email: email.trim().toLowerCase(),
        }),
      })

      const pinResult = await pinResponse.json()

      if (!pinResponse.ok) {
        setPinError(pinResult.error || 'Invalid PIN')
        setIsVerifyingPin(false)
        return
      }

      // PIN verified - use data from PIN verification response
      if (pinResult.data) {
        const userCourseRaw = pinResult.data.course || ''
        const requestedCourse = courseSlug?.toLowerCase() || ''
        
        // Normalize user course to match URL slug format
        const userCourse = userCourseRaw
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

        // Verify course access
        if (userCourse !== requestedCourse) {
          setPinError(`You are not authorized to access this course. You registered for: ${userCourseRaw}`)
          setIsVerifyingPin(false)
          return
        }

        // Store student info
        sessionStorage.setItem('ttacademy_student', JSON.stringify({
          id: pinResult.data.id,
          name: pinResult.data.name || '',
          email: pinResult.data.email || '',
          course: userCourseRaw,
        }))

        // Success
        setSuccess(true)
        setTimeout(() => {
          router.push(`/classroom/${courseSlug}/dashboard`)
          router.refresh()
        }, 1500)
      }
    } catch (err) {
      setPinError('An error occurred. Please try again.')
      setIsVerifyingPin(false)
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

              {!showPinEntry ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                  {/* Error Message */}
                  {error && error !== 'ACCOUNT_RESTRICTED' && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Account Restricted Message with Contact Support */}
                  {error === 'ACCOUNT_RESTRICTED' && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldOff className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-400 mb-1">Account Restricted</p>
                          <p className="text-xs text-red-400/80 leading-relaxed">
                            Your account has been restricted by the admin. You are currently banned from accessing the classroom.
                          </p>
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/2349012345678?text=${encodeURIComponent(`Hello Support, I need assistance. My account has been restricted. Name: ${restrictedStudentInfo?.name || email} Email: ${restrictedStudentInfo?.email || email}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#25d366] hover:bg-[#20bd5a] text-white text-sm font-semibold rounded-xl transition-all shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contact Support
                      </a>
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
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  {/* PIN Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                      Enter PIN (6-8 digits)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-[#25d366] transition-colors" />
                      </div>
                      <input
                        type="password"
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="Enter 6-8 digit PIN"
                        maxLength={8}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-full pl-10 pr-3.5 py-3 bg-[#111b21] border border-[#2a3942] rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#25d366]/40 focus:border-[#25d366] transition-all text-sm text-center text-2xl tracking-widest"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5">Enter the 6-8 digit PIN sent to your email</p>
                  </div>

                  {/* PIN Error Message */}
                  {pinError && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{pinError}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isVerifyingPin}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#25d366] to-[#1a8a44] hover:from-[#20bd5a] hover:to-[#167a3a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#25d366]/20 hover:shadow-[#25d366]/30 flex items-center justify-center gap-2 group text-sm"
                  >
                    {isVerifyingPin ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying PIN...</span>
                      </>
                    ) : (
                      <>
                        <span>Access Classroom</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Back to Email */}
                  <button
                    type="button"
                    onClick={() => { setShowPinEntry(false); setPinCode(''); setPinError(''); }}
                    className="w-full text-xs text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    ← Back to email
                  </button>
                </form>
              )}

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