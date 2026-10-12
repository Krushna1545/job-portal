import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon, MenuIcon, XIcon, UserIcon, LogOutIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'job_seeker') return '/seeker/dashboard'
    if (user.role === 'recruiter') return '/recruiter/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/'
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <BriefcaseIcon size={20} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">JobPortal<span className="text-blue-600">AI</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Home</Link>
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">Find Jobs</Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors">About</Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardLink()} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 font-medium">
                  <UserIcon size={16} />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors">
                  <LogOutIcon size={15} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/jobs" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Find Jobs</Link>
              <Link to="/about" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>About</Link>
              {user ? (
                <>
                  <Link to={getDashboardLink()} className="text-blue-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-red-500 text-sm font-medium text-left">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 text-sm font-medium" onClick={() => setMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
