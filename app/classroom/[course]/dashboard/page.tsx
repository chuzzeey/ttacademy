'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, BookOpen, Calendar, CheckCircle2, ChevronDown, Clock, FileText, GraduationCap, Mail, Megaphone, MessageSquare, PlayCircle, Award, Bell, Search, Menu, X, User, Settings, Lock, LogOut, ChevronRight, Home, BookMarked, BarChart3 } from 'lucide-react'

const courseData: Record<string, {
  title: string
  color: string
  gradient: string
  iconBg: string
  iconColor: string
  borderColor: string
  accent: string
  weeks: { title: string; content: string; topics: string[] }[]
}> = {
  'cybersecurity': {
    title: 'Cybersecurity',
    color: 'from-red-600 to-red-800',
    gradient: 'from-red-500/20 via-red-600/10 to-red-800/20',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    accent: 'red',
    weeks: [
      { title: 'Introduction to Cybersecurity', content: 'Learn the fundamentals of cybersecurity, threat landscape, and security principles.', topics: ['Security Basics', 'Threat Types', 'Defense Strategies'] },
      { title: 'Network Security', content: 'Deep dive into network security protocols, firewalls, and intrusion detection systems.', topics: ['Firewalls', 'IDS/IPS', 'VPNs'] },
      { title: 'Ethical Hacking', content: 'Master penetration testing methodologies and ethical hacking techniques.', topics: ['Reconnaissance', 'Exploitation', 'Reporting'] },
      { title: 'Cryptography', content: 'Understand encryption algorithms, PKI, and cryptographic protocols.', topics: ['Symmetric/Asymmetric', 'Hash Functions', 'Digital Signatures'] },
      { title: 'Incident Response', content: 'Learn to detect, respond to, and recover from security incidents.', topics: ['Detection', 'Containment', 'Recovery'] },
      { title: 'Security Auditing', content: 'Master compliance frameworks, security assessments, and audit techniques.', topics: ['Compliance', 'Risk Assessment', 'Audit Reports'] },
    ]
  },
  'data-science': {
    title: 'Data Science',
    color: 'from-emerald-600 to-emerald-800',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-800/20',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    accent: 'emerald',
    weeks: [
      { title: 'Statistics & Probability', content: 'Foundation of statistical methods and probability theory for data analysis.', topics: ['Descriptive Stats', 'Probability Distributions', 'Hypothesis Testing'] },
      { title: 'Python for Data Science', content: 'Learn Python programming with libraries like Pandas, NumPy, and Matplotlib.', topics: ['Pandas', 'NumPy', 'Data Visualization'] },
      { title: 'Machine Learning', content: 'Build predictive models using supervised and unsupervised learning algorithms.', topics: ['Regression', 'Classification', 'Clustering'] },
      { title: 'Data Visualization', content: 'Create compelling visualizations to communicate data insights effectively.', topics: ['Matplotlib', 'Seaborn', 'Dashboard Design'] },
      { title: 'Big Data Analytics', content: 'Work with large datasets using distributed computing and big data tools.', topics: ['Spark', 'Hadoop', 'Data Pipelines'] },
      { title: 'Deep Learning', content: 'Explore neural networks and advanced deep learning architectures.', topics: ['Neural Networks', 'CNN', 'RNN'] },
    ]
  },
  'ai-automation': {
    title: 'AI Automation',
    color: 'from-amber-600 to-amber-800',
    gradient: 'from-amber-500/20 via-amber-600/10 to-amber-800/20',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    accent: 'amber',
    weeks: [
      { title: 'AI Fundamentals', content: 'Introduction to artificial intelligence concepts and applications.', topics: ['AI History', 'Problem Solving', 'Search Algorithms'] },
      { title: 'Prompt Engineering', content: 'Master techniques for effective prompt design and optimization.', topics: ['Prompt Design', 'Chain-of-Thought', 'Few-Shot Learning'] },
      { title: 'Workflow Automation', content: 'Build automated workflows using AI-powered tools and platforms.', topics: ['Automation Tools', 'Workflow Design', 'Integration'] },
      { title: 'AI Agents & Tools', content: 'Develop intelligent agents that can perform complex tasks autonomously.', topics: ['Agent Architecture', 'Tool Use', 'Memory Systems'] },
      { title: 'Natural Language Processing', content: 'Process and analyze human language using NLP techniques.', topics: ['Text Processing', 'Sentiment Analysis', 'Translation'] },
      { title: 'Computer Vision', content: 'Build systems that can interpret and understand visual information.', topics: ['Image Recognition', 'Object Detection', 'Video Analysis'] },
    ]
  },
  'computer-networking': {
    title: 'Computer Networking',
    color: 'from-cyan-600 to-cyan-800',
    gradient: 'from-cyan-500/20 via-cyan-600/10 to-cyan-800/20',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    accent: 'cyan',
    weeks: [
      { title: 'Network Protocols', content: 'Understand the fundamental protocols that power modern networks.', topics: ['TCP/IP', 'HTTP/HTTPS', 'DNS'] },
      { title: 'Routing & Switching', content: 'Learn how data moves across networks and how to configure network devices.', topics: ['Routing Protocols', 'Switching', 'VLANs'] },
      { title: 'Network Security', content: 'Secure network infrastructure against threats and vulnerabilities.', topics: ['Access Control', 'Network Segmentation', 'Security Policies'] },
      { title: 'TCP/IP', content: 'Deep dive into the TCP/IP protocol suite and its layers.', topics: ['IP Addressing', 'Subnetting', 'Transport Layer'] },
      { title: 'Wireless Networking', content: 'Configure and manage wireless networks for optimal performance.', topics: ['Wi-Fi Standards', 'Wireless Security', 'Troubleshooting'] },
      { title: 'Network Design', content: 'Design scalable and resilient network architectures.', topics: ['Network Topology', 'Redundancy', 'Performance'] },
    ]
  },
  'full-stack-development': {
    title: 'Full Stack Development',
    color: 'from-blue-600 to-blue-800',
    gradient: 'from-blue-500/20 via-blue-600/10 to-blue-800/20',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    accent: 'blue',
    weeks: [
      { title: 'React & Next.js', content: 'Build modern frontend applications with React and Next.js framework.', topics: ['Components', 'Hooks', 'Server Components'] },
      { title: 'Node.js & Express', content: 'Create robust backend services using Node.js and Express.', topics: ['REST APIs', 'Middleware', 'Authentication'] },
      { title: 'Databases', content: 'Work with SQL and NoSQL databases for data persistence.', topics: ['PostgreSQL', 'MongoDB', 'ORM/ODM'] },
      { title: 'API Development', content: 'Design and build RESTful and GraphQL APIs.', topics: ['REST Principles', 'GraphQL', 'API Documentation'] },
      { title: 'DevOps & Deployment', content: 'Deploy applications using CI/CD pipelines and cloud services.', topics: ['Docker', 'CI/CD', 'Cloud Deployment'] },
      { title: 'Testing & Security', content: 'Write tests and secure your applications against common vulnerabilities.', topics: ['Unit Testing', 'Integration Testing', 'Security Best Practices'] },
    ]
  },
}

