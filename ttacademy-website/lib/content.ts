import { COURSE_CATALOG } from '../../lib/course-catalog';

export interface Course {
  title: string;
  image: string;
  description: string;
  curriculum: string[];
  icon: string;
}

export const courses: Course[] = [
  {
    title: 'AI Automation',
    image: '/ai_course.jpeg',
    icon: '✧',
    description:
      'Learn how to use artificial intelligence and automation tools to simplify repetitive tasks, improve workflows, and increase productivity. Discover how to identify processes that can be automated and design intelligent systems that connect applications, manage information, and complete routine tasks with minimal manual effort.',
    curriculum: [
      'Introduction to AI & Automation',
      'Prompt Engineering & AI Tools',
      'Workflow Automation Fundamentals',
      'No-Code Automation Platforms',
      'APIs, Webhooks & App Integrations',
      'AI-Powered Workflow Development',
      'Real-World Automation Projects',
    ],
  },
  {
    title: 'Cybersecurity',
    image: '/cybersecurity_course.jpeg',
    icon: '♧',
    description:
      'Learn how to protect digital systems, networks, and sensitive information from cyber threats. This course introduces you to the core principles of cybersecurity, helping you understand how cyberattacks happen, how vulnerabilities are identified, and how to implement effective security measures. You’ll develop practical skills in network security, threat detection, risk assessment, incident response, and security best practices while working through real-world scenarios and hands-on exercises.',
    curriculum: [
      'Introduction to Cybersecurity',
      'Networking Fundamentals',
      'Operating Systems & Security',
      'Threats, Vulnerabilities & Risk Management',
      'Network Security & Firewalls',
      'Security Monitoring & Incident Response',
      'Cybersecurity Best Practices',
    ],
  },
  {
    title: 'Ethical Hacking',
    image: '/ethical_hack.jpeg',
    icon: '⌁',
    description:
      'Build a foundation in ethical hacking and learn how security professionals assess systems with authorization. Explore reconnaissance, vulnerability assessment, safe testing practices, and responsible reporting in guided lab environments.',
    curriculum: [
      'Ethics, Authorization & Legal Boundaries',
      'Networking and Linux Fundamentals',
      'Reconnaissance in Lab Environments',
      'Vulnerability Assessment',
      'Web Application Security Fundamentals',
      'Security Testing & Evidence Handling',
      'Responsible Reporting and Remediation',
    ],
  },
  {
    title: 'AI Agent Development',
    image: '/ai_course.jpeg',
    icon: '✧',
    description:
      'Learn how to build intelligent AI agents that can understand instructions, make decisions, use tools, and automate complex tasks. Explore large language models, agent workflows, API integrations, and how to deploy useful AI systems.',
    curriculum: [
      'Introduction to AI Agents & Large Language Models',
      'Python Programming & AI Fundamentals',
      'Prompt Engineering & LLM Integration',
      'APIs, Tool Calling & Function Integration',
      'Knowledge Retrieval & Retrieval-Augmented Generation',
      'AI Agent Workflows & Automation',
      'AI Agent Deployment & Real-World Projects',
    ],
  },
  {
    title: 'Web Development',
    image: '/webi.jpeg',
    icon: '‹›',
    description:
      'Learn how to transform ideas into functional, responsive, and visually engaging websites. Build practical skills in HTML, CSS, JavaScript, responsive design, version control, and deployment while working on real-world projects.',
    curriculum: [
      'Introduction to Web Development',
      'HTML & Web Page Structure',
      'CSS & Visual Styling',
      'Responsive Web Design',
      'JavaScript & Interactive Websites',
      'Git, GitHub & Version Control',
      'Website Deployment & Portfolio Projects',
    ],
  },
  {
    title: 'Backend Development',
    image: '/backend_course.jpeg',
    icon: '♢',
    description:
      'Learn how to build the powerful systems that run behind websites and applications. Develop practical skills in server-side programming, databases, APIs, authentication, application security, and deployment.',
    curriculum: [
      'Introduction to Backend Development',
      'Programming Fundamentals & Server-Side Logic',
      'Databases & Data Management',
      'APIs & HTTP Fundamentals',
      'Authentication, Authorization & Security',
      'Backend Testing & Error Handling',
      'Deployment & Real-World Backend Projects',
    ],
  },
  {
    title: 'Frontend Development',
    image: '/frontend_course.jpeg',
    icon: '‹›',
    description:
      'Build accessible, responsive interfaces and turn design concepts into polished web experiences. Practice component-based development, styling, browser interaction, and frontend testing.',
    curriculum: [
      'HTML & Semantic Structure',
      'CSS Layouts & Responsive Design',
      'JavaScript Fundamentals',
      'Component-Based Interfaces',
      'State & Browser APIs',
      'Accessibility & Testing',
      'Portfolio Deployment',
    ],
  },
  {
    title: 'Data Analytics',
    image: '/data_science_course.jpeg',
    icon: '∿',
    description:
      'Learn how to transform raw data into meaningful insights that support better decisions. Develop practical skills in spreadsheets, SQL, data cleaning, exploratory analysis, visualization, and reporting.',
    curriculum: [
      'Introduction to Data Analytics',
      'Excel & Spreadsheet Analysis',
      'Data Cleaning & Preparation',
      'SQL & Database Fundamentals',
      'Data Visualization & Dashboards',
      'Statistical Analysis & Interpretation',
      'Reporting & Portfolio Projects',
    ],
  },
  {
    title: 'Graphic Design / Branding',
    image: '/graphic_design_course.jpeg',
    icon: '♧',
    description:
      'Learn to create compelling visual designs that communicate messages and build memorable brands. Develop practical skills in typography, layout, colour theory, visual communication, branding, and image editing.',
    curriculum: [
      'Introduction to Graphic Design & Design Principles',
      'Colour Theory, Typography & Visual Hierarchy',
      'Image Editing & Vector Graphics',
      'Layout Design & Visual Communication',
      'Brand Strategy & Visual Identity',
      'Print and Digital Design',
      'Portfolio Development',
    ],
  },
  {
    title: 'UI/UX Design',
    image: '/uiux_course.jpeg',
    icon: '◉',
    description:
      'Learn to transform user needs into useful, accessible, and engaging digital products. Practice user research, UX strategy, wireframing, prototyping, interface design, and usability testing.',
    curriculum: [
      'Design Fundamentals & User-Centered Design',
      'User Research & Personas',
      'Information Architecture',
      'Wireframing & Prototyping',
      'Visual and Interaction Design',
      'Usability Testing & Iteration',
      'Design Systems & Portfolio Projects',
    ],
  },
  {
    title: 'Cloud Computing',
    image: '/cloud_course.jpeg',
    icon: '☁',
    description:
      'Understand cloud computing concepts and learn how to deploy, secure, and monitor applications using cloud infrastructure. Build practical knowledge of networking, storage, compute, access control, and scalable services.',
    curriculum: [
      'Cloud Computing Fundamentals',
      'Cloud Networking & Infrastructure',
      'Compute, Storage & Databases',
      'Identity, Access & Security',
      'Deploying Applications to the Cloud',
      'Monitoring, Reliability & Scaling',
      'Cloud Architecture Project',
    ],
  },
  {
    title: 'AI Video Editing',
    image: '/ai_course.jpeg',
    icon: '▶',
    description:
      'Learn to plan and produce engaging videos with modern editing techniques and AI-assisted tools. Practice shaping a story, editing footage, enhancing audio, adding captions and graphics, and preparing content for different platforms.',
    curriculum: [
      'Video Storytelling & Pre-Production',
      'Editing Fundamentals & Timeline Workflow',
      'AI-Assisted Editing Tools',
      'Audio, Captions & Visual Effects',
      'Motion Graphics & Branding',
      'Platform Formats & Exporting',
      'AI Video Portfolio Project',
    ],
  },
];

