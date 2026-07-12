'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowRight, BookOpen, Clock, Shield, Award, Star, Users, CheckCircle,
  Calendar, BarChart, Target, ChevronDown, ChevronUp, GraduationCap,
  Sparkles, Trophy, Zap, Layers, FileText, Code, TrendingUp,
  Globe, Lock, PlayCircle, Download, Share2, MessageSquare, HelpCircle
} from 'lucide-react'
import { getCourseData } from '@/lib/mock-data'

export default function CourseOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const courseSlug = params?.course as string
  const courseData = getCourseData(courseSlug)

  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-700'
      case 'Intermediate': return 'bg-amber-100 text-amber-700'
      case 'Advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-gray-50/30 to-white">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-red-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-red-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden">
          <div className="relative h-[70vh] min-h-[500px] max-h-[700px]">
            <Image
              src={courseData.banner}
              alt={courseData.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" 
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-12 lg:p-16">
              <div className="max-w-5xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
                  <BookOpen className="w-4 h-4" />
                  <span>Classroom</span>
                  <span className="text-white/30">/</span>
                  <span className="text-white/90">{courseData.title}</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(courseData.difficulty)}`}>
                        {courseData.difficulty}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/80 text-sm">
                        <Clock className="w-4 h-4" />
                        {courseData.duration}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                      {courseData.title}
                    </h1>
                    
                    <p className="text-base sm:text-lg text-white/80 max-w-2xl leading-relaxed">
                      {courseData.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-5">
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{courseData.studentStats.enrolled.toLocaleString()} Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{courseData.studentStats.rating} Rating</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70 text-sm">
                        <Award className="w-4 h-4" />
                        <span>Certificate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* ===== INSTRUCTOR & PROGRESS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Your Instructor</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={courseData.instructorAvatar}
                      alt={courseData.instructor}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{courseData.instructor}</h3>
                    <p className="text-sm text-gray-500">{courseData.title} Lead Instructor</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">4.9 (2.1k reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                  With over 15 years of industry experience, {courseData.instructor} has helped thousands of students 
                  master {courseData.title}. Known for practical, hands-on teaching methods and real-world applications.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h2>
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45"
                      fill="none"
                      stroke="url(#progressGrad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${courseData.progress * 2.83} 283`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{courseData.progress}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Course Progress</p>
                <p className="text-xs text-gray-400 mt-1">Start learning to track your progress</p>
              </div>
            </div>
          </div>

          {/* ===== SKILLS & TECHNOLOGIES ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Skills You'll Learn
              </h2>
              <div className="flex flex-wrap gap-2">
                {courseData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-amber-50 text-red-700 rounded-lg text-sm font-medium border border-red-100/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-500" />
                Technologies Covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {courseData.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ===== LEARNING OUTCOMES ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              Learning Outcomes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courseData.learningOutcomes.map((outcome) => (
                <div key={outcome} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-red-50/50 transition-colors">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{outcome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== COURSE ROADMAP ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-500" />
              Course Roadmap
            </h2>
            <div className="space-y-4">
              {courseData.roadmap.map((item) => (
                <div key={item.week} className="relative">
                  <button
                    onClick={() => setExpandedRoadmap(expandedRoadmap === item.week ? null : item.week)}
                    className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-red-50/50 transition-colors border border-gray-100 hover:border-red-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg">
                          {item.week}
                        </span>
                        <span className="font-semibold text-gray-900">{item.title}</span>
                      </div>
                      {expandedRoadmap === item.week ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    {expandedRoadmap === item.week && (
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed pl-0 sm:pl-[100px]">
                        {item.description}
                      </p>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ===== REQUIREMENTS ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Requirements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courseData.requirements.map((req) => (
                <div key={req} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== BENEFITS ===== */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 sm:p-8 shadow-lg mb-12">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" />
              What You Get
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courseData.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm">
                  <Award className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== CERTIFICATE SECTION ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-12 overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Get Certified
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Upon successful completion of all modules and the capstone project, you will receive 
                  a Tech Trailblazer Academy certificate recognized by industry leaders. Showcase your 
                  achievement on LinkedIn and boost your career prospects.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Industry Recognized
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Shareable
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    Lifetime Access
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 w-48 h-36 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200 flex items-center justify-center">
                <div className="text-center">
                  <Award className="w-10 h-10 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-amber-800">Certificate</p>
                  <p className="text-[10px] text-amber-600">of Completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== STUDENT STATS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{courseData.studentStats.enrolled.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Students Enrolled</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{courseData.studentStats.rating}</p>
              <p className="text-sm text-gray-500">Course Rating</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{courseData.studentStats.reviews.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
          </div>

          {/* ===== MOTIVATIONAL CALLOUT ===== */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 sm:p-10 mb-12 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
            </div>
            <div className="relative text-center">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Master {courseData.title}?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Join thousands of successful students who have transformed their careers. 
                Your journey to becoming a {courseData.title} expert starts now.
              </p>
              <button
                onClick={() => router.push(`/classroom/${courseSlug}/dashboard`)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
              >
                <PlayCircle className="w-5 h-5" />
                Enter Classroom
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ===== FAQS ===== */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm mb-12">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-500" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {courseData.faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{faq.question}</span>
                    {activeFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {activeFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ===== STICKY ENTER CLASSROOM BUTTON ===== */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 lg:hidden z-50">
            <button
              onClick={() => router.push(`/classroom/${courseSlug}/dashboard`)}
              className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <PlayCircle className="w-5 h-5" />
              Enter Classroom
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}