'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowRight, Search } from 'lucide-react'
import { useState } from 'react'

interface Course {
  id: string
  title: string
  duration: string
  description: string
  lessons: string
  image: string
}

const courses: Course[] = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    duration: '3 Months',
    description: 'Learn to protect systems, networks, and data from digital attacks and security breaches.',
    lessons: '40 Lessons',
    image: '/cybersecurity_course.jpeg'
  },
  {
    id: 'data-science',
    title: 'Data Science',
    duration: '4 Months', 
    description: 'Analyze complex data, build predictive models, and extract insights from large datasets.',
    lessons: '35 Lessons',
    image: '/data_science_course.jpeg'
  },
  {
    id: 'ai-automation',
    title: 'AI Automation',
    duration: '4 Months',
    description: 'Build intelligent automated systems using machine learning and advanced AI techniques.',
    lessons: '42 Lessons',
    image: '/ai_course.jpeg'
  },
  {
    id: 'computer-networking',
    title: 'Computer Networking',
    duration: '2 Months',
    description: 'Master network protocols, infrastructure, and system connectivity fundamentals.',
    lessons: '30 Lessons',
    image: '/neti.jpeg'
  },
  {
    id: 'ethical-hacking',
    title: 'Ethical Hacking',
    duration: '3 Months',
    description: 'Learn penetration testing and security assessment to protect systems from vulnerabilities.',
    lessons: '38 Lessons',
    image: '/ethical_hack.jpeg'
  },
  {
    id: 'graphic-design',
    title: 'Graphic Design',
    duration: '2 Months',
    description: 'Create stunning visual content using industry-standard design tools and principles.',
    lessons: '28 Lessons',
    image: '/graphic_design_course.jpeg'
  },
  {
    id: 'uiux-design',
    title: 'UI/UX Design',
    duration: '3 Months',
    description: 'Design beautiful and intuitive user interfaces with modern design principles.',
    lessons: '32 Lessons',
    image: '/uiux_course.jpeg'
  },
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    duration: '4 Months',
    description: 'Master both frontend and backend development to build complete web applications.',
    lessons: '40 Lessons',
    image: '/fullstack_course.jpeg'
  },
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    duration: '2 Months',
    description: 'Build responsive and interactive user interfaces with modern frontend technologies.',
    lessons: '35 Lessons',
    image: '/frontend_course.jpeg'
  },
  {
    id: 'backend-development',
    title: 'Backend Development',
    duration: '2 Months',
    description: 'Develop robust server-side applications and APIs with modern backend technologies.',
    lessons: '36 Lessons',
    image: '/backend_course.jpeg'
  },
  {
    id: 'web-development',
    title: 'Web Development',
    duration: '3 Months',
    description: 'Learn fundamental web technologies to build modern websites and web applications.',
    lessons: '30 Lessons',
    image: '/webi.jpeg'
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    duration: '2 Months',
    description: 'Master digital marketing strategies including SEO, social media, and online advertising.',
    lessons: '25 Lessons',
    image: '/digital_marketing_couse.jpeg'
  },
  {
    id: 'cloud-computing',
    title: 'Cloud Computing',
    duration: '3 Months',
    description: 'Learn cloud architecture, deployment, and management using major cloud platforms.',
    lessons: '38 Lessons',
    image: '/cloud_course.jpeg'
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    duration: '3 Months',
    description: 'Master data analysis techniques to interpret complex datasets and drive business decisions.',
    lessons: '32 Lessons',
    image: '/data_science_course.jpeg'
  }
]

export default function ClassroomPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-[#ef4444]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-20 w-64 h-64 bg-gradient-to-tr from-[#991b1b]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 sm:py-16">
          <div className="text-center space-y-5 md:space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#ef4444]/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-500 tracking-wide">Start Learning Today</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.02] tracking-tight">
              Pick Your{' '}
              <span className="bg-gradient-to-r from-red-500 to-red-600/80 bg-clip-text text-transparent">
                Classroom
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
              Select a course below to start your learning journey.
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
            placeholder="Search for a class..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-full bg-white/80 backdrop-blur-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50"
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
         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:pl-2 lg:pr-2 lg:pt-12 lg:pb-12  2xl:px-45">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => router.push(`/classroom/${course.id}`)}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col hover:-translate-y-1"
              >
                {/* Course Image */}
                <div className="relative h-28 sm:h-36 md:h-44 overflow-hidden">
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
                <div className="p-3 sm:p-5 flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                    {course.title}
                  </h3>
                  
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-relaxed flex-1 line-clamp-2 sm:line-clamp-none">
                    {course.description}
                  </p>

                  <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-1 text-xs sm:text-sm font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer">
                      Enter Classroom
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}