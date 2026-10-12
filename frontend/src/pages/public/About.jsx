import React from 'react'
import { Link } from 'react-router-dom'
import { ZapIcon, ShieldIcon, UsersIcon, TrendingUpIcon } from 'lucide-react'

const values = [
  { icon: ZapIcon, title: 'AI-Powered', desc: 'We use cutting-edge AI to match candidates with jobs and analyze resumes.' },
  { icon: ShieldIcon, title: 'Trusted', desc: 'Your data is secure. We never share your personal information without consent.' },
  { icon: UsersIcon, title: 'Community', desc: 'A growing community of job seekers and recruiters working together.' },
  { icon: TrendingUpIcon, title: 'Growth', desc: 'We help professionals grow their careers through smart recommendations.' },
]

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About JobPortalAI</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          We're on a mission to connect talented professionals with their dream jobs using the power of artificial intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {values.map(v => {
          const Icon = v.icon
          return (
            <div key={v.title} className="card">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Icon size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500">{v.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Link to="/register" className="btn-primary px-8 py-3">Get Started Today</Link>
      </div>
    </div>
  )
}
