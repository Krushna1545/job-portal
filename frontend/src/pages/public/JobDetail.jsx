import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPinIcon, ClockIcon, DollarSignIcon, BuildingIcon, BookmarkIcon, ArrowLeftIcon, ZapIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function JobDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [matchData, setMatchData] = useState(null)

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => {
      setJob(r.data)
      if (user?.role === 'job_seeker') {
        api.post('/ai/job-match', { job_id: parseInt(id) }).then(m => setMatchData(m.data)).catch(() => {})
      }
    }).catch(() => toast.error('Job not found')).finally(() => setLoading(false))
  }, [id, user])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setApplying(true)
    try {
      await api.post('/applications', { job_id: job.id, cover_letter: coverLetter })
      toast.success('Application submitted!')
      setShowApplyForm(false)
      setJob(j => ({ ...j, has_applied: true }))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  const handleSave = async () => {
    if (!user) { navigate('/login'); return }
    try {
      const res = await api.post(`/saved-jobs/${job.id}`)
      toast.success(res.data.message)
      setJob(j => ({ ...j, is_saved: res.data.saved }))
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />
  if (!job) return <div className="text-center py-20 text-gray-500">Job not found</div>

  const salary = job.salary_min || job.salary_max
    ? `$${job.salary_min?.toLocaleString() || '?'} - $${job.salary_max?.toLocaleString() || '?'}`
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeftIcon size={15} /> Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <BuildingIcon size={30} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-gray-600">{job.company?.name}</p>
                </div>
              </div>
              {user?.role === 'job_seeker' && (
                <button onClick={handleSave} className={`p-2 rounded-xl border transition-colors ${job.is_saved ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-gray-400 border-gray-200 hover:border-blue-200 hover:text-blue-600'}`}>
                  <BookmarkIcon size={18} fill={job.is_saved ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              {job.location && <span className="flex items-center gap-1 text-sm text-gray-600"><MapPinIcon size={14} />{job.location}</span>}
              {job.job_type && <span className="badge-blue">{job.job_type}</span>}
              {job.work_mode && <span className="badge-green">{job.work_mode}</span>}
              {salary && <span className="flex items-center gap-1 text-sm text-gray-600"><DollarSignIcon size={14} />{salary}</span>}
              {job.experience_min !== null && <span className="flex items-center gap-1 text-sm text-gray-600"><ClockIcon size={14} />{job.experience_min === 0 ? 'Entry level' : `${job.experience_min}+ yrs`}</span>}
            </div>

            {job.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {job.skills.map((s, i) => (
                  <span key={i} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{s.name}</span>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.requirements && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.requirements}</p>
            </div>
          )}

          {job.responsibilities && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{job.responsibilities}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Apply card */}
          <div className="card">
            {user?.role === 'job_seeker' ? (
              <>
                {job.has_applied ? (
                  <div className="text-center py-2">
                    <CheckCircleIcon size={32} className="text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-700">Application Submitted</p>
                    <Link to="/seeker/applications" className="text-sm text-blue-600 hover:underline mt-1 block">View Applications</Link>
                  </div>
                ) : showApplyForm ? (
                  <form onSubmit={handleApply}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (optional)</label>
                    <textarea
                      value={coverLetter}
                      onChange={e => setCoverLetter(e.target.value)}
                      rows={4}
                      className="input-field mb-3 text-sm resize-none"
                      placeholder="Tell them why you're the perfect fit..."
                    />
                    <button type="submit" disabled={applying} className="btn-primary w-full mb-2">
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button type="button" onClick={() => setShowApplyForm(false)} className="btn-secondary w-full text-sm">Cancel</button>
                  </form>
                ) : (
                  <button onClick={() => setShowApplyForm(true)} className="btn-primary w-full py-3">Apply Now</button>
                )}
              </>
            ) : (
              <Link to="/login" className="btn-primary w-full py-3 block text-center">
                Login to Apply
              </Link>
            )}
          </div>

          {/* AI Match */}
          {matchData && (
            <div className="card border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-3">
                <ZapIcon size={16} className="text-blue-500" />
                <span className="font-semibold text-gray-900 text-sm">AI Match Score</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{matchData.overall_score}%</div>
              <div className="h-2 bg-gray-100 rounded-full mb-3">
                <div className={`h-full rounded-full ${matchData.overall_score >= 70 ? 'bg-green-500' : matchData.overall_score >= 40 ? 'bg-yellow-500' : 'bg-red-400'}`} style={{ width: `${matchData.overall_score}%` }} />
              </div>
              {matchData.matching_skills?.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-green-700 mb-1">Matching Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {matchData.matching_skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircleIcon size={10} /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {matchData.missing_skills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-600 mb-1">Missing Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {matchData.missing_skills.slice(0, 3).map((s, i) => (
                      <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <XCircleIcon size={10} /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Job info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Job Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Posted</span>
                <span className="font-medium">{new Date(job.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Views</span>
                <span className="font-medium">{job.views_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Applications</span>
                <span className="font-medium">{job.applications_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
