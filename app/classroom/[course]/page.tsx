'use client'

import { useParams, useRouter } from 'next/navigation'
import { Shield, BarChart3, Cpu, Globe, ShieldAlert, Palette, Code, Monitor, Server, Globe2, TrendingUp, Cloud, Database, ArrowLeft, BookOpen, Clock, Target, Award, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

const courseData: Record<string, {
  title: string
  tagline: string
  icon: any
  color: string
  gradient: string
  lightBg: string
  iconBg: string
  iconColor: string
  borderColor: string
  accent: string
  overview: string
  topics: string[]
  duration: string
  level: string
  outcome: string
}> = {
  'cybersecurity': {
    title: 'Cybersecurity',
    tagline: 'Defend the digital frontier',
    icon: Shield,
    color: 'from-red-600 to-red-800',
    gradient: 'from-red-500/20 via-red-600/10 to-red-800/20',
    lightBg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
    accent: 'red',
    overview: 'Welcome to Cybersecurity! In this course, you will master ethical hacking, network security, threat analysis, and cyber defense strategies. Get ready to protect systems and data from real-world threats.',
    topics: ['Network Security', 'Ethical Hacking', 'Threat Intelligence', 'Cryptography', 'Incident Response', 'Security Auditing'],
    duration: '12 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Certified Cybersecurity Professional',
  },
  'data-science': {
    title: 'Data Science',
    tagline: 'Turn data into decisions',
    icon: BarChart3,
    color: 'from-emerald-600 to-emerald-800',
    gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-800/20',
    lightBg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    accent: 'emerald',
    overview: 'Welcome to Data Science! Learn to extract insights from data using statistics, machine learning, and visualization. Transform raw numbers into powerful stories that drive business decisions.',
    topics: ['Statistics & Probability', 'Python for Data Science', 'Machine Learning', 'Data Visualization', 'Big Data Analytics', 'Deep Learning'],
    duration: '14 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Data Science Certified Specialist',
  },
  'ai-automation': {
    title: 'AI Automation',
    tagline: 'Automate the future with AI',
    icon: Cpu,
    color: 'from-amber-600 to-amber-800',
    gradient: 'from-amber-500/20 via-amber-600/10 to-amber-800/20',
    lightBg: 'bg-amber-50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    accent: 'amber',
    overview: 'Welcome to AI Automation! Discover how to leverage artificial intelligence to automate workflows, build intelligent agents, and create smart solutions.',
    topics: ['AI Fundamentals', 'Prompt Engineering', 'Workflow Automation', 'AI Agents & Tools', 'Natural Language Processing', 'Computer Vision'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'AI Automation Expert',
  },
  'computer-networking': {
    title: 'Computer Networking',
    tagline: 'Connect the world',
    icon: Globe,
    color: 'from-cyan-600 to-cyan-800',
    gradient: 'from-cyan-500/20 via-cyan-600/10 to-cyan-800/20',
    lightBg: 'bg-cyan-50',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    accent: 'cyan',
    overview: 'Welcome to Computer Networking! Understand how networks operate, from local area networks to global infrastructure.',
    topics: ['Network Protocols', 'Routing & Switching', 'Network Security', 'TCP/IP', 'Wireless Networking', 'Network Design'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Network Specialist Certified',
  },
  'ethical-hacking': {
    title: 'Ethical Hacking',
    tagline: 'Hack to protect',
    icon: ShieldAlert,
    color: 'from-rose-600 to-rose-800',
    gradient: 'from-rose-500/20 via-rose-600/10 to-rose-800/20',
    lightBg: 'bg-rose-50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    accent: 'rose',
    overview: 'Welcome to Ethical Hacking! Learn to think like a hacker to defend like a pro. Master penetration testing and vulnerability assessment.',
    topics: ['Penetration Testing', 'Vulnerability Assessment', 'Social Engineering', 'Web App Security', 'Wireless Security', 'Exploit Development'],
    duration: '12 Weeks',
    level: 'Intermediate to Advanced',
    outcome: 'Certified Ethical Hacker (CEH)',
  },
  'graphic-design': {
    title: 'Graphic Design',
    tagline: 'Create visual stories',
    icon: Palette,
    color: 'from-pink-600 to-pink-800',
    gradient: 'from-pink-500/20 via-pink-600/10 to-pink-800/20',
    lightBg: 'bg-pink-50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    accent: 'pink',
    overview: 'Welcome to Graphic Design! Unleash your creativity and learn to design stunning visuals, brand identities, and marketing materials.',
    topics: ['Typography', 'Color Theory', 'Brand Identity', 'Adobe Creative Suite', 'Layout Design', 'Motion Graphics'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Graphic Design Professional',
  },
  'uiux-design': {
    title: 'UI/UX Design',
    tagline: 'Design experiences that matter',
    icon: Palette,
    color: 'from-purple-600 to-purple-800',
    gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/20',
    lightBg: 'bg-purple-50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    accent: 'purple',
    overview: 'Welcome to UI/UX Design! Dive into the art and science of crafting intuitive, beautiful, and accessible digital experiences.',
    topics: ['User Research', 'Wireframing & Prototyping', 'Visual Design', 'Interaction Design', 'Usability Testing', 'Design Systems'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'UI/UX Design Professional',
  },
  'full-stack-development': {
    title: 'Full Stack Development',
    tagline: 'Build the web, end to end',
    icon: Code,
    color: 'from-blue-600 to-blue-800',
    gradient: 'from-blue-500/20 via-blue-600/10 to-blue-800/20',
    lightBg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    accent: 'blue',
    overview: 'Welcome to Full Stack Development! You will learn to build complete web applications from the ground up.',
    topics: ['React & Next.js', 'Node.js & Express', 'Databases (SQL/NoSQL)', 'REST & GraphQL APIs', 'DevOps & Deployment', 'Testing & Security'],
    duration: '16 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Full Stack Developer Certified',
  },
  'frontend-development': {
    title: 'Frontend Development',
    tagline: 'Craft beautiful interfaces',
    icon: Monitor,
    color: 'from-sky-600 to-sky-800',
    gradient: 'from-sky-500/20 via-sky-600/10 to-sky-800/20',
    lightBg: 'bg-sky-50',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    accent: 'sky',
    overview: 'Welcome to Frontend Development! Master the art of building modern, responsive, and interactive user interfaces.',
    topics: ['HTML & CSS', 'JavaScript & TypeScript', 'React Framework', 'Responsive Design', 'State Management', 'Performance Optimization'],
    duration: '12 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Frontend Developer Certified',
  },
  'backend-development': {
    title: 'Backend Development',
    tagline: 'Power the server side',
    icon: Server,
    color: 'from-indigo-600 to-indigo-800',
    gradient: 'from-indigo-500/20 via-indigo-600/10 to-indigo-800/20',
    lightBg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    accent: 'indigo',
    overview: 'Welcome to Backend Development! Learn to build robust, scalable server-side applications and APIs.',
    topics: ['Node.js & Python', 'API Development', 'Database Management', 'Authentication & Authorization', 'Server Architecture', 'Microservices'],
    duration: '12 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Backend Developer Certified',
  },
  'web-development': {
    title: 'Web Development',
    tagline: 'Build for the web',
    icon: Globe2,
    color: 'from-teal-600 to-teal-800',
    gradient: 'from-teal-500/20 via-teal-600/10 to-teal-800/20',
    lightBg: 'bg-teal-50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    accent: 'teal',
    overview: 'Welcome to Web Development! Learn the complete fundamentals of building modern websites and web applications.',
    topics: ['HTML5 & CSS3', 'JavaScript Essentials', 'Responsive Design', 'Version Control (Git)', 'Web Hosting & Deployment', 'Basic Backend'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Web Developer Certified',
  },
  'digital-marketing': {
    title: 'Digital Marketing',
    tagline: 'Grow your brand online',
    icon: TrendingUp,
    color: 'from-orange-600 to-orange-800',
    gradient: 'from-orange-500/20 via-orange-600/10 to-orange-800/20',
    lightBg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    accent: 'orange',
    overview: 'Welcome to Digital Marketing! Master the strategies and tools needed to build, grow, and scale an online presence.',
    topics: ['SEO & SEM', 'Social Media Marketing', 'Content Marketing', 'Email Marketing', 'Google Analytics', 'Paid Advertising'],
    duration: '10 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Digital Marketing Specialist',
  },
  'cloud-computing': {
    title: 'Cloud Computing',
    tagline: 'Scale with the cloud',
    icon: Cloud,
    color: 'from-violet-600 to-violet-800',
    gradient: 'from-violet-500/20 via-violet-600/10 to-violet-800/20',
    lightBg: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    accent: 'violet',
    overview: 'Welcome to Cloud Computing! Learn to deploy, manage, and scale applications using cloud platforms.',
    topics: ['AWS Fundamentals', 'Cloud Architecture', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Infrastructure as Code', 'Cloud Security'],
    duration: '12 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Cloud Computing Certified',
  },
  'data-analysis': {
    title: 'Data Analysis',
    tagline: 'Find insights in data',
    icon: Database,
    color: 'from-lime-600 to-lime-800',
    gradient: 'from-lime-500/20 via-lime-600/10 to-lime-800/20',
    lightBg: 'bg-lime-50',
    iconBg: 'bg-lime-100',
    iconColor: 'text-lime-600',
    borderColor: 'border-lime-200',
    accent: 'lime',
    overview: 'Welcome to Data Analysis! Learn to collect, process, and analyze data to uncover trends and insights.',
    topics: ['Excel & Spreadsheets', 'SQL for Data', 'Python for Analysis', 'Data Visualization', 'Statistical Analysis', 'Business Intelligence'],
    duration: '8 Weeks',
    level: 'Beginner to Advanced',
    outcome: 'Data Analysis Professional',
  },
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const course = courseData[params.course as string]

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

  const Icon = course.icon

  return (
    <main className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-${course.accent}-50`}>
      {/* Back bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="flex items-center h-16">
            <button onClick={() => router.push('/classroom')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Courses</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${course.gradient}`}>
        <div className="relative max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${course.iconBg} ${course.iconColor} shadow-lg`}>
              <Icon className="w-10 h-10" />
            </motion.div>
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">{course.title}</h1>
                <p className="mt-2 text-xl sm:text-2xl text-gray-600 font-medium">{course.tagline}</p>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-3">
              <Award className={`w-5 h-5 ${course.iconColor}`} />
              <span className="text-sm font-semibold text-gray-700">{course.level}</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{course.overview}</p>
            </motion.div>

            {/* What You'll Learn */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.topics.map((topic, i) => (
                  <motion.div key={topic} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i + 0.3 }} className={`flex items-center gap-3 p-4 rounded-xl bg-white border ${course.borderColor} hover:shadow-md transition-shadow`}>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${course.color}`} />
                    <span className="text-gray-700 font-medium">{topic}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Welcome CTA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={`p-8 rounded-2xl bg-gradient-to-br ${course.gradient} border ${course.borderColor}`}>
              <div className="flex items-center gap-4 mb-4">
                <Award className={`w-8 h-8 ${course.iconColor}`} />
                <h3 className="text-2xl font-bold text-gray-900">Welcome to {course.title}!</h3>
              </div>
              <p className="text-gray-700 text-lg">
                You are now enrolled! Your journey to becoming a {course.outcome} starts now. All course materials, assignments, and resources are available to you.
              </p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
            {/* Quick Stats */}
            <div className={`bg-white rounded-2xl border ${course.borderColor} p-6 space-y-4`}>
              <h3 className="font-bold text-gray-900 text-lg">Quick Info</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${course.iconBg} ${course.iconColor}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900">{course.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${course.iconBg} ${course.iconColor}`}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Level</p>
                    <p className="font-semibold text-gray-900">{course.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${course.iconBg} ${course.iconColor}`}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">You Get</p>
                    <p className="font-semibold text-gray-900">{course.outcome}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Learning */}
            <button
              onClick={() => router.push(`/classroom/${params.course}/dashboard`)}
              className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r ${course.color} text-white font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2`}
            >
              <BookOpen className="w-5 h-5" />
              Start Learning Now
            </button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}