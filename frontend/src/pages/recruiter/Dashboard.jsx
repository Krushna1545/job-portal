import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BriefcaseIcon, UsersIcon, ClipboardListIcon, CalendarIcon, TrendingUpIcon, PlusCircleIcon } from 'lucide-react'
import api from '../../api/axios'
import StatCard from '../../components/ui/StatCard'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const statusColors = {
  applied: 'badge-blue', under_review: 'badge-yellow', shortlisted: 'badge-green',
  interview: 'badge-purple', selected: 'bg-green-100 text-green-800 badge', rejected: 'badge-red'
}

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/recruiter/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Recruiter Dashboard</h1>
        <p className="text-blue-100 text-sm">Manage your jobs and find the perfect candidates</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Jobs" value={stats?.total_jobs} icon={BriefcaseIcon} color="blue" />
        <StatCard title="Active Jobs" value={stats?.active_jobs} icon={TrendingUpIcon} color="green" />
        <StatCard title="Applications" value={stats?.total_applications} icon={ClipboardListIcon} color="purple" />
        <StatCard title="Shortlisted" value={stats?.shortlisted} icon={UsersIcon} color="yellow" />
        <StatCard title="Interviews" value={stats?.interviews} icon={CalendarIcon} color="indigo" />
        <StatCard title="Selected" value={stats?.selected} icon={UsersIcon} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/recruiter/post-job" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <PlusCircleIcon size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Post a New Job</span>
            </Link>
            <Link to="/recruiter/applicants" className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
              <UsersIcon size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-700">Review Applicants</span>
            </Link>
            <Link to="/recruiter/jobs" className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
              <BriefcaseIcon size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Manage Jobs</span>
            </Link>
          </div>
        </div>

        {/* Recent applications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
            <Link to="/recruiter/applicants" className="text-xs text-blue-600 hover:underline">View all</Link>
          </div>
          {stats?.recent_applications?.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">No applications yet</div>
          ) : (
            <div className="space-y-2">
              {stats?.recent_applications?.map(app => (
                <div key={app.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.candidate_name}</p>
                    <p className="text-xs text-gray-500">{app.job_title}</p>
                  </div>
                  <span className={`${statusColors[app.status] || 'badge-gray'} text-xs`}>{app.status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