export const classroomCourses = COURSE_CATALOG.map((classroomCourse) => ({
  ...classroomCourse,
  image: courses.find((course) => course.title === classroomCourse.title)?.image ?? '/webi.jpeg',
}));

export const benefits = [
  {
    title: 'Affordable & Accessible',
    description: 'Premium tech education priced so that budget is never a barrier to your growth.',
  },
  {
    title: 'Deep, Patient Learning',
    description: 'A long-term curriculum designed for real understanding, not quick cramming.',
  },
  {
    title: 'Job Placement & Opportunities',
    description:
      'We don’t just teach—we connect you to real job opportunities, internships, and freelance networks.',
  },
  {
    title: 'Dedicated Mentorship',
    description:
      'Expert guides who support you step-by-step from your first line of code to designing your first job offer.',
  },
  {
    title: 'Stand Out From the Crowd',
    description:
      'We teach you the portfolio strategies, soft skills, and industry insights needed to outperform competition in the global market.',
  },
];

export const values = [
  {
    title: 'Accessibility First',
    description:
      'We believe quality tech education should never be a luxury. We are committed to keeping high-grade tech training affordable for every student and career-changer across Africa.',
  },
  {
    title: 'Deep Mastery Over Speed',
    description:
      'We prioritize real understanding over fast shortcuts. Through structured, long-term learning and patient mentorship, we ensure our students master concepts deeply and apply them with confidence.',
  },
  {
    title: 'Opportunity & Impact',
    description:
      'Our success is measured by our students’ career outcomes. We actively bridge the gap between learning and earning by creating job opportunities, internships, and industry connections.',
  },
  {
    title: 'Distinctive Excellence',
    description:
      'We don’t just train students to fit into the job market—we teach them how to stand out. We instill a culture of high standards, continuous growth, and market-ready professionalism.',
  },
];
