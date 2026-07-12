'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, Search, GraduationCap } from 'lucide-react'
import { useState } from 'react'

interface Course {
  id: string
  title: string
  description: string
  duration: string
  lessons: string
  image: string
}

const courses: Course[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Teach ethical hacking, network security, and cyber defense strategies',
    duration: '3 Months',
    lessons: '40 Lessons',
    image: '/cybersecurity_course.jpeg'
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Teach data analysis, ML models, and insight-driven decision making',
    duration: '4 Months',
    lessons: '35 Lessons',
    image: '/data_science_course.jpeg'
  },
  {
    id: 'ai-automation',
    title: 'AI Automation',
    description: 'Teach AI-powered workflow automation and intelligent solutions',
    duration: '4 Months',
    lessons: '42 Lessons',
    image: '/ai_course.jpeg'
  },
  {
    id: 'computer-networking',
    title: 'Computer Networking',
    description: 'Teach network infrastructure, protocols, and system connectivity',
    duration: '2 Months',
    lessons: '30 Lessons',
    image: '/neti.jpeg'
  },
  {
    id: 'ethical-hacking',
    title: 'Ethical Hacking',
    description: 'Teach penetration testing and vulnerability assessment techniques',
    duration: '3 Months',
    lessons: '38 Lessons',
    image: '/ethical_hack.jpeg'
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    description: 'Teach visual design, branding, and creative software',
    duration: '2 Months',
    lessons: '28 Lessons',
    image: '/graphic_design_course.jpeg'
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Design',
    description: 'Teach intuitive interface design and user experience principles',
    duration: '3 Months',
    lessons: '32 Lessons',
    image: '/uiux_course.jpeg'
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    description: 'Teach complete web application development from frontend to backend',
    duration: '4 Months',
    lessons: '40 Lessons',
    image: '/fullstack_course.jpeg'
  },
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    description: 'Teach modern frontend frameworks and UI building',
    duration: '2 Months',
    lessons: '35 Lessons',
    image: '/frontend_course.jpeg'
  },
  {
    id: 'backend-development',
    title: 'Backend Development',
    description: 'Teach server-side applications and API development',
    duration: '2 Months',
    lessons: '36 Lessons',
    image: '/backend_course.jpeg'
  },
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'Teach fundamentals of building modern websites and web apps',
    duration: '3 Months',
    lessons: '30 Lessons',
    image: '/webi.jpeg'
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'Teach SEO, social media, and online marketing strategies',
    duration: '2 Months',
    lessons: '25 Lessons',
    image: '/digital_marketing_couse.jpeg'
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing',
    description: 'Teach cloud infrastructure deployment and management',
    duration: '3 Months',
    lessons: '38 Lessons',
    image: '/cloud_course.jpeg'
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    description: 'Teach data processing, visualization, and business intelligence',
    duration: '3 Months',
    lessons: '32 Lessons',
    image: '/data_science_course.jpeg'
  }
]

export default function TeachersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-white">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#6366f1]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-64 h-64 bg-gradient-to-tr from-[#4338ca]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 sm:py-16">
          <div className="text-center space-y-5 md:space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#6366f1]/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-500 tracking-wide">Mentor Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.02] tracking-tight">
              Mentor{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-indigo-600/80 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              Select the course you are teaching. You can send messages, announcements, and updates to your students.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6">
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a course..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-full bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 pb-16">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/teachers/${course.id}`)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                {/* Course Image */}
                <div className="relative h-40 sm:h-44 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
                      {course.duration}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {course.title}
                  </h3>
                  
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed flex-1">
                    {course.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer">
                      Manage Course
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-sm text-gray-400">
          Tech Trailblazer Academy — Mentor Portal
        </p>
      </div>
    </main>
  )
}