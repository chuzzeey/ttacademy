'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Laptop,
  Globe, Calendar, Lock, CheckCircle, ChevronRight, KeyRound,
  GraduationCap, MapPin, BookOpen, CreditCard, Clock,
  Shield, BadgeCheck, Smartphone, Camera, X, Upload, Trash2,
  AlertTriangle, Loader2, Copy, Eye, EyeOff,
  MapPinned, CalendarDays,
  AtSign
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'
import { getStateDisplayName } from '@/lib/state-utils'

interface StudentData {
  id: string
  name: string
  email: string
  phone: string
  course: string
  sex: string
  country: string
  state: string | null
  payment_status: string
  reg_date: string
  reg_time: string
  avatar?: string
}

// ─── SKELETON ────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="h-[60px] flex items-center px-4 border-b border-gray-200 bg-white" />
      <div className="max-w-[600px] md:max-w-3xl lg:max-w-5xl mx-auto px-4 py-4 space-y-4">
        <Skeleton className="h-[160px] w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="w-[100px] h-[100px] rounded-full shrink-0 -mt-16" />
          <div className="flex-1 space-y-2 pt-4">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-28 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-[72px] rounded-2xl" />))}
        </div>
        <div className="md:grid md:grid-cols-3 md:gap-5 space-y-4 md:space-y-0">
          <Skeleton className="h-40 rounded-2xl md:col-span-2" />
          <Skeleton className="h-40 rounded-2xl md:col-span-1" />
          <Skeleton className="h-40 rounded-2xl md:col-span-2" />
        </div>
      </div>
    </div>
  )
}

