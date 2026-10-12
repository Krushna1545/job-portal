import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardListIcon, CalendarIcon, BuildingIcon } from 'lucide-react'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const statusConfig = {
  applied: { label: 'Applied', color: 'badge-blue' },
  under_review: { label: 'Under Review', color: 'badge-yellow' },
  shortlisted: { label: 'Shortlisted', color: 'badge-green' },
  interview: { label: 'Interview', color: 'badge-purple' },
  selected: { label: 'Selected', color: 'bg-green-100 text-green-800 badge' },
  rejected: { label: 'Rejected', color: 'badge-red' },
}

export default function SeekerApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/applications').then(r => setApplications(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter ? applications.filter(a => a.status === filter) : applications

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${!filter ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
        >
          All ({applications.length})
        </button>
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = applications.filter(a => a.status === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${filter === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
            >
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardListIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-medium text-gray-600">No applications found</h3>
          <p className="text-sm text-gray-400 mt-1">Start applying to jobs</p>
          <Link to="/jobs" className="btn-primary text-sm mt-4 inline-block">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(app => {
            const sc = statusConfig[app.status] || { label: app.status, color: 'badge-gray' }
            return (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BuildingIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <Link to={`/jobs/${app.job_id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm">
                        {app.job?.title || 'Job Position'}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {app.job?.company?.name || 'Company'}
                        {app.job?.location ? ` • ${app.job.location}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <CalendarIcon size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                      {app.interview && (
                        <div className="mt-2 bg-purple-50 rounded-lg px-3 py-1.5 text-xs text-purple-700">
                          Interview: {new Date(app.interview.interview_date).toLocaleDateString()} via {app.interview.interview_type}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={sc.color}>{sc.label}</span>
                </div>
                {app.recruiter_notes && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Recruiter note: <span className="text-gray-700">{app.recruiter_notes}</span></p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
