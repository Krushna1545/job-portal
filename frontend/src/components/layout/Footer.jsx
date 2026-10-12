import React from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BriefcaseIcon size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">JobPortal<span className="text-blue-400">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              AI-powered job portal connecting talent with opportunities through smart matching and resume analysis.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Upload Resume</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">For Recruiters</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Find Candidates</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">AI Matching</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm">
          <p>© 2026 JobPortalAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
