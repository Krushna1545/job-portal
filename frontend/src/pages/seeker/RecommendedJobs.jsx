import React, { useState, useEffect } from 'react'
import { ZapIcon, StarIcon } from 'lucide-react'
import api from '../../api/axios'
import JobCard from '../../components/ui/JobCard'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ai/recommendations')
      .then(r => setJobs(r.data.recommendations || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in">
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-xl">
            <ZapIcon size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Job Recommendations</h2>
            <p className="text-sm text-gray-500">Jobs matched to your skills and experience</p>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <StarIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-medium text-gray-600">No recommendations yet</h3>
          <p className="text-sm text-gray-400 mt-1">Add skills to your profile to get personalized recommendations</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map(job => <JobCard key={job.id} job={{ ...job, match_score: job.match_score }} />)}
        </div>
      )}
    </div>
  )
}
