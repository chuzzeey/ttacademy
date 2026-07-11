'use client'

import { useState, useEffect, useRef } from 'react'

const COURSES = [
  "Cybersecurity", "Data Science", "AI Automation", "Computer Networking",
  "Ethical Hacking", "Graphic Design", "UI/UX Design", "Full Stack Development",
  "Frontend Development", "Backend Development", "Web Development",
  "Digital Marketing", "Cloud Computing", "Data Analysis",
]

const AFRICAN_COUNTRIES = [
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "DZ", name: "Algeria", dial: "+213" },
]

export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", dialCode: "+234", sex: "", country: "", state: "",
    course: "", employment: "", laptop: "", reason: "",
  })

  const [countries] = useState<{ code: string; name: string; dial: string }[]>(AFRICAN_COUNTRIES)
  const [states, setStates] = useState<{ code: string; name: string }[]>([])
  const [loadingCountries] = useState(false)
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
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submitted && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [submitted])


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

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Full name is required"
    else if (/\d/.test(form.name)) e.name = "Name should not contain numbers."
    else if (form.name.trim().split(/\s+/).filter((w: string) => w.length > 0).length < 2) e.name = "Please enter your second name as well."

    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Please enter a valid email address"
    else if (emailStatus.status === "duplicate") e.email = emailStatus.message

    if (!form.mobile.trim()) e.mobile = "Please enter a valid WhatsApp number."
    else { const d = form.mobile.replace(/\D/g, ""); if (/^0+$/.test(d) || /^(\d)\1{4,}$/.test(d) || d.length < 7 || d.length > 15) e.mobile = "Please enter a valid WhatsApp number." }

    if (!form.sex) e.sex = "Please select your sex"
    if (!form.country) e.country = "Please select your country"
    if (!form.course) e.course = "Please select a course"
    if (!form.employment) e.employment = "Please select employment status"
    if (!form.laptop) e.laptop = "Please select an option"
    if (!form.reason.trim()) e.reason = "Please tell us why you want to learn this skill"

    setErrors(e)
    if (Object.keys(e).length > 0) {
      const firstError = Object.keys(e)[0]
      const el = document.getElementById(`err-${firstError}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    const fullPhone = `${form.dialCode}${form.mobile}`
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

  if (submitted) {
    return (
      <section ref={successRef} id="contact" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#ef4444]/5 to-transparent rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-md relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
          <p className="text-gray-500 text-sm mb-2">Thank you, <span className="text-gray-900 font-medium">{form.name.split(" ")[0]}</span>!</p>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">We will contact you via <span className="text-gray-900 font-medium">email</span> and <span className="text-gray-900 font-medium">WhatsApp</span> using the details you provided. Please check your inbox regularly for updates.</p>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 mb-6">
            <p className="text-gray-400 text-xs mb-2">Application Summary</p>
            <div className="text-left space-y-1 text-sm">
              <p className="text-gray-600"><span className="text-gray-400">Name:</span> {form.name}</p>
              <p className="text-gray-600"><span className="text-gray-400">Email:</span> {form.email}</p>
              <p className="text-gray-600"><span className="text-gray-400">Course:</span> {form.course || "Not selected"}</p>
            </div>
          </div>
          <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", mobile: "", dialCode: "+234", sex: "", country: "", state: "", course: "", employment: "", laptop: "", reason: "" }) }} className="px-6 py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-sm hover:bg-gray-200 transition">Register Another Student</button>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="w-full px-4 md:px-8 lg:px-16 py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef4444]/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#991b1b]/6 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-red-100 rounded-full shadow-sm mb-5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">Registration</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.05]">
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

          <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Fill out the form below and we'll get you enrolled in no time.
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-300" />
            <div className="w-2 h-2 bg-red-400 rounded-full rotate-45" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-300" />
          </div>
        </div>

        <div ref={formRef} className="max-w-2xl mx-auto">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
            {/* Personal Information */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Full Name *</label>
                  <input type="text" placeholder="Enter your full name" value={form.name}
                    onChange={(e) => updateForm("name", e.target.value.replace(/[0-9]/g, ""))}
                    className={`w-full px-5 py-4 rounded-xl bg-gray-50/50 border text-gray-900 placeholder:text-gray-400/40 text-sm focus:outline-none focus:border-red-400/50 focus:bg-gray-50/70 transition-all duration-200 ${errors.name ? "border-red-500/50" : "border-gray-200"}`} />
                  {errors.name && <p id="err-name" className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Email Address *</label>
                  <div className="relative">
                    <input type="email" placeholder="Enter your email address" value={form.email} autoComplete="off"
                      onChange={(e) => updateForm("email", e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={(e) => { setEmailFocused(false); checkEmailDuplicate(e.target.value) }}
                      disabled={emailChecking}
                      className={`w-full px-5 py-4 rounded-xl bg-gray-50/50 border text-gray-900 placeholder:text-gray-400/40 text-sm focus:outline-none focus:border-red-400/50 focus:bg-gray-50/70 transition-all duration-200 ${
                        errors.email ? "border-red-500/50" : emailStatus.status === "duplicate" ? "border-red-500/50" : emailStatus.status === "available" ? "border-green-500/50" : "border-gray-200"
                      } ${emailChecking ? "opacity-70" : ""}`} />
                    {emailStatus.status === "checking" && <div className="absolute right-4 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" /></div>}
                    {emailStatus.status === "available" && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-medium">✓</div>}
                    {emailStatus.status === "duplicate" && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm font-medium">✗</div>}
                  </div>
                  {errors.email && <p id="err-email" className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  {emailStatus.status === "duplicate" && !errors.email && <p className="text-red-500/80 text-[11px] mt-1">{emailStatus.message}</p>}
                  {emailStatus.status === "available" && <p className="text-red-500/70 text-[10px] mt-1">Note: If this email is wrong, you will not receive updates about your application, classes, or program activities.</p>}
                  {emailFocused && emailStatus.status !== "available" && <p className="text-gray-400 text-[11px] mt-1">Please enter a valid email address that you actively use. Important updates will be sent to this email.</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">WhatsApp Number *</label>
                  <div className="flex flex-row gap-2">
                    <div className="relative shrink-0" style={{ width: "90px" }}>
                      <select value={form.dialCode} onChange={(e) => updateForm("dialCode", e.target.value)}
                        className="w-full px-2 py-4 pr-5 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer">
                        {AFRICAN_COUNTRIES.map(c => (
                          <option key={c.dial} value={c.dial}>{c.dial}</option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <input type="tel" placeholder="Enter your active WhatsApp number" value={form.mobile} autoComplete="off"
                      onChange={(e) => updateForm("mobile", e.target.value.replace(/\D/g, "").slice(0, 15))}
                      onFocus={() => setWhatsappFocused(true)} onBlur={() => setWhatsappFocused(false)}
                      inputMode="numeric" className={`flex-1 min-w-0 px-4 py-4 rounded-xl bg-gray-50/50 border text-gray-900 placeholder:text-gray-400/40 text-sm focus:outline-none focus:border-red-400/50 focus:bg-gray-50/70 transition-all duration-200 ${errors.mobile ? "border-red-500/50" : "border-gray-200"}`} />
                  </div>
                  {errors.mobile && <p id="err-mobile" className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  {form.mobile.trim().length >= 7 && !errors.mobile && <p className="text-red-500/70 text-[10px] mt-1">Note: If this WhatsApp number is wrong, you will not receive updates about your application.</p>}
                  {whatsappFocused && !(form.mobile.trim().length >= 7 && !errors.mobile) && <p className="text-gray-400 text-[11px] mt-1">Please provide a valid WhatsApp number that you actively use.</p>}
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Sex *</label>
                  <div className="relative">
                    <select value={form.sex} onChange={(e) => updateForm("sex", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer ${errors.sex ? "border-red-500/50" : "border-gray-200"}`}>
                      <option value="" disabled>Select your sex</option><option value="male">Male</option><option value="female">Female</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.sex && <p id="err-sex" className="text-red-500 text-xs mt-1">{errors.sex}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Country *</label>
                  <div className="relative">
                    <select value={form.country} onChange={(e) => {
                      updateForm("country", e.target.value)
                      updateForm("state", "")
                      const country = AFRICAN_COUNTRIES.find(c => c.code === e.target.value)
                      if (country) updateForm("dialCode", country.dial)
                    }}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer ${errors.country ? "border-red-500/50" : "border-gray-200"}`}>
                      <option value="" disabled>Select country</option>
                      {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.country && <p id="err-country" className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                {loadingStates && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">State/Province</label>
                    <select disabled className="w-full px-5 py-4 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-400/40 text-sm cursor-not-allowed"><option>Loading states...</option></select>
                  </div>
                )}
                {!loadingStates && states.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">State/Province</label>
                    <div className="relative">
                      <select value={form.state} onChange={(e) => updateForm("state", e.target.value)}
                        className="w-full px-5 py-4 rounded-xl bg-white border border-gray-200 text-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer">
                        <option value="" disabled>Select state</option>
                        {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                )}
                {!loadingStates && form.country && form.country !== "OTHER" && states.length === 0 && <p className="text-gray-400/60 text-xs italic self-end pb-4">This country has no states/provinces.</p>}
              </div>
            </div>

            {/* Course Selection */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Course Selection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Course Applying For *</label>
                  <div className="relative">
                    <select value={form.course} onChange={(e) => updateForm("course", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer ${errors.course ? "border-red-500/50" : "border-gray-200"}`}>
                      <option value="" disabled>Select course</option>
                      {COURSES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.course && <p id="err-course" className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Employment Status *</label>
                  <div className="relative">
                    <select value={form.employment} onChange={(e) => updateForm("employment", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer ${errors.employment ? "border-red-500/50" : "border-gray-200"}`}>
                      <option value="" disabled>Select status</option><option value="employed">Employed</option><option value="unemployed">Unemployed</option>
                      <option value="student">Student</option><option value="freelancer">Freelancer</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.employment && <p id="err-employment" className="text-red-500 text-xs mt-1">{errors.employment}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Do You Have a Laptop? *</label>
                  <div className="relative">
                    <select value={form.laptop} onChange={(e) => updateForm("laptop", e.target.value)}
                      className={`w-full px-5 py-4 rounded-xl bg-white border text-gray-600 text-sm focus:outline-none focus:border-red-400/50 transition-all duration-200 appearance-none cursor-pointer ${errors.laptop ? "border-red-500/50" : "border-gray-200"}`}>
                      <option value="" disabled>Select option</option><option value="yes">Yes</option><option value="no">No</option>
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  {errors.laptop && <p id="err-laptop" className="text-red-500 text-xs mt-1">{errors.laptop}</p>}
                </div>
              </div>
            </div>

            {/* Motivation */}
            <div className="pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Motivation</h3>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Why Do You Want To Learn This Skill? *</label>
                <textarea placeholder="Tell us briefly why you want to learn this course..." rows={4} value={form.reason}
                  onChange={(e) => updateForm("reason", e.target.value)}
                  className={`w-full px-5 py-4 rounded-xl bg-gray-50/50 border text-gray-900 placeholder:text-gray-400/40 text-sm focus:outline-none focus:border-red-400/50 focus:bg-gray-50/70 transition-all duration-200 resize-none ${errors.reason ? "border-red-500/50" : "border-gray-200"}`} />
                {errors.reason && <p id="err-reason" className="text-red-500 text-xs mt-1">{errors.reason}</p>}
              </div>
            </div>

            {/* Submit */}
            <div className="text-center">
              <p className="text-red-500/70 text-[10px] mb-4">Please review your details carefully before submitting.</p>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full md:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-base font-semibold hover:from-red-700 hover:to-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-red-600/25">
                {submitting ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-2 align-middle" /> Submitting...</> : "Submit Application"}
              </button>
            </div>
          </div>

          {/* WhatsApp Group CTA */}
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 text-center max-w-md">
              Want to connect with other learners and get updates? Join our WhatsApp group below.
            </p>
            <a
              href="https://chat.whatsapp.com/H3iTluQFKWh9i9X9wqFMEe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.82 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.327-1.682a9.86 9.86 0 005.26 1.483h.004c5.45 0 9.884-4.434 9.884-9.884 0-2.64-1.03-5.122-2.898-6.988z"/>
              </svg>
              Join our WhatsApp Group
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}