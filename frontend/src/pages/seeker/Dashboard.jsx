import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon, FileTextIcon, BookmarkIcon, ZapIcon, UserIcon, ClipboardListIcon } from 'lucide-react'
import api from '../../api/axios'
import StatCard from '../../components/ui/StatCard'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const statusColors = {
  applied: 'badge-blue', under_review: 'badge-yellow', shortlisted: 'badge-green',
  interview: 'badge-purple', selected: 'badge-green', rejected: 'badge-red'
}

export default function SeekerDashboard() {
  const [profile, setProfile] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/profile'),
      api.get('/applications')
    ]).then(([pr, ar]) => {
      setProfile(pr.data)
      setApplications(ar.data.slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {profile?.first_name || 'there'}! 👋
        </h1>
        <p className="text-blue-100 text-sm">Here's an overview of your job search progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Applications" value={applications.length} icon={ClipboardListIcon} color="blue" />
        <StatCard title="Profile Score" value={`${profile?.profile_completion || 0}%`} icon={UserIcon} color="green" />
        <StatCard title="Saved Jobs" value="—" icon={BookmarkIcon} color="purple" />
        <StatCard title="Interviews" value={applications.filter(a => a.status === 'interview').length} icon={BriefcaseIcon} color="yellow" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile completion */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Profile Completion</h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                style={{ width: `${profile?.profile_completion || 0}%` }}
              />
            </div>
            <span className="font-bold text-blue-600 text-sm">{profile?.profile_completion || 0}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Complete your profile to get better job matches</p>
          <div className="space-y-2">
            {[
              { label: 'Basic Info', done: !!(profile?.first_name && profile?.location) },
              { label: 'Skills Added', done: profile?.skills?.length > 0 },
              { label: 'Education', done: profile?.education?.length > 0 },
              { label: 'Experience', done: profile?.experience?.length > 0 },
              { label: 'Resume Uploaded', done: profile?.resumes?.length > 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                  {item.done && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={item.done ? 'text-gray-600 line-through' : 'text-gray-800'}>{item.label}</span>
              </div>
            ))}
          </div>
          <Link to="/seeker/profile" className="btn-primary w-full mt-4 text-sm text-center block">Complete Profile</Link>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/seeker/applications" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardListIcon size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No applications yet</p>
              <Link to="/jobs" className="btn-primary text-xs mt-3 inline-block">Browse Jobs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{app.job?.title || 'Job'}</p>
                    <p className="text-xs text-gray-500">{app.job?.company?.name}</p>
                  </div>
                  <span className={`${statusColors[app.status] || 'badge-gray'} text-xs`}>{app.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: '/jobs', label: 'Browse Jobs', icon: BriefcaseIcon, color: 'bg-blue-50 text-blue-600' },
          { to: '/seeker/resume', label: 'Upload Resume', icon: FileTextIcon, color: 'bg-purple-50 text-purple-600' },
          { to: '/seeker/resume-analysis', label: 'AI Analysis', icon: ZapIcon, color: 'bg-yellow-50 text-yellow-600' },
          { to: '/seeker/recommended', label: 'Recommended', icon: BookmarkIcon, color: 'bg-green-50 text-green-600' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.to} to={item.to} className={`${item.color} rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity`}>
              <Icon size={22} />
              <span className="text-xs font-medium text-center">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
