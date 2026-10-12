import React from 'react'
import { Link } from 'react-router-dom'
import { MapPinIcon, ClockIcon, DollarSignIcon, BookmarkIcon, ZapIcon, BuildingIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const workModeColors = {
  remote: 'badge-green',
  hybrid: 'badge-yellow',
  onsite: 'badge-blue',
}

const jobTypeColors = {
  'full-time': 'badge-blue',
  'part-time': 'badge-purple',
  contract: 'badge-yellow',
  internship: 'badge-gray',
}

export default function JobCard({ job, onSaveToggle }) {
  const { user } = useAuth()

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return null
    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
    if (min && max) return `${fmt(min)} - ${fmt(max)}`
    if (min) return `From ${fmt(min)}`
    return `Up to ${fmt(max)}`
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please login to save jobs'); return }
    try {
      const res = await api.post(`/saved-jobs/${job.id}`)
      toast.success(res.data.message)
      if (onSaveToggle) onSaveToggle(job.id, res.data.saved)
    } catch {
      toast.error('Failed to save job')
    }
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency)

  return (
    <div className="card hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            {job.company?.logo_url ? (
              <img src={job.company.logo_url} alt={job.company.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <BuildingIcon size={22} className="text-white" />
            )}
          </div>
          <div>
            <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 text-sm">
              {job.title}
            </Link>
            <p className="text-xs text-gray-500">{job.company?.name || 'Company'}</p>
          </div>
        </div>
        {user?.role === 'job_seeker' && (
          <button onClick={handleSave} className={`p-1.5 rounded-lg transition-colors ${job.is_saved ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
            <BookmarkIcon size={16} fill={job.is_saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {job.work_mode && (
          <span className={workModeColors[job.work_mode] || 'badge-gray'}>
            {job.work_mode}
          </span>
        )}
        {job.job_type && (
          <span className={jobTypeColors[job.job_type] || 'badge-gray'}>
            {job.job_type}
          </span>
        )}
        {job.is_featured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
      </div>

      <div className="space-y-1.5 mb-3">
        {job.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPinIcon size={13} />
            {job.location}
          </div>
        )}
        {salary && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <DollarSignIcon size={13} />
            {salary}
          </div>
        )}
        {(job.experience_min !== null && job.experience_min !== undefined) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ClockIcon size={13} />
            {job.experience_min === 0 ? 'Entry level' : `${job.experience_min}+ years exp.`}
          </div>
        )}
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.slice(0, 4).map((s, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{s.name}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
          )}
        </div>
      )}

      {job.match_score !== null && job.match_score !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <ZapIcon size={12} className="text-blue-500" /> Match
            </span>
            <span className="text-xs font-semibold text-blue-600">{job.match_score}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${job.match_score >= 70 ? 'bg-green-500' : job.match_score >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`}
              style={{ width: `${job.match_score}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