// ─── FORMAT HELPERS ──────────────────────────────────────────────
const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A'
  try {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const [day, month, year] = parts
      const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`
      const date = new Date(`${fullYear}-${month}-${day}`)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

const capitalizeWords = (str: string | null | undefined): string => {
  if (!str) return ''
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

// ─── DEFAULT AVATAR ──────────────────────────────────────────────
function DefaultAvatar({ name, size = 120 }: { name?: string; size?: number }) {
  const initials = name
    ?.split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
  const fontSize = size * 0.38
  return (
    <div
      className="w-full h-full rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] flex items-center justify-center text-white font-bold select-none"
      style={{ fontSize }}
    >
      {initials}
    </div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────────
export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)
  const dashboard = courseData.dashboard
  const [mounted, setMounted] = useState(false)

  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPinModal, setShowPinModal] = useState(false)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)
  const [updatingPin, setUpdatingPin] = useState(false)
  const [showCurrentPin, setShowCurrentPin] = useState(false)
  const [showNewPin, setShowNewPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    async function fetchStudentData() {
      try {
        const res = await fetch('/api/registrations/me')
        const json = await res.json()
        if (res.ok && json.data) {
          setStudentData(json.data)
        }
      } catch (err) { console.error('Failed to fetch student data:', err) }
      finally { setLoading(false) }
    }
    fetchStudentData()
  }, [])

  const data = studentData

  const copyEmail = () => {
    if (data?.email) {
      navigator.clipboard.writeText(data.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const paymentLabel = (s: string | null | undefined) => {
    if (!s) return '—'
    switch (s) {
      case 'Fully Paid': return 'Paid'
      case '1st Installment': return '1st Inst.'
      case '2nd Installment': return '2nd Inst.'
      case 'Not Paid': return 'Unpaid'
      default: return s
    }
  }

  const paymentPill = (s: string | null | undefined) => {
    if (!s) return null
    switch (s) {
      case 'Fully Paid': return { text: 'Paid', cls: 'bg-emerald-100 text-emerald-700' }
      case '1st Installment': return { text: 'Partial', cls: 'bg-amber-100 text-amber-700' }
      case '2nd Installment': return { text: 'Partial', cls: 'bg-amber-100 text-amber-700' }
      case 'Not Paid': return { text: 'Unpaid', cls: 'bg-red-100 text-red-700' }
      default: return { text: s, cls: 'bg-gray-100 text-gray-500' }
    }
  }

  const handleUpdatePin = async () => {
    setPinError('')

    if (!currentPin || !newPin || !confirmPin) {
      setPinError('All fields are required')
      return
    }

    if (newPin.length < 4) {
      setPinError('PIN must be at least 4 characters')
      return
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and confirm PIN do not match')
      return
    }

    if (currentPin === newPin) {
      setPinError('New PIN must be different from current PIN')
      return
    }

    setUpdatingPin(true)
    try {
      const res = await fetch('/api/pin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      })
      const json = await res.json()
      if (!res.ok) {
        setPinError(json.error || 'Failed to update PIN')
        return
      }
      setPinSuccess(true)
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    } catch {
      setPinError('Failed to update PIN. Please try again.')
    } finally {
      setUpdatingPin(false)
    }
  }

  const closePinModal = () => {
    setShowPinModal(false)
    setPinSuccess(false)
    setPinError('')
    setCurrentPin('')
    setNewPin('')
    setConfirmPin('')
  }

  const modalHandlers = {
    photoUpload: () => {
      const input = document.createElement('input')
      input.type = 'file'; input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) { setPhotoUploading(true); setTimeout(() => { setPhotoUploading(false); setShowPhotoModal(false) }, 1500) }
      }
      input.click()
    },
    removePhoto: () => setShowRemoveConfirm(true),
    confirmRemove: () => { setShowRemoveConfirm(false); setShowPhotoModal(false) },
  }

  if (loading) return <ProfileSkeleton />

  const hasAvatar = !!(data?.avatar || dashboard.profile.avatar)
  const userAvatar = data?.avatar || dashboard.profile.avatar
  const userEmail = data?.email || dashboard.profile.email

  return (
    <div className="min-h-screen antialiased bg-gray-50 text-gray-900 transition-colors"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
    >
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-gray-200 bg-white/90">
        <div className="max-w-[600px] md:max-w-3xl lg:max-w-5xl mx-auto px-4 h-[60px] flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1" />
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div className="w-full max-w-[600px] md:max-w-3xl lg:max-w-5xl mx-auto pb-20 pt-[60px] px-4 sm:px-6 lg:px-8">

        {/* ── Profile hero ── */}
        <div className="relative">
          <div className="h-[160px] sm:h-[200px] md:h-[220px] bg-gradient-to-br from-[#1d9bf0]/30 via-[#1d9bf0]/10 to-purple-500/10 md:rounded-2xl" />

          <div className="px-0 sm:px-1 md:px-2 pb-3">
            <div className="flex justify-between items-end -mt-[72px] sm:-mt-[88px]">
              <div className="relative group">
                <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden border-[4px] shadow-xl border-white bg-gray-100">
                  {hasAvatar ? (
                    <Image
                      src={userAvatar}
                      alt={data?.name || dashboard.profile.name}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <DefaultAvatar name={data?.name || dashboard.profile.name} size={120} />
                  )}
                </div>
                <span className="absolute bottom-[6px] right-[6px] w-[18px] h-[18px] bg-[#1d9bf0] border-[3px] rounded-full shadow border-white">
                  <span className="absolute inset-0 bg-[#1d9bf0] rounded-full animate-ping opacity-40" />
                </span>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-[2px] -left-[2px] w-[32px] h-[32px] rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                >
                  <Camera className="w-[14px] h-[14px]" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[20px] sm:text-[22px] md:text-[26px] font-extrabold leading-7 tracking-tight text-gray-900">
                  {data?.name || dashboard.profile.name}
                </h2>
                <BadgeCheck className="w-[18px] h-[18px] text-[#1d9bf0] shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[14px] uppercase tracking-wider font-semibold text-gray-400">ID:</span>
                <p className="text-[14px] text-gray-500">
                  {data?.id ? data.id.substring(0, 8).toUpperCase() : 'Student'}
                </p>
              </div>
              {data?.email && (
                <button
                  onClick={copyEmail}
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#1d9bf0] transition-colors"
                >
                  {copied ? (
                    <><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Copied</>
                  ) : (
                    <><Mail className="w-3.5 h-3.5" /> {data.email}</>
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border border-gray-200 bg-white text-gray-600">
                <CalendarDays className="w-3.5 h-3.5" />
                Joined {formatDate(data?.reg_date)}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border ${
                data?.payment_status === 'Fully Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : data?.payment_status === 'Not Paid'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <CreditCard className="w-3.5 h-3.5" />
                {paymentLabel(data?.payment_status)}
              </span>
            </div>
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 md:gap-5 lg:gap-6 md:items-start">

          {/* ── PERSONAL DETAILS ── */}
          <div className="mb-3 md:mb-0 md:col-span-2 md:order-1 rounded-2xl border border-gray-200 overflow-hidden bg-white"
            style={{ animation: mounted ? 'fadeIn 0.4s ease 0.05s both' : undefined }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
                <User className="w-[16px] h-[16px] text-[#1d9bf0]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold leading-5 text-gray-900">Personal Details</h3>
                <p className="text-[11px] text-gray-500">Your account information</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100 md:grid md:grid-cols-2 md:divide-y-0">
              {[
                { icon: User, label: 'Name', value: data?.name || dashboard.profile.name },
                { icon: Mail, label: 'Email', value: data?.email || dashboard.profile.email },
                { icon: Smartphone, label: 'Phone', value: data?.phone },
                { icon: BadgeCheck, label: 'Gender', value: data?.sex ? capitalizeWords(data.sex) : undefined },
              ].map((row, i) => (
                <div key={row.label}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-50 border-b border-gray-100 md:border-b-0 md:border-t md:first:border-t-0 md:[&:nth-child(2)]:border-t-0"
                  style={{ animation: mounted ? `fadeIn 0.3s ease ${0.1 + 0.04 * i}s both` : undefined }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100">
                    <row.icon className="w-[16px] h-[16px] text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">{row.label}</p>
                    <p className="text-[14px] font-medium truncate mt-[2px] text-gray-900">
                      {row.value || <span className="italic text-gray-400">Not provided</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SECURITY (CHANGE PIN) ── */}
          <div className="mb-3 md:mb-0 md:col-span-1 md:order-2 md:row-span-2 rounded-2xl border border-gray-200 overflow-hidden bg-white md:self-start md:sticky md:top-[76px]"
            style={{ animation: mounted ? 'fadeIn 0.4s ease 0.2s both' : undefined }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
                <Shield className="w-[16px] h-[16px] text-[#1d9bf0]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold leading-5 text-gray-900">Security</h3>
                <p className="text-[11px] text-gray-500">Manage your account security</p>
              </div>
            </div>

            <button
              onClick={() => { setShowPinModal(true); setPinError(''); setPinSuccess(false) }}
              className="w-full flex items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50 active:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100">
                  <KeyRound className="w-[16px] h-[16px] text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-medium text-gray-900">Change PIN</p>
                  <p className="text-[12px] text-gray-500">Update your access PIN</p>
                </div>
              </div>
              <ChevronRight className="w-[18px] h-[18px] text-gray-400" />
            </button>
          </div>

          {/* ── LOCATION & COURSE ── */}
          <div className="mb-3 md:mb-0 md:col-span-2 md:order-3 rounded-2xl border border-gray-200 overflow-hidden bg-white"
            style={{ animation: mounted ? 'fadeIn 0.4s ease 0.35s both' : undefined }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-[#1d9bf0]/10 flex items-center justify-center">
                <MapPinned className="w-[16px] h-[16px] text-[#1d9bf0]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold leading-5 text-gray-900">Location & Course</h3>
                <p className="text-[11px] text-gray-500">Your enrolled program details</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100 md:grid md:grid-cols-2 md:divide-y-0">
              {[
                { icon: MapPinned, label: 'Country', value: data?.country },
                { icon: MapPin, label: 'State/Region', value: data?.state ? getStateDisplayName(data.state) : undefined },
                { icon: BookOpen, label: 'Course', value: data?.course ? capitalizeWords(data.course) : courseData.title },
                { icon: CreditCard, label: 'Payment', value: data?.payment_status, badge: paymentPill(data?.payment_status) },
              ].map((row, i) => (
                <div key={row.label}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 active:bg-gray-50 border-b border-gray-100 md:border-b-0 md:border-t md:first:border-t-0 md:[&:nth-child(2)]:border-t-0"
                  style={{ animation: mounted ? `fadeIn 0.3s ease ${0.4 + 0.04 * i}s both` : undefined }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-100">
                    <row.icon className="w-[16px] h-[16px] text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">{row.label}</p>
                    <p className="text-[14px] font-medium truncate mt-[2px] text-gray-900">
                      {row.value || <span className="italic text-gray-400">Not provided</span>}
                    </p>
                  </div>
                  {row.badge && (
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${row.badge.cls}`}>
                      {row.badge.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="h-16" />
      </div>

      {/* ===== PHOTO MODAL ===== */}
      {showPhotoModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => { if (!showRemoveConfirm) setShowPhotoModal(false) }} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              {!showRemoveConfirm ? (
                <>
                  <div className="relative px-6 pt-7 pb-4 text-center">
                    <button
                      onClick={() => setShowPhotoModal(false)}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100"
                    >
                      <X className="w-[18px] h-[18px]" />
                    </button>
                    <div className="w-[80px] h-[80px] rounded-full mx-auto mb-4 overflow-hidden ring-2 ring-gray-200">
                      {hasAvatar ? (
                        <Image src={userAvatar} alt="" width={80} height={80} className="w-full h-full object-cover" />
                      ) : (
                        <DefaultAvatar name={data?.name} size={80} />
                      )}
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-900">Profile photo</h3>
                    <p className="text-[13px] text-gray-500 mt-1">Choose a new photo or remove</p>
                  </div>
                  <div className="px-6 pb-6 space-y-2">
                    <button
                      onClick={modalHandlers.photoUpload}
                      disabled={photoUploading}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 rounded-xl transition-colors active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                        {photoUploading ? (
                          <Loader2 className="w-[18px] h-[18px] text-white animate-spin" />
                        ) : (
                          <Upload className="w-[18px] h-[18px] text-white" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-semibold text-white">{photoUploading ? 'Uploading…' : 'Upload photo'}</p>
                        <p className="text-[11px] text-white/60">Select from your device</p>
                      </div>
                    </button>
                    <button
                      onClick={modalHandlers.removePhoto}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl transition-colors active:scale-[0.98] bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <Trash2 className="w-[18px] h-[18px] text-red-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-semibold text-gray-900">Remove photo</p>
                        <p className="text-[11px] text-gray-500">Reset to default</p>
                      </div>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-6 pt-7 pb-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1">Remove photo?</h3>
                    <p className="text-[13px] text-gray-500">This will reset to the default avatar.</p>
                  </div>
                  <div className="px-6 pb-6 flex gap-2">
                    <button
                      onClick={() => setShowRemoveConfirm(false)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] transition-colors font-medium active:scale-[0.98] text-gray-900 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={modalHandlers.confirmRemove}
                      className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-[14px] text-white font-semibold transition-colors active:scale-[0.98]"
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

      {/* ===== PIN MODAL ===== */}
      {showPinModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60" onClick={closePinModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
              {!pinSuccess ? (
                <>
                  <div className="relative px-6 pt-7 pb-4">
                    <button
                      onClick={closePinModal}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-gray-500 hover:bg-gray-100"
                    >
                      <X className="w-[18px] h-[18px]" />
                    </button>

                    <div className="w-14 h-14 rounded-2xl bg-[#1d9bf0]/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-[#1d9bf0]" />
                    </div>

                    <h3 className="text-[17px] font-bold text-gray-900 text-center mb-1">Change PIN</h3>
                    <p className="text-[13px] text-gray-500 text-center leading-relaxed mb-5">
                      Enter your current PIN and set a new one
                    </p>

                    {/* Current PIN */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 text-gray-500 block">Current PIN</label>
                      <div className="relative">
                        <input
                          type={showCurrentPin ? 'text' : 'password'}
                          value={currentPin}
                          onChange={(e) => setCurrentPin(e.target.value)}
                          maxLength={10}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]/30 focus:border-[#1d9bf0] transition-colors pr-10"
                          placeholder="Enter current PIN"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPin(!showCurrentPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New PIN */}
                    <div className="mb-4">
                      <label className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 text-gray-500 block">New PIN</label>
                      <div className="relative">
                        <input
                          type={showNewPin ? 'text' : 'password'}
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          maxLength={10}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]/30 focus:border-[#1d9bf0] transition-colors pr-10"
                          placeholder="Enter new PIN"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPin(!showNewPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New PIN */}
                    <div className="mb-2">
                      <label className="text-[10px] uppercase tracking-wider font-semibold mb-1.5 text-gray-500 block">Confirm New PIN</label>
                      <div className="relative">
                        <input
                          type={showConfirmPin ? 'text' : 'password'}
                          value={confirmPin}
                          onChange={(e) => setConfirmPin(e.target.value)}
                          maxLength={10}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[14px] text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1d9bf0]/30 focus:border-[#1d9bf0] transition-colors pr-10"
                          placeholder="Confirm new PIN"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error */}
                    {pinError && (
                      <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200">
                        <p className="text-[11px] flex items-center gap-1.5 text-red-600">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {pinError}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 pb-6 flex gap-2">
                    <button
                      onClick={closePinModal}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-[14px] transition-colors font-medium active:scale-[0.98] text-gray-900 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdatePin}
                      disabled={updatingPin}
                      className="flex-1 py-3 rounded-xl bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 disabled:cursor-not-allowed text-[14px] text-white font-semibold transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {updatingPin ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                      ) : (
                        'Update PIN'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="px-6 pt-7 pb-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1">PIN Updated!</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">
                      Your PIN has been changed successfully.
                    </p>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      onClick={closePinModal}
                      className="w-full py-3 rounded-xl bg-[#1d9bf0] hover:bg-[#1a8cd8] text-[14px] text-white font-semibold transition-colors active:scale-[0.98]"
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}