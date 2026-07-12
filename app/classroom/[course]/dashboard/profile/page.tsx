'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Laptop,
  Globe, Calendar, Lock, CheckCircle, ChevronRight, KeyRound,
  GraduationCap, MapPin, BookOpen, CreditCard, Clock, Award,
  Shield, BadgeCheck, Smartphone, Camera, X, Upload, Trash2,
  AlertTriangle, Loader2
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'

interface StudentData {
  id: string
  name: string
  email: string
  phone: string
  course: string
  sex: string
  country: string
  state: string | null
  employment_status: string
  has_laptop: string
  reason: string
  payment_status: string
  reg_date: string
  reg_time: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)
  const dashboard = courseData.dashboard

  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordSent, setPasswordSent] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const res = await fetch('/api/registrations')
        const json = await res.json()
        const student = json.data?.find(
          (s: StudentData) => s.email.toLowerCase() === dashboard.profile.email.toLowerCase()
        )
        if (student) {
          setStudentData(student)
        }
      } catch (err) {
        console.error('Failed to fetch student data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentData()
  }, [dashboard.profile.email])

  const data = studentData

  const SectionCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-[#1f2c33] pt-5 mt-5 rounded-2xl border border-[#2a3942] overflow-hidden ${className}`}>
      {children}
    </div>
  )

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
    <div className="flex items-center pt-3 gap-3 px-4 sm:px-5 py-4 border-b border-[#2a3942]">
      <div className="w-9 h-9 rounded-xl bg-[#25d366]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-[#25d366]" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
        {subtitle && <p className="text-[10px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )

  const InfoItem = ({ icon: Icon, label, value, badge }: { icon: any; label: string; value: string | null | undefined; badge?: { text: string; color: string } }) => (
    <div className="flex items-center gap-3.5 px-4 sm:px-5 py-3.5 hover:bg-[#2a3942]/30 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-100 font-medium truncate mt-0.5">
          {value || 'Not provided'}
        </p>
      </div>
      {badge && (
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold ${badge.color}`}>
          {badge.text}
        </span>
      )}
    </div>
  )

  const getPaymentBadge = (status: string | null | undefined) => {
    if (!status) return null
    switch (status) {
      case 'Fully Paid': return { text: 'Paid', color: 'bg-emerald-500/15 text-emerald-400' }
      case '1st Installment':
      case '2nd Installment': return { text: 'Partial', color: 'bg-amber-500/15 text-amber-400' }
      case 'Not Paid': return { text: 'Unpaid', color: 'bg-red-500/15 text-red-400' }
      default: return { text: status, color: 'bg-gray-500/20 text-gray-300' }
    }
  }

  const handlePasswordProceed = () => setPasswordSent(true)
  const handlePasswordDecline = () => { setShowPasswordModal(false); setPasswordSent(false) }
  
  const handlePhotoUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setPhotoUploading(true)
        setTimeout(() => {
          setPhotoUploading(false)
          setShowPhotoModal(false)
        }, 1500)
      }
    }
    input.click()
  }

  const handleRemovePhoto = () => {
    setShowRemoveConfirm(true)
  }

  const confirmRemovePhoto = () => {
    setShowRemoveConfirm(false)
    setShowPhotoModal(false)
  }

  return (
    <div className="min-h-screen bg-[#111b21] flex flex-col font-sans antialiased">
      {/* ===== HEADER ===== */}
      <header className="bg-[#202c33] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-3 flex items-center gap-3 fixed top-0 left-0 right-0 z-50 border-b border-[#2a3942]">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl hover:bg-[#2a3942] flex items-center justify-center text-gray-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#25d366]/10 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-[#25d366]" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-gray-100">Profile</h1>
            <p className="text-[10px] sm:text-[11px] text-gray-500">{courseData.title}</p>
          </div>
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#25d366]/10 rounded-full text-[10px] sm:text-[11px] text-[#25d366] font-medium">
            <span className="w-1.5 h-1.5 bg-[#25d366] rounded-full"></span>
            Active
          </span>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-y-auto pt-14 sm:pt-16">
        <div className="max-w-lg mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 sm:space-y-4 pb-24
                        md:max-w-5xl md:grid md:grid-cols-2 md:gap-5 md:space-y-0
                        lg:max-w-6xl lg:grid-cols-2 lg:gap-6
                        xl:max-w-7xl xl:grid-cols-[1fr_1.5fr] xl:gap-8
                        2xl:max-w-[1400px] 2xl:grid-cols-[1fr_1.5fr]">
          
          {/* ===== LEFT COLUMN ===== */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 self-start md:sticky md:top-20">
            <SectionCard>
              <div className="absolute inset-0 bg-gradient-to-b from-[#25d366]/5 to-transparent pointer-events-none" />
              <div className="relative px-4 sm:px-5 md:px-6 py-6 sm:py-8 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-[#25d366]/20 shadow-lg shadow-[#25d366]/10">
                    <Image
                      src={dashboard.profile.avatar}
                      alt={dashboard.profile.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#25d366] border-[3px] border-[#1f2c33] rounded-full"></span>
                  
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute -bottom-1 -left-1 w-8 h-8 bg-[#25d366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-lg transition-colors ring-2 ring-[#1f2c33]"
                    title="Update profile photo"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-100">{dashboard.profile.name}</h2>
                  <p className="text-sm sm:text-base text-gray-400 mt-0.5">{dashboard.profile.email}</p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full mt-2 max-w-md">
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-[#111b21]">
                    <p className="text-lg sm:text-xl font-bold text-gray-100">Week 1</p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Course Week</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-[#111b21]">
                    <p className="text-lg sm:text-xl font-bold text-gray-100">
                      {data?.reg_date || 'N/A'}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Joined</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 rounded-xl bg-[#111b21]">
                    <p className="text-lg sm:text-xl font-bold text-[#25d366]">
                      {data?.payment_status === 'Fully Paid' ? 'Paid' : 'Pending'}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">Payment</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader icon={Shield} title="Security" subtitle="Manage your account security" />
              <button
                onClick={() => { setShowPasswordModal(true); setPasswordSent(false) }}
                className="w-full flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-[#2a3942]/30 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2a3942] flex items-center justify-center group-hover:bg-[#3a4a54] transition-colors">
                    <KeyRound className="w-4 h-4 text-gray-400 group-hover:text-gray-200" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-200 group-hover:text-white transition-colors">Update Password</p>
                    <p className="text-[11px] text-gray-500">Request a password reset link via email</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
              </button>
            </SectionCard>

            <SectionCard>
              <SectionHeader icon={Clock} title="Account Info" subtitle="System identifiers and timestamps" />
              <div className="divide-y divide-[#2a3942]/50">
                <InfoItem icon={BadgeCheck} label="Student ID" value={data?.id} />
                <InfoItem icon={Clock} label="Registration Time" value={data?.reg_time} />
                <InfoItem icon={Award} label="Course Week" value="Week 1" />
              </div>
            </SectionCard>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 self-start">
            <SectionCard>
              <SectionHeader icon={User} title="Personal Details" subtitle="Your account information" />
              <div className="divide-y divide-[#2a3942]/50">
                <InfoItem icon={User} label="Full Name" value={data?.name || dashboard.profile.name} />
                <InfoItem icon={Mail} label="Email Address" value={data?.email || dashboard.profile.email} />
                <InfoItem icon={Smartphone} label="Phone Number" value={data?.phone} />
                <InfoItem icon={BadgeCheck} label="Gender" value={data?.sex} />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader icon={Globe} title="Location & Course" subtitle="Your enrolled program details" />
              <div className="divide-y divide-[#2a3942]/50">
                <InfoItem icon={MapPin} label="Country" value={data?.country} />
                <InfoItem icon={MapPin} label="State/Region" value={data?.state} />
                <InfoItem icon={BookOpen} label="Course Enrolled" value={data?.course || courseData.title} />
                <InfoItem 
                  icon={CreditCard} 
                  label="Payment Status" 
                  value={data?.payment_status}
                  badge={getPaymentBadge(data?.payment_status) || undefined}
                />
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeader icon={Briefcase} title="Additional Info" subtitle="Employment and readiness" />
              <div className="divide-y divide-[#2a3942]/50">
                <InfoItem 
                  icon={Briefcase} 
                  label="Employment Status" 
                  value={data?.employment_status}
                  badge={data?.employment_status ? { 
                    text: data.employment_status === 'Employed' ? 'Employed' : 'Available',
                    color: data.employment_status === 'Employed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                  } : undefined}
                />
                <InfoItem 
                  icon={Laptop} 
                  label="Has Laptop" 
                  value={data?.has_laptop}
                  badge={data?.has_laptop ? {
                    text: data.has_laptop === 'Yes' ? 'Yes' : 'No',
                    color: data.has_laptop === 'Yes' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  } : undefined}
                />
              </div>
            </SectionCard>

            {data?.reason && (
              <SectionCard>
                <SectionHeader icon={Award} title="Learning Goal" subtitle="Why you joined this program" />
                <div className="px-4 sm:px-5 py-4">
                  <div className="p-4 rounded-xl bg-[#111b21] border border-[#2a3942]/50">
                    <p className="text-sm sm:text-base text-gray-200 leading-relaxed">&ldquo;{data.reason}&rdquo;</p>
                  </div>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>

      {/* ===== PHOTO MODAL ===== */}
      {showPhotoModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={() => { if (!showRemoveConfirm) setShowPhotoModal(false) }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a242b] border border-[#2a3942] rounded-3xl w-full max-w-sm sm:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {!showRemoveConfirm ? (
                <>
                  {/* Header */}
                  <div className="relative px-5 sm:px-6 pt-8 pb-4 text-center">
                    <button
                      onClick={() => setShowPhotoModal(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2a3942] hover:bg-[#3a4a54] flex items-center justify-center text-gray-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 relative">
                      <div className="w-full h-full rounded-full overflow-hidden ring-4 ring-[#25d366]/20">
                        <Image
                          src={dashboard.profile.avatar}
                          alt="Current"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#25d366] border-[3px] border-[#1a242b] rounded-full"></div>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100">Profile Photo</h3>
                    <p className="text-sm text-gray-400 mt-1">Choose a new photo or remove the current one</p>
                  </div>

                  {/* Options */}
                  <div className="px-5 sm:px-6 pb-6 space-y-2.5">
                    <button
                      onClick={handlePhotoUpload}
                      disabled={photoUploading}
                      className="w-full flex items-center gap-4 px-4 py-3.5 bg-[#25d366] hover:bg-[#20bd5a] disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                        {photoUploading ? (
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-white">
                          {photoUploading ? 'Uploading...' : 'Upload Photo'}
                        </p>
                        <p className="text-[11px] text-white/70">Select an image from your device</p>
                      </div>
                    </button>

                    <button
                      onClick={handleRemovePhoto}
                      className="w-full flex items-center gap-4 px-4 py-3.5 bg-[#1f2c33] hover:bg-[#2a3942] border border-[#2a3942] rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-gray-200 group-hover:text-red-400 transition-colors">Remove Photo</p>
                        <p className="text-[11px] text-gray-500">Set profile picture to default</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Remove Confirmation */}
                  <div className="px-5 sm:px-6 pt-8 pb-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">Remove Photo?</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      This will remove your current profile photo and set it to the default avatar. You can upload a new one anytime.
                    </p>
                  </div>

                  <div className="px-5 sm:px-6 pb-6 flex gap-3">
                    <button
                      onClick={() => setShowRemoveConfirm(false)}
                      className="flex-1 py-3 px-4 rounded-2xl border border-[#2a3942] text-sm text-gray-300 hover:bg-[#2a3942] hover:text-white transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmRemovePhoto}
                      className="flex-1 py-3 px-4 rounded-2xl bg-red-500 text-sm text-white hover:bg-red-600 transition-all font-semibold shadow-lg shadow-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== PASSWORD RESET MODAL ===== */}
      {showPasswordModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            onClick={handlePasswordDecline}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a242b] border border-[#2a3942] rounded-3xl w-full max-w-sm sm:max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {!passwordSent ? (
                <>
                  <div className="relative px-5 sm:px-6 pt-8 pb-4 text-center">
                    <button
                      onClick={handlePasswordDecline}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#2a3942] hover:bg-[#3a4a54] flex items-center justify-center text-gray-400 hover:text-white transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="w-16 h-16 rounded-2xl bg-[#25d366]/10 flex items-center justify-center mx-auto mb-4">
                      <KeyRound className="w-7 h-7 text-[#25d366]" />
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">Reset Password</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      We'll send a secure password reset link to your registered email address. Click the link to create a new password.
                    </p>
                    
                    <div className="mt-5 p-4 rounded-2xl bg-[#111b21] border border-[#2a3942]">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Email address</p>
                      <p className="text-sm font-semibold text-[#25d366]">{dashboard.profile.email}</p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-6 flex gap-3">
                    <button
                      onClick={handlePasswordDecline}
                      className="flex-1 py-3 px-4 rounded-2xl border border-[#2a3942] text-sm text-gray-300 hover:bg-[#2a3942] hover:text-white transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordProceed}
                      className="flex-1 py-3 px-4 rounded-2xl bg-[#25d366] text-sm text-white hover:bg-[#20bd5a] transition-all font-semibold shadow-lg shadow-[#25d366]/20"
                    >
                      Send Link
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-5 sm:px-6 pt-8 pb-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <div className="relative">
                        <CheckCircle className="w-7 h-7 text-emerald-400" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-40" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-gray-100 mb-2">Link Sent!</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      A password reset link has been sent to <span className="text-[#25d366] font-medium">{dashboard.profile.email}</span>. Check your inbox and follow the instructions.
                    </p>
                    
                    <div className="mt-5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-[11px] text-amber-400/80 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Didn't receive it? Check your spam folder or try again later.
                      </p>
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-6">
                    <button
                      onClick={handlePasswordDecline}
                      className="w-full py-3 px-4 rounded-2xl bg-[#25d366] text-sm text-white hover:bg-[#20bd5a] transition-all font-semibold shadow-lg shadow-[#25d366]/20"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