export default function StudentDashboard() {
  const params = useParams()
  const router = useRouter()
  const course = courseData[params.course as string]
  const [currentWeek, setCurrentWeek] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [weekSearch, setWeekSearch] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  if (!course) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The course you are looking for does not exist.</p>
          <button onClick={() => router.push('/classroom')} className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Classroom
          </button>
        </div>
      </main>
    )
  }

  const weeks = course.weeks
  const currentWeekData = weeks[currentWeek]

  const filteredWeeks = weekSearch
    ? weeks.map((w, i) => ({ ...w, index: i })).filter(w => 
        w.title.toLowerCase().includes(weekSearch.toLowerCase())
      )
    : weeks.map((w, i) => ({ ...w, index: i }))

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'courses', label: 'My Courses', icon: BookMarked },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <main className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: 'var(--font-noto-sans)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${course.iconBg} ${course.iconColor}`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{course.title}</p>
              <p className="text-xs text-gray-400">Student Dashboard</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <div>
              <p className="font-semibold text-gray-900">Enoch</p>
              <p className="text-xs text-gray-400">enoch@example.com</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${course.gradient} ${course.borderColor} border ${course.iconColor}`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === item.id ? course.iconColor : 'text-gray-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => router.push('/classroom')} className="hidden sm:inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                    E
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">Enoch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className={`bg-gradient-to-br ${course.gradient} rounded-2xl border ${course.borderColor} p-6 sm:p-8`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-white/90 backdrop-blur-sm ${course.iconColor}`}>
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900">
                      Welcome back, Enoch
                    </h1>
                    <p className="mt-2 text-gray-600 text-sm sm:text-base">
                      You are in <strong>Week {currentWeek + 1}</strong> of {course.title}. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Week Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm sticky top-20">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                          Course Weeks
                        </h3>
                      </div>
                      {/* Search weeks */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search weeks..."
                          value={weekSearch}
                          onChange={(e) => setWeekSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                        />
                      </div>
                    </div>
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {filteredWeeks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No weeks found</p>
                      ) : (
                        filteredWeeks.map((week, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentWeek(week.index)}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 mb-1 ${
                              currentWeek === week.index
                                ? `bg-gradient-to-r ${course.gradient} ${course.borderColor} border`
                                : 'hover:bg-gray-50 border border-transparent'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              currentWeek === week.index ? `${course.iconBg} ${course.iconColor}` : 'bg-gray-100 text-gray-500'
                            }`}>
                              {week.index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${currentWeek === week.index ? 'text-gray-900' : 'text-gray-700'}`}>
                                Week {week.index + 1}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{week.title}</p>
                            </div>
                            {currentWeek === week.index && <ChevronRight className={`w-4 h-4 shrink-0 ${course.iconColor}`} />}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Current Week */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className={`w-5 h-5 ${course.iconColor}`} />
                            <span className={`text-xs font-semibold uppercase tracking-wider ${course.iconColor}`}>Week {currentWeek + 1}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{currentWeekData.title}</h2>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                          <Clock className="w-4 h-4" />
                          <span>~3 hours</span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                        {currentWeekData.content}
                      </p>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-500" />
                          Topics covered this week
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentWeekData.topics.map((topic, i) => (
                            <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${course.iconBg} ${course.iconColor} border ${course.borderColor}`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button className={`mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${course.color} text-white font-semibold text-sm hover:shadow-lg transition-all duration-300`}>
                        <PlayCircle className="w-5 h-5" />
                        Start Week {currentWeek + 1} Learning
                      </button>
                    </div>
                  </div>

                  {/* Messages & Announcements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-gray-500" />
                        <h3 className="font-bold text-gray-900">Messages</h3>
                      </div>
                      <div className="p-5">
                        <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                          <p className="text-sm text-gray-400 text-center">No messages yet. Your mentors will reach out here.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                        <Megaphone className="w-5 h-5 text-gray-500" />
                        <h3 className="font-bold text-gray-900">Announcements</h3>
                      </div>
                      <div className="p-5">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${course.gradient} border ${course.borderColor}`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${course.iconBg} ${course.iconColor} shrink-0`}>
                              <Megaphone className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">Welcome to {course.title}!</h4>
                              <p className="text-sm text-gray-600 mt-1">We are excited to have you on board. Get ready for an amazing learning journey.</p>
                              <p className="text-xs text-gray-400 mt-2">Posted 2 days ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-2xl">
                      E
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Enoch</h2>
                      <p className="text-sm text-gray-500">enoch@example.com</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input type="text" value="Enoch" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input type="email" value="enoch@example.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input type="tel" value="+234 800 000 0000" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                    </div>
                    <button className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${course.color} text-white font-semibold text-sm hover:shadow-lg transition-all duration-300`}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Settings className="w-6 h-6 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                  </div>
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">Change Password</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                          <input type="password" placeholder="Enter current password" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                          <input type="password" placeholder="Enter new password" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                          <input type="password" placeholder="Confirm new password" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300" />
                        </div>
                        <button className="w-full py-3 px-6 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-all duration-300">
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-gray-400" />
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                          <span className="text-sm text-gray-700">Email notifications</span>
                          <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                          </div>
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                          <span className="text-sm text-gray-700">Push notifications</span>
                          <div className="w-10 h-6 bg-red-500 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}