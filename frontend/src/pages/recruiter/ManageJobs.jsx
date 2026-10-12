import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircleIcon, EditIcon, TrashIcon, EyeIcon, UsersIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const statusColors = { active: 'badge-green', closed: 'badge-gray', draft: 'badge-yellow' }

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = () => api.get('/recruiter/jobs').then(r => setJobs(r.data)).finally(() => setLoading(false))
  useEffect(() => { fetchJobs() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this job?')) return
    try {
      await api.delete(`/jobs/${id}`)
      toast.success('Job deleted')
      fetchJobs()
    } catch { toast.error('Failed to delete') }
  }

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active'
    try {
      await api.put(`/jobs/${job.id}`, { status: newStatus })
      toast.success(`Job ${newStatus}`)
      fetchJobs()
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{jobs.length} jobs posted</p>
        <Link to="/recruiter/post-job" className="btn-primary flex items-center gap-2 text-sm">
          <PlusCircleIcon size={16} /> Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-200 mb-4 text-5xl">📋</div>
          <h3 className="font-medium text-gray-600">No jobs posted yet</h3>
          <Link to="/recruiter/post-job" className="btn-primary text-sm mt-4 inline-block">Post Your First Job</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{job.title}</h3>
                    <span className={statusColors[job.status] || 'badge-gray'}>{job.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{job.location || 'Remote'}</span>
                    <span>{job.job_type}</span>
                    <span className="flex items-center gap-1"><EyeIcon size={12} />{job.views_count || 0} views</span>
                    <span className="flex items-center gap-1"><UsersIcon size={12} />{job.applications_count || 0} applicants</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.skills.slice(0, 4).map((s, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.name}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => toggleStatus(job)} className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${job.status === 'active' ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                    {job.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <Link to={`/recruiter/applicants?job_id=${job.id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
                    <UsersIcon size={16} />
                  </Link>
                  <button onClick={() => handleDelete(job.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
