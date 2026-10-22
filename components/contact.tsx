'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { BRAND_LOGO_URL } from '@/lib/brand'
import { COURSE_CATALOG } from '@/lib/course-catalog'

const AFRICAN_COUNTRIES = [
  { code: "NG", name: "Nigeria", dial: "+234" },
  { code: "ZA", name: "South Africa", dial: "+27" },
  { code: "EG", name: "Egypt", dial: "+20" },
  { code: "KE", name: "Kenya", dial: "+254" },
  { code: "MA", name: "Morocco", dial: "+212" },
  { code: "ET", name: "Ethiopia", dial: "+251" },
  { code: "DZ", name: "Algeria", dial: "+213" },
]

// Fallback states for countries in case API fails
const FALLBACK_STATES: Record<string, { code: string; name: string }[]> = {
  NG: [
    { code: "AB", name: "Abia" }, { code: "AD", name: "Adamawa" }, { code: "AK", name: "Akwa Ibom" },
    { code: "AN", name: "Anambra" }, { code: "BA", name: "Bauchi" }, { code: "BY", name: "Bayelsa" },
    { code: "BE", name: "Benue" }, { code: "BO", name: "Borno" }, { code: "CR", name: "Cross River" },
    { code: "DE", name: "Delta" }, { code: "EB", name: "Ebonyi" }, { code: "ED", name: "Edo" },
    { code: "EK", name: "Ekiti" }, { code: "EN", name: "Enugu" }, { code: "GO", name: "Gombe" },
    { code: "IM", name: "Imo" }, { code: "JI", name: "Jigawa" }, { code: "KD", name: "Kaduna" },
    { code: "KN", name: "Kano" }, { code: "KT", name: "Katsina" }, { code: "KE", name: "Kebbi" },
    { code: "KO", name: "Kogi" }, { code: "KW", name: "Kwara" }, { code: "LA", name: "Lagos" },
    { code: "NA", name: "Nasarawa" }, { code: "NI", name: "Niger" }, { code: "OG", name: "Ogun" },
    { code: "ON", name: "Ondo" }, { code: "OS", name: "Osun" }, { code: "OY", name: "Oyo" },
    { code: "PL", name: "Plateau" }, { code: "RI", name: "Rivers" }, { code: "SO", name: "Sokoto" },
    { code: "TA", name: "Taraba" }, { code: "YO", name: "Yobe" }, { code: "ZA", name: "Zamfara" },
    { code: "FC", name: "Federal Capital Territory" }
  ],
  ZA: [
    { code: "EC", name: "Eastern Cape" }, { code: "FS", name: "Free State" }, { code: "GP", name: "Gauteng" },
    { code: "KZN", name: "KwaZulu-Natal" }, { code: "LP", name: "Limpopo" }, { code: "MP", name: "Mpumalanga" },
    { code: "NC", name: "Northern Cape" }, { code: "NW", name: "North West" }, { code: "WC", name: "Western Cape" }
  ],
  EG: [
    { code: "ALX", name: "Alexandria" }, { code: "ASN", name: "Aswan" }, { code: "AST", name: "Asyut" },
    { code: "BH", name: "Beheira" }, { code: "BNS", name: "Beni Suef" }, { code: "C", name: "Cairo" },
    { code: "DK", name: "Dakahlia" }, { code: "DT", name: "Damietta" }, { code: "FYM", name: "Faiyum" },
    { code: "GH", name: "Gharbia" }, { code: "GZ", name: "Giza" }, { code: "IS", name: "Ismailia" },
    { code: "JS", name: "South Sinai" }, { code: "KB", name: "Qalyubia" }, { code: "KFS", name: "Kafr El Sheikh" },
    { code: "LX", name: "Luxor" }, { code: "MN", name: "Minya" }, { code: "MNF", name: "Monufia" },
    { code: "MT", name: "Matrouh" }, { code: "PTS", name: "Port Said" }, { code: "SHG", name: "Sohag" },
    { code: "SHR", name: "Sharqia" }, { code: "SIN", name: "North Sinai" }, { code: "SUZ", name: "Suez" }
  ],
  KE: [
    { code: "KE-01", name: "Mombasa" }, { code: "KE-02", name: "Kwale" }, { code: "KE-03", name: "Kilifi" },
    { code: "KE-04", name: "Tana River" }, { code: "KE-05", name: "Lamu" }, { code: "KE-06", name: "Taita-Taveta" },
    { code: "KE-07", name: "Garissa" }, { code: "KE-08", name: "Wajir" }, { code: "KE-09", name: "Mandera" },
    { code: "KE-10", name: "Marsabit" }, { code: "KE-11", name: "Isiolo" }, { code: "KE-12", name: "Meru" },
    { code: "KE-13", name: "Tharaka-Nithi" }, { code: "KE-14", name: "Embu" }, { code: "KE-15", name: "Kitui" },
    { code: "KE-16", name: "Machakos" }, { code: "KE-17", name: "Makueni" }, { code: "KE-18", name: "Nyandarua" },
    { code: "KE-19", name: "Nyeri" }, { code: "KE-20", name: "Kirinyaga" }, { code: "KE-21", name: "Murang'a" },
    { code: "KE-22", name: "Kiambu" }, { code: "KE-23", name: "Turkana" }, { code: "KE-24", name: "West Pokot" },
    { code: "KE-25", name: "Samburu" }, { code: "KE-26", name: "Trans Nzoia" }, { code: "KE-27", name: "Uasin Gishu" },
    { code: "KE-28", name: "Elgeyo-Marakwet" }, { code: "KE-29", name: "Nandi" }, { code: "KE-30", name: "Baringo" },
    { code: "KE-31", name: "Laikipia" }, { code: "KE-32", name: "Nakuru" }, { code: "KE-33", name: "Narok" },
    { code: "KE-34", name: "Kajiado" }, { code: "KE-35", name: "Kericho" }, { code: "KE-36", name: "Bomet" },
    { code: "KE-37", name: "Kakamega" }, { code: "KE-38", name: "Vihiga" }, { code: "KE-39", name: "Bungoma" },
    { code: "KE-40", name: "Busia" }, { code: "KE-41", name: "Siaya" }, { code: "KE-42", name: "Kisumu" },
    { code: "KE-43", name: "Homa Bay" }, { code: "KE-44", name: "Migori" }, { code: "KE-45", name: "Kisii" },
    { code: "KE-46", name: "Nyamira" }, { code: "KE-47", name: "Nairobi" }
  ],
  MA: [
    { code: "MA-01", name: "Tanger-Tetouan-Al Hoceima" }, { code: "MA-02", name: "Oriental" },
    { code: "MA-03", name: "Fes-Meknes" }, { code: "MA-04", name: "Rabat-Sale-Kenitra" },
    { code: "MA-05", name: "Beni Mellal-Khenifra" }, { code: "MA-06", name: "Casablanca-Settat" },
    { code: "MA-07", name: "Marrakesh-Safi" }, { code: "MA-08", name: "Draa-Tafilalet" },
    { code: "MA-09", name: "Souss-Massa" }, { code: "MA-10", name: "Guelmim-Oued Noun" },
    { code: "MA-11", name: "Laayoune-Sakia El Hamra" }, { code: "MA-12", name: "Dakhla-Oued Ed-Dahab" }
  ],
  ET: [
    { code: "AF", name: "Afar" }, { code: "AM", name: "Amhara" }, { code: "BE", name: "Benishangul-Gumuz" },
    { code: "DD", name: "Dire Dawa" }, { code: "GA", name: "Gambela" }, { code: "HA", name: "Harari" },
    { code: "OR", name: "Oromia" }, { code: "SO", name: "Somali" }, { code: "SN", name: "Southern Nations" },
    { code: "TI", name: "Tigray" }, { code: "AA", name: "Addis Ababa" }
  ],
  DZ: [
    { code: "ADR", name: "Adrar" }, { code: "CHL", name: "Chlef" }, { code: "LAG", name: "Laghouat" },
    { code: "OUM", name: "Oum el Bouaghi" }, { code: "BAT", name: "Batna" }, { code: "BJA", name: "Béjaïa" },
    { code: "BIS", name: "Biskra" }, { code: "BEC", name: "Béchar" }, { code: "BLI", name: "Blida" },
    { code: "BOU", name: "Bouira" }, { code: "TAM", name: "Tamanrasset" }, { code: "TEB", name: "Tébessa" },
    { code: "TLE", name: "Tlemcen" }, { code: "TIA", name: "Tiaret" }, { code: "TIZ", name: "Tizi Ouzou" },
    { code: "ALG", name: "Algiers" }, { code: "DJL", name: "Djelfa" }, { code: "JIJ", name: "Jijel" },
    { code: "SET", name: "Sétif" }, { code: "SAI", name: "Saïda" }, { code: "SKI", name: "Skikda" },
    { code: "SIB", name: "Sidi Bel Abbès" }, { code: "ANN", name: "Annaba" }, { code: "GUE", name: "Guelma" },
    { code: "CON", name: "Constantine" }, { code: "MED", name: "Médéa" }, { code: "MOST", name: "Mostaganem" },
    { code: "MSI", name: "M'Sila" }, { code: "MASC", name: "Mascara" }, { code: "OUA", name: "Ouargla" },
    { code: "ORA", name: "Oran" }, { code: "BAJ", name: "El Bayadh" }, { code: "ILL", name: "Illizi" },
    { code: "BOR", name: "Bordj Bou Arréridj" }, { code: "BAM", name: "Boumerdès" }, { code: "ELF", name: "El Tarf" },
    { code: "TIN", name: "Tindouf" }, { code: "TISS", name: "Tissemsilt" }, { code: "ELO", name: "El Oued" },
    { code: "KHE", name: "Khenchela" }, { code: "SOU", name: "Souk Ahras" }, { code: "TIP", name: "Tipaza" },
    { code: "MIL", name: "Mila" }, { code: "AIN", name: "Aïn Defla" }, { code: "NAAMA", name: "Naâma" },
    { code: "AIM", name: "Aïn Témouchent" }, { code: "GHA", name: "Ghardaïa" }, { code: "REL", name: "Relizane" }
  ]
}

function HeaderNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq-section')
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <button
            onClick={() => window.location.reload()}
            className="flex flex-col items-start gap-1 bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Image src={BRAND_LOGO_URL} alt="Tech Trailblazer Academy" width={80} height={32} className="h-7 md:h-8 w-auto" priority />
            <span className="text-[9px] md:text-[10px] font-bold text-gray-900 tracking-wide">
              Tech Trailblazer Academy
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full p-1 border border-gray-100/50 shadow-sm">
            {['Home', 'Register', 'FAQ'].map((item) => {
              const handleClick = () => {
                switch(item) {
                  case 'Home': scrollToTop(); break
                  case 'Register': scrollToContact(); break
                  case 'FAQ': scrollToFAQ(); break
                }
              }
              return (
                <button
                  key={item}
                  onClick={handleClick}
                  className="text-sm font-medium text-gray-900 hover:text-white px-5 py-2 rounded-full hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600/80 transition-all duration-200"
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

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
  const [showEmailExistsPopup, setShowEmailExistsPopup] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submitted && successRef.current) {
      // Small delay to ensure the DOM has updated
      setTimeout(() => {
        successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    }
  }, [submitted])


  useEffect(() => {
    const fetchStates = async () => {
      if (!form.country || form.country === "OTHER") { setStates([]); return }
      setLoadingStates(true)
      
      // Try fallback states first (instant, no API call needed)
      const fallbackStates = FALLBACK_STATES[form.country]
      if (fallbackStates) {
        setStates(fallbackStates.sort((a, b) => a.name.localeCompare(b.name)))
        setLoadingStates(false)
        return
      }
      
      // If no fallback, try API
      try {
        const res = await fetch("https://countriesnow.space/api/v0.1/countries/states")
        if (!res.ok) throw new Error("Failed")
        const data = await res.json()
        if (data?.data && Array.isArray(data.data)) {
          const cd = data.data.find((i: any) => i.iso2 === form.country || i.iso3 === form.country)
          if (cd?.states && Array.isArray(cd.states)) {
            setStates(cd.states.map((s: any) => ({ code: s.name, name: s.name })).sort((a: any, b: any) => a.name.localeCompare(b.name)))
          } else { setStates([]) }
        } else { setStates([]) }
      } catch {
        setStates([])
      } finally {
        setLoadingStates(false)
      }
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

    if (!form.mobile.trim()) e.mobile = "WhatsApp number is required"
    else { 
      const d = form.mobile.replace(/\D/g, ""); 
      if (/^0+$/.test(d) || /^(\d)\1{4,}$/.test(d) || d.length < 7 || d.length > 14) 
        e.mobile = "Please enter a valid WhatsApp number (7-14 digits only)." 
    }

    if (!form.sex) e.sex = "Please select your sex"
    if (!form.country) e.country = "Please select your country"
    if (!form.state && form.country && form.country !== "OTHER" && states.length > 0) e.state = "Please select your state/province"
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
      const r = await res.json()
      if (res.ok) {
        setSubmitted(true)
      } else { 
        // Check if email already exists
        if (r.code === "EMAIL_EXISTS") {
          setShowEmailExistsPopup(true)
        } else {
          const errorMsg = typeof r.error === 'string' ? r.error : JSON.stringify(r.error) || 'Please try again later.'
          alert(`Registration failed: ${errorMsg}`) 
        }
      }
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

  // Email Exists Popup
  if (showEmailExistsPopup) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Email Already Registered</h3>
          <p className="text-gray-600 text-sm mb-6 text-center leading-relaxed">
            This email address is already registered in our system. Please use a different email or contact support if you need to access your existing account.
          </p>
          <button 
            onClick={() => setShowEmailExistsPopup(false)}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            I Understand
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <HeaderNav />
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
                      onChange={(e) => updateForm("mobile", e.target.value.replace(/[^0-9]/g, "").slice(0, 14))}
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
                {errors.state && <p id="err-state" className="text-red-500 text-xs mt-1">{errors.state}</p>}
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
                      {COURSE_CATALOG.map(({ title }) => <option key={title} value={title.toLowerCase()}>{title}</option>)}
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

      
        </div>
      </div>
      </section>
    </>
  )
}