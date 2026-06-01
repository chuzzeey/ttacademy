'use client'

import { useState, useEffect, useRef } from 'react'

const STEPS = [
  { id: 1, label: "Personal Identity", heading: "Let's start with your basic information", subtext: "We need your full name to personalize your experience." },
  { id: 2, label: "Contact Details", heading: "How can we reach you?", subtext: "Provide a valid email and WhatsApp number for updates." },
  { id: 3, label: "Demographics", heading: "Tell us a bit more about yourself", subtext: "This helps us tailor the program to your region." },
  { id: 4, label: "Course Selection", heading: "Choose your learning path", subtext: "Select your course and tell us about your background." },
  { id: 5, label: "Motivation", heading: "Why do you want to learn this skill?", subtext: "Help us understand your goals and motivations." },
  { id: 6, label: "Review", heading: "Review your application", subtext: "Double-check everything before submitting." },
]

const COURSES = [
  "Cybersecurity",
  "Data Science",
  "AI Automation",
  "Computer Networking",
  "Ethical Hacking",
  "Graphic Design",
  "UI/UX Design",
  "Full Stack Development",
  "Frontend Development",
  "Backend Development",
  "Web Development",
  "Digital Marketing",
  "Cloud Computing",
  "Data Analysis",
]

export default function Contact() {
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<"next" | "back">("next")
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", sex: "", country: "", state: "",
    course: "", employment: "", laptop: "", reason: "",
  })

  const [countries, setCountries] = useState<{ code: string; name: string }[]>([])
  const [states, setStates] = useState<{ code: string; name: string }[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingStates, setLoadingStates] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{
    status: "idle" | "checking" | "available" | "duplicate"; message: string;
  }>({ status: "idle", message: "" })
  const [emailFocused, setEmailFocused] = useState(false)
  const [whatsappFocused, setWhatsappFocused] = useState(false)
  const [slideOffset, setSlideOffset] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Global Enter key handler
  useEffect(() => {
    if (submitted) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        if (currentStep < 6) goNext()
        else handleSubmit()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentStep, submitted])

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name")
        const data = await res.json()
        setCountries(data.map((c: any) => ({ code: c.cca2, name: c.name.common })).sort((a: any, b: any) => a.name.localeCompare(b.name)))
      } catch {
        setCountries([
          { code: "NG", name: "Nigeria" }, { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
          { code: "CA", name: "Canada" }, { code: "AU", name: "Australia" }, { code: "DE", name: "Germany" },
          { code: "KE", name: "Kenya" }, { code: "GH", name: "Ghana" }, { code: "OTHER", name: "Other" },
        ])
      } finally { setLoadingCountries(false) }
    }
    fetchCountries()
  }, [])

  // Fetch states when country changes
  useEffect(() => {
    const fetchStates = async () => {
      if (!form.country || form.country === "OTHER") { setStates([]); return }
      setLoadingStates(true)
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states")
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        if (data?.data && Array.isArray(data.data)) {
          const cd = data.data.find((i: any) => i.iso2 === form.country || i.iso3 === form.country)
          if (cd?.states && Array.isArray(cd.states)) {
            setStates(cd.states.map((s: any) => ({ code: s.state_code || s.name, name: s.name })).sort((a: any, b: any) => a.name.localeCompare(b.name)))
          } else { setStates([]) }
        } else { setStates([]) }
      } catch { setStates([]) }
      finally { setLoadingStates(false) }
    }
    fetchStates()
  }, [form.country])

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    if (field === "email") setEmailStatus({ status: "idle", message: "" })
  }

  const checkEmailDuplicate = async (email: string) => {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setEmailStatus({ status: "idle", message: "" }); return }
    setEmailChecking(true)
    setEmailStatus({ status: "checking", message: "Checking email..." })
    try {
      const res = await fetch("/api/check-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: trimmed }) })
      const r = await res.json()
      if (r.exists) setEmailStatus({ status: "duplicate", message: r.message })
      else setEmailStatus({ status: "available", message: "" })
    } catch { setEmailStatus({ status: "idle", message: "" }) }
    finally { setEmailChecking(false) }
  }

  const validateStep = (step: number): boolean => {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!form.name.trim()) e.name = "Full name is required"
      else if (/\d/.test(form.name)) e.name = "Name should not contain numbers."
      else if (form.name.trim().split(/\s+/).filter((w: string) => w.length > 0).length < 2) e.name = "Please enter your second name as well."
    }
    if (step === 2) {
      if (!form.email.trim()) e.email = "Email is required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address"
      else if (emailStatus.status === "duplicate") e.email = emailStatus.message
      if (!form.mobile.trim()) e.mobile = "Please enter a valid WhatsApp number."
      else { const d = form.mobile.replace(/\D/g, ""); if (/^0+$/.test(d) || /^(\d)\1{4,}$/.test(d) || d.length < 7 || d.length > 15) e.mobile = "Please enter a valid WhatsApp number." }
    }
    if (step === 3) {
      if (!form.sex) e.sex = "Please select your sex"
      if (!form.country) e.country = "Please select your country"
    }
    if (step === 4) {
      if (!form.course) e.course = "Please select a course"
      if (!form.employment) e.employment = "Please select employment status"
      if (!form.laptop) e.laptop = "Please select an option"
    }
    if (step === 5) {
      if (!form.reason.trim()) e.reason = "Please tell us why you want to learn this skill"
    }
    setErrors(e)
    if (Object.keys(e).length > 0) {
      const firstError = Object.keys(e)[0]
      const el = document.getElementById(`err-${firstError}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    return Object.keys(e).length === 0
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    if (currentStep < 6) {
      setDirection("next")
      setSlideOffset(-30)
      setTimeout(() => { setCurrentStep(s => s + 1); setSlideOffset(30); setTimeout(() => setSlideOffset(0), 50) }, 50)
    }
  }

  const goBack = () => {
    if (currentStep > 1) {
      setDirection("back")
      setSlideOffset(30)
      setTimeout(() => { setCurrentStep(s => s - 1); setSlideOffset(-30); setTimeout(() => setSlideOffset(0), 50) }, 50)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const phoneSelect = document.querySelector('select[defaultValue="+234"]') as HTMLSelectElement
    const dialCode = phoneSelect ? phoneSelect.value : "+234"
    const fullPhone = `${dialCode}${form.mobile}`
    const countryName = countries.find(c => c.code === form.country)?.name || form.country
    try {
      const res = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.name.trim(), email: form.email.trim().toLowerCase(), phone_whatsapp: fullPhone,
          sex: form.sex, country: countryName, state: form.state || null, course_applying_for: form.course,
          employment_status: form.employment, has_laptop: form.laptop, heard_about_us: "registration", learning_reason: form.reason.trim(),
        }),
      })
      if (res.ok) setSubmitted(true)
      else { const r = await res.json(); alert(`Registration failed: ${r.error}. Please try again later.`) }
    } catch { alert("Registration failed. Please check your connection and try again.") }
    finally { setSubmitting(false) }
  }

  const progress = ((currentStep) / STEPS.length) * 100
  const countryLabel = countries.find(c => c.code === form.country)?.name || "Not selected"

  if (submitted) {
    return (
      <section id="contact" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ef4444]/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-md relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-[#dc2626]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] mb-3">Application Submitted!</h2>
          <p className="text-[#5a5a6e] text-sm mb-2">Thank you, <span className="text-[#1a1a2e] font-medium">{form.name.split(" ")[0]}</span>!</p>
          <p className="text-[#5a5a6e] text-sm mb-8 leading-relaxed">We will contact you via <span className="text-[#1a1a2e] font-medium">email</span> and <span className="text-[#1a1a2e] font-medium">WhatsApp</span> using the details you provided. Please check your inbox regularly for updates.</p>
          <div className="p-4 rounded-xl border border-[#1a1a2e]/10 bg-[#1a1a2e]/[0.02] mb-6">
            <p className="text-[#5a5a6e] text-xs mb-2">Application Summary</p>
            <div className="text-left space-y-1 text-sm">
              <p className="text-[#1a1a2e]/70"><span className="text-[#1a1a2e]/40">Name:</span> {form.name}</p>
              <p className="text-[#1a1a2e]/70"><span className="text-[#1a1a2e]/40">Email:</span> {form.email}</p>
              <p className="text-[#1a1a2e]/70"><span className="text-[#1a1a2e]/40">Course:</span> {form.course || "Not selected"}</p>
            </div>
          </div>
          <button onClick={() => { setSubmitted(false); setCurrentStep(1); setForm({ name: "", email: "", mobile: "", sex: "", country: "", state: "", course: "", employment: "", laptop: "", reason: "" }) }} className="px-6 py-2.5 rounded-lg bg-[#1a1a2e]/10 border border-[#1a1a2e]/20 text-[#1a1a2e]/70 text-sm hover:bg-[#1a1a2e]/20 transition">Register Another Student</button>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef4444]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#991b1b]/6 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Registration</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a2e] mb-4 tracking-tight leading-[1.05]">
            READY TO START YOUR<br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-700 bg-clip-text text-transparent">
                JOURNEY?
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 8 Q25 2 50 8 T100 6" stroke="url(#swooshGradientReg)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <defs>
                  <linearGradient id="swooshGradientReg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#dc2626" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>
          
          <p className="text-base md:text-xl text-[#6b6b7b] max-w-2xl mx-auto leading-relaxed font-medium">
            Fill out the form below and we'll get you enrolled in no time.
          </p>
          
          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-300" />
            <div className="w-2 h-2 bg-red-400 rounded-full rotate-45" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-300" />
          </div>
        </div>

        {/* Wizard Card */}
        <div ref={cardRef} className="max-w-xl mx-auto" style={{ transform: `translateY(${slideOffset}px)`, transition: "transform 0.3s ease-out" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
              e.preventDefault()
              if (currentStep < 6) goNext()
              else handleSubmit()
            }
          }}
        >
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-[#5a5a6e] font-mono tracking-wider uppercase">{STEPS[currentStep - 1].label}</span>
              <span className="text-[11px] text-[#5a5a6e]/60">Step {currentStep} of {STEPS.length}</span>
            </div>
            <div className="h-1 bg-[#1a1a2e]/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#dc2626] rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Step content */}
          <div className="p-6 sm:p-8 rounded-2xl card-premium bg-white">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a2e] mb-1">{STEPS[currentStep - 1].heading}</h3>
              <p className="text-[#5a5a6e] text-sm">{STEPS[currentStep - 1].subtext}</p>
            </div>

            {/* Step 1: Personal Identity */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Full Name *</label>
                  <input type="text" placeholder="Enter your full name" value={form.name} autoFocus
                    onChange={(e) => updateForm("name", e.target.value.replace(/[0-9]/g, ""))}
                    className={`w-full px-5 py-4 rounded-xl bg-[#1a1a2e]/[0.04] border text-[#1a1a2e] placeholder-[#5a5a6e]/40 text-sm focus:outline-none focus:border-[#dc2626]/50 focus:bg-[#1a1a2e]/[0.06] transition-all duration-200 ${errors.name ? "border-red-500/50" : "border-[#1a1a2e]/10"}`} />
                  {errors.name && <p id="err-name" className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Email Address *</label>
                  <div className="relative">
                    <input type="email" placeholder="Enter your email address" value={form.email} autoComplete="off"
                      onChange={(e) => updateForm("email", e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={(e) => { setEmailFocused(false); checkEmailDuplicate(e.target.value) }}
                      disabled={emailChecking}
                      className={`w-full px-5 py-4 rounded-xl bg-[#1a1a2e]/[0.04] border text-[#1a1a2e] placeholder-[#5a5a6e]/40 text-sm focus:outline-none focus:border-[#dc2626]/50 focus:bg-[#1a1a2e]/[0.06] transition-all duration-200 ${
                        errors.email ? "border-red-500/50" : emailStatus.status === "duplicate" ? "border-red-500/50" : emailStatus.status === "available" ? "border-green-500/50" : "border-[#1a1a2e]/10"
                      } ${emailChecking ? "opacity-70" : ""}`} />
                    {emailStatus.status === "checking" && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-[#dc2626]/30 border-t-[#dc2626] rounded-full animate-spin" /></div>}
                    {emailStatus.status === "available" && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-medium">✓</div>}
                    {emailStatus.status === "duplicate" && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium">✗</div>}
                  </div>
                  {errors.email && <p id="err-email" className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  {emailStatus.status === "duplicate" && !errors.email && <p className="text-red-500/80 text-[11px] mt-1">{emailStatus.message}</p>}
                  {emailStatus.status === "available" && <p className="text-[#dc2626]/70 text-[10px] mt-1">Note: If this email is wrong, you will not receive updates about your application, classes, or program activities.</p>}
                  {emailFocused && emailStatus.status !== "available" && <p className="text-[#5a5a6e] text-[11px] mt-1">Please enter a valid email address that you actively use. Important updates will be sent to this email.</p>}
                </div>
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">WhatsApp Number *</label>
                  <div className="flex gap-3">
                    <div className="relative shrink-0" style={{ minWidth: "100px", maxWidth: "120px" }}>
                      <select defaultValue="+234" onChange={(e) => updateForm("dialCode", e.target.value)}
                        className="w-full px-2 py-4 pr-6 rounded-xl bg-white border border-[#1a1a2e]/10 text-[#1a1a2e]/70 text-xs sm:text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer">
                        <option value="+234">+234 (NG)</option><option value="+1">+1 (US/CA)</option><option value="+44">+44 (GB)</option>
                        <option value="+91">+91 (IN)</option><option value="+254">+254 (KE)</option><option value="+233">+233 (GH)</option>
                        <option value="+27">+27 (ZA)</option><option value="+256">+256 (UG)</option><option value="+260">+260 (ZM)</option>
                      </select>
                      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <input type="tel" placeholder="Enter your active WhatsApp number" value={form.mobile} autoComplete="off"
                      onChange={(e) => updateForm("mobile", e.target.value.replace(/\D/g, "").slice(0, 15))}
                      onFocus={() => setWhatsappFocused(true)} onBlur={() => setWhatsappFocused(false)}
                      inputMode="numeric" className={`flex-1 px-5 py-4 rounded-xl bg-[#1a1a2e]/[0.04] border text-[#1a1a2e] placeholder-[#5a5a6e]/40 text-sm focus:outline-none focus:border-[#dc2626]/50 focus:bg-[#1a1a2e]/[0.06] transition-all duration-200 ${errors.mobile ? "border-red-500/50" : "border-[#1a1a2e]/10"}`} />
                  </div>
                  {errors.mobile && <p id="err-mobile" className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  {form.mobile.trim().length >= 7 && !errors.mobile && <p className="text-[#dc2626]/70 text-[10px] mt-1">Note: If this WhatsApp number is wrong, you will not receive updates about your application.</p>}
                  {whatsappFocused && !(form.mobile.trim().length >= 7 && !errors.mobile) && <p className="text-[#5a5a6e] text-[11px] mt-1">Please provide a valid WhatsApp number that you actively use.</p>}
                </div>
              </div>
            )}

            {/* Step 3: Demographics */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Sex *</label>
                  <div className="relative">
                    <select value={form.sex} onChange={(e) => updateForm("sex", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-[#1a1a2e]/70 text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer ${errors.sex ? "border-red-500/50" : "border-[#1a1a2e]/10"}`}>
                      <option value="" disabled>Select your sex</option><option value="male">Male</option><option value="female">Female</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.sex && <p id="err-sex" className="text-red-500 text-xs mt-1">{errors.sex}</p>}
                </div>
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Country *</label>
                  <div className="relative">
                    <select value={form.country} onChange={(e) => { updateForm("country", e.target.value); updateForm("state", "") }}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-[#1a1a2e]/70 text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer ${errors.country ? "border-red-500/50" : "border-[#1a1a2e]/10"}`}>
                      <option value="" disabled>{loadingCountries ? "Loading..." : "Select country"}</option>
                      {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.country && <p id="err-country" className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                {loadingStates && (
                  <div><label className="label-text text-[#1a1a2e]/60 mb-2 block">State/Province</label>
                  <select disabled className="w-full px-5 py-4 rounded-xl bg-[#1a1a2e]/[0.02] border border-[#1a1a2e]/5 text-[#5a5a6e]/40 text-sm cursor-not-allowed"><option>Loading states...</option></select></div>
                )}
                {!loadingStates && states.length > 0 && (
                  <div><label className="label-text text-[#1a1a2e]/60 mb-2 block">State/Province *</label>
                  <div className="relative">
                    <select value={form.state} onChange={(e) => updateForm("state", e.target.value)}
                      className="w-full px-5 py-4 rounded-xl bg-white border border-[#1a1a2e]/10 text-[#1a1a2e]/70 text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer">
                      <option value="" disabled>Select state</option>
                      {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div></div>
                )}
                {!loadingStates && form.country && form.country !== "OTHER" && states.length === 0 && <p className="text-[#5a5a6e]/60 text-xs italic">This country has no states/provinces.</p>}
              </div>
            )}

            {/* Step 4: Course Selection */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Course Applying For *</label>
                  <div className="relative">
                    <select value={form.course} onChange={(e) => updateForm("course", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-[#1a1a2e]/70 text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer ${errors.course ? "border-red-500/50" : "border-[#1a1a2e]/10"}`}>
                      <option value="" disabled>Select course</option>
                      {COURSES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.course && <p id="err-course" className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Employment Status *</label>
                  <div className="relative">
                    <select value={form.employment} onChange={(e) => updateForm("employment", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-[#1a1a2e]/70 text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer ${errors.employment ? "border-red-500/50" : "border-[#1a1a2e]/10"}`}>
                      <option value="" disabled>Select status</option><option value="employed">Employed</option><option value="unemployed">Unemployed</option>
                      <option value="student">Student</option><option value="freelancer">Freelancer</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.employment && <p id="err-employment" className="text-red-500 text-xs mt-1">{errors.employment}</p>}
                </div>
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Do You Have a Laptop? *</label>
                  <div className="relative">
                    <select value={form.laptop} onChange={(e) => updateForm("laptop", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-[#1a1a2e]/70 text-sm focus:outline-none focus:border-[#dc2626]/50 transition-all duration-200 appearance-none cursor-pointer ${errors.laptop ? "border-red-500/50" : "border-[#1a1a2e]/10"}`}>
                      <option value="" disabled>Select option</option><option value="yes">Yes</option><option value="no">No</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.laptop && <p id="err-laptop" className="text-red-500 text-xs mt-1">{errors.laptop}</p>}
                </div>
              </div>
            )}

            {/* Step 5: Motivation */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="label-text text-[#1a1a2e]/60 mb-2 block">Why Do You Want To Learn This Skill? *</label>
                  <textarea placeholder="Tell us briefly why you want to learn this course..." rows={5} value={form.reason}
                    onChange={(e) => updateForm("reason", e.target.value)}
                    className={`w-full px-5 py-4 rounded-xl bg-[#1a1a2e]/[0.04] border text-[#1a1a2e] placeholder-[#5a5a6e]/40 text-sm focus:outline-none focus:border-[#dc2626]/50 focus:bg-[#1a1a2e]/[0.06] transition-all duration-200 resize-none ${errors.reason ? "border-red-500/50" : "border-[#1a1a2e]/10"}`} />
                  {errors.reason && <p id="err-reason" className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#1a1a2e]/10 bg-[#1a1a2e]/[0.02] divide-y divide-[#1a1a2e]/5">
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#5a5a6e] mb-1">Personal Information</p>
                    <p className="text-[#1a1a2e]/80 text-sm">{form.name}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#5a5a6e] mb-1">Contact</p>
                    <p className="text-[#1a1a2e]/80 text-sm">{form.email}</p>
                    <p className="text-[#5a5a6e] text-xs mt-0.5">WhatsApp: {form.mobile}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#5a5a6e] mb-1">Demographics</p>
                    <p className="text-[#1a1a2e]/80 text-sm capitalize">{form.sex || "—"} · {countryLabel} {form.state ? `· ${states.find(s => s.code === form.state)?.name || form.state}` : ""}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#5a5a6e] mb-1">Academic</p>
                    <p className="text-[#1a1a2e]/80 text-sm capitalize">{form.course || "—"}</p>
                    <p className="text-[#5a5a6e] text-xs mt-0.5 capitalize">{form.employment || "—"} · Laptop: {form.laptop || "—"}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#5a5a6e] mb-1">Motivation</p>
                    <p className="text-[#1a1a2e]/80 text-sm">{form.reason || "—"}</p>
                  </div>
                </div>
                <p className="text-[#dc2626]/70 text-[10px]">Note: Please review your details. Once submitted, you will be contacted via the email and WhatsApp number provided.</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#1a1a2e]/5">
              {currentStep > 1 ? (
                <button onClick={goBack} className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#1a1a2e]/10 text-[#5a5a6e] text-sm hover:bg-[#1a1a2e]/5 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  Back
                </button>
              ) : <div />}
              {currentStep < 6 ? (
                <button onClick={goNext} disabled={currentStep === 2 && emailChecking}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#dc2626] text-white text-sm font-medium hover:bg-[#b91c1c] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#dc2626] text-white text-sm font-medium hover:bg-[#b91c1c] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : "Submit Application"}
                </button>
              )}
            </div>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-6">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => {
                if (i + 1 < currentStep) {
                  setDirection("back"); setSlideOffset(30)
                  setTimeout(() => { setCurrentStep(i + 1); setSlideOffset(-30); setTimeout(() => setSlideOffset(0), 50) }, 50)
                }
              }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep ? "bg-[#dc2626] w-6" : i + 1 < currentStep ? "bg-[#dc2626]/40 w-1.5" : "bg-[#1a1a2e]/10 w-1.5"
                } ${i + 1 < currentStep ? "cursor-pointer hover:bg-[#dc2626]/60" : "cursor-default"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}