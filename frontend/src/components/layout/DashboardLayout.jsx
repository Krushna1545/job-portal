import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BriefcaseIcon, HomeIcon, UserIcon, FileTextIcon, BellIcon, BookmarkIcon,
  SearchIcon, BarChartIcon, PlusCircleIcon, UsersIcon, SettingsIcon,
  LogOutIcon, MenuIcon, XIcon, StarIcon, ClipboardListIcon, BuildingIcon,
  MessageSquareIcon, ChevronRightIcon, ZapIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const menuItems = {
  job_seeker: [
    { path: '/seeker/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/seeker/profile', label: 'My Profile', icon: UserIcon },
    { path: '/seeker/resume', label: 'Resume', icon: FileTextIcon },
    { path: '/seeker/resume-analysis', label: 'AI Analysis', icon: ZapIcon },
    { path: '/seeker/recommended', label: 'Recommended Jobs', icon: StarIcon },
    { path: '/seeker/applications', label: 'Applications', icon: ClipboardListIcon },
    { path: '/seeker/saved-jobs', label: 'Saved Jobs', icon: BookmarkIcon },
    { path: '/seeker/notifications', label: 'Notifications', icon: BellIcon },
  ],
  recruiter: [
    { path: '/recruiter/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/recruiter/profile', label: 'Company Profile', icon: BuildingIcon },
    { path: '/recruiter/post-job', label: 'Post New Job', icon: PlusCircleIcon },
    { path: '/recruiter/jobs', label: 'Manage Jobs', icon: BriefcaseIcon },
    { path: '/recruiter/applicants', label: 'Applicants', icon: UsersIcon },
    { path: '/recruiter/notifications', label: 'Notifications', icon: BellIcon },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
    { path: '/admin/users', label: 'Users', icon: UsersIcon },
    { path: '/admin/jobs', label: 'Jobs', icon: BriefcaseIcon },
    { path: '/admin/applications', label: 'Applications', icon: ClipboardListIcon },
  ]
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = menuItems[role] || []

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const roleLabels = {
    job_seeker: 'Job Seeker',
    recruiter: 'Recruiter',
    admin: 'Administrator'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BriefcaseIcon size={18} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">JobPortal<span className="text-blue-600">AI</span></span>
            </Link>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <XIcon size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
              {roleLabels[role]}
            </span>
            <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRightIcon size={14} className="ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg">
              <SearchIcon size={16} />
              Browse Jobs
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
            >
              <LogOutIcon size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={22} className="text-gray-600" />
          </button>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-semibold text-gray-900">
              {items.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-3">
              <Link to={role === 'job_seeker' ? '/seeker/notifications' : role === 'recruiter' ? '/recruiter/notifications' : '#'}>
                <BellIcon size={20} className="text-gray-500 hover:text-blue-600 cursor-pointer" />
              </Link>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.email?.[0]?.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
