import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { SearchIcon, BriefcaseIcon, UsersIcon, ZapIcon, CheckCircleIcon, ArrowRightIcon, BuildingIcon } from "lucide-react"
import api from "../../api/axios"
import JobCard from "../../components/ui/JobCard"

const howItWorks = [
  { step: "1", title: "Create Your Profile", desc: "Sign up and build your professional profile with skills, experience, and education." },
  { step: "2", title: "Upload Your Resume", desc: "Upload your resume and let our AI analyze it for instant feedback and scoring." },
  { step: "3", title: "Get AI Matches", desc: "Receive personalized job recommendations based on your profile and skills." },
  { step: "4", title: "Apply & Get Hired", desc: "Apply with one click, track your applications, and land your dream job." },
]

const aiFeatures = [
  { icon: ZapIcon, title: "AI Resume Analysis", desc: "Get instant feedback on your resume with a score from 0-100 and improvement suggestions." },
  { icon: SearchIcon, title: "Smart Job Matching", desc: "Our AI compares your skills with job requirements and shows match percentages." },
  { icon: CheckCircleIcon, title: "Skill Gap Analysis", desc: "See exactly which skills you are missing and get learning recommendations." },
  { icon: BriefcaseIcon, title: "Job Recommendations", desc: "Personalized job suggestions based on your profile, experience, and preferences." },
]

export default function Home() {
  const [keyword, setKeyword] = useState("")
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [stats, setStats] = useState({ jobs: 0, companies: 0, seekers: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/jobs/public?per_page=6").then(r => {
      setFeaturedJobs(r.data.jobs || [])
      setStats(s => ({ ...s, jobs: r.data.total || 0 }))
    }).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/jobs${keyword ? "?keyword=" + encodeURIComponent(keyword) : ""}`)
  }

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm mb-6">
            <ZapIcon size={14} className="text-yellow-300" />
            <span>AI-Powered Job Search</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Find Your Dream Job<br />
            <span className="text-yellow-300">with AI</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Smart job matching, AI-powered resume analysis and personalized career recommendations tailored just for you.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
            <div className="flex-1 relative">
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Search jobs, skills, companies..."
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/jobs" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors flex items-center gap-2">
              <BriefcaseIcon size={16} />
              Browse All Jobs
            </Link>
            <Link to="/register" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Upload Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">{stats.jobs}+</p>
            <p className="text-sm text-gray-500 mt-1">Active Jobs</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">50+</p>
            <p className="text-sm text-gray-500 mt-1">Companies</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">100+</p>
            <p className="text-sm text-gray-500 mt-1">Candidates Hired</p>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Opportunities</h2>
              <p className="text-gray-500 text-sm mt-1">Explore the most recent job openings</p>
            </div>
            <Link to="/jobs" className="text-blue-600 hover:underline text-sm flex items-center gap-1 font-medium">
              View all <ArrowRightIcon size={14} />
            </Link>
          </div>
          {featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BriefcaseIcon size={40} className="mx-auto mb-3 opacity-40" />
              <p>Loading jobs...</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Get hired in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <ZapIcon size={14} />
              AI-Powered Features
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Career Assistance</h2>
            <p className="text-gray-500 mt-2">Our AI helps you find the perfect job and improve your profile</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiFeatures.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Icon size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
          <p className="text-blue-100 mb-8">Join thousands of professionals who found their ideal career with JobPortalAI.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3 rounded-xl transition-colors">
              Get Started Free
            </Link>
            <Link to="/jobs" className="border border-white/40 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
