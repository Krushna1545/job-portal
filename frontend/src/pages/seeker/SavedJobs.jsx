import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkIcon, MapPinIcon, BuildingIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function SeekerSavedJobs() {
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/saved-jobs').then(r => setSavedJobs(r.data)).finally(() => setLoading(false))
  }, [])

  const unsave = async (jobId) => {
    try {
      await api.post(`/saved-jobs/${jobId}`)
      setSavedJobs(prev => prev.filter(s => s.job.id !== jobId))
      toast.success('Removed from saved jobs')
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4 fade-in">
      <p className="text-sm text-gray-500">{savedJobs.length} saved jobs</p>
      {savedJobs.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-medium text-gray-600">No saved jobs</h3>
          <p className="text-sm text-gray-400 mt-1">Browse jobs and save the ones you like</p>
          <Link to="/jobs" className="btn-primary text-sm mt-4 inline-block">Browse Jobs</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map(saved => (
            <div key={saved.saved_id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <BuildingIcon size={18} className="text-white" />
                  </div>
                  <div>
                    <Link to={`/jobs/${saved.job.id}`} className="font-semibold text-sm text-gray-900 hover:text-blue-600">{saved.job.title}</Link>
                    <p className="text-xs text-gray-500">{saved.job.company?.name}</p>
                  </div>
                </div>
                <button onClick={() => unsave(saved.job.id)} className="text-blue-600">
                  <BookmarkIcon size={16} fill="currentColor" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                {saved.job.location && <span className="flex items-center gap-1"><MapPinIcon size={12} />{saved.job.location}</span>}
                {saved.job.job_type && <span className="badge-blue">{saved.job.job_type}</span>}
              </div>
              <Link to={`/jobs/${saved.job.id}`} className="btn-primary w-full text-sm text-center block">View & Apply</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
