import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { UserIcon, DownloadIcon, CalendarIcon, ZapIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const statuses = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected']
const statusColors = {
  applied: 'badge-blue', under_review: 'badge-yellow', shortlisted: 'badge-green',
  interview: 'badge-purple', selected: 'bg-green-100 text-green-800 badge', rejected: 'badge-red'
}

export default function Applicants() {
  const [searchParams] = useSearchParams()
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [scheduleModal, setScheduleModal] = useState(null)
  const [interviewForm, setInterviewForm] = useState({ interview_date: '', interview_type: 'video', meeting_link: '', notes: '' })

  const fetchApplicants = () => {
    const params = new URLSearchParams()
    const jobId = searchParams.get('job_id')
    if (jobId) params.set('job_id', jobId)
    if (filterStatus) params.set('status', filterStatus)
    api.get(`/recruiter/applicants?${params}`).then(r => setApplicants(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchApplicants() }, [filterStatus, searchParams])

  const updateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status })
      toast.success('Status updated')
      fetchApplicants()
    } catch { toast.error('Failed') }
  }

  const scheduleInterview = async () => {
    if (!interviewForm.interview_date) { toast.error('Select interview date'); return }
    try {
      await api.post('/applications/interview', {
        application_id: scheduleModal,
        ...interviewForm
      })
      toast.success('Interview scheduled!')
      setScheduleModal(null)
      fetchApplicants()
    } catch { toast.error('Failed to schedule') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4 fade-in">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus('')} className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap ${!filterStatus ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
          All ({applicants.length})
        </button>
        {statuses.map(s => {
          const count = applicants.filter(a => a.status === s).length
          return (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
              {s.replace('_', ' ')} {count > 0 ? `(${count})` : ''}
            </button>
          )
        })}
      </div>

      {applicants.length === 0 ? (
        <div className="text-center py-16">
          <UserIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">No applicants found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map(app => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {app.candidate?.first_name?.[0]}{app.candidate?.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/recruiter/candidates/${app.candidate?.id}`} className="font-semibold text-sm text-gray-900 hover:text-blue-600">
                        {app.candidate?.first_name} {app.candidate?.last_name}
                      </Link>
                      {app.match_score !== null && (
                        <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          <ZapIcon size={10} />{app.match_score}% match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{app.candidate?.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{app.job?.title} • Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                    {app.candidate?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {app.candidate.skills.slice(0, 4).map((s, i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={statusColors[app.status] || 'badge-gray'}>{app.status.replace('_', ' ')}</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    {app.has_resume && (
                      <a href={`/api/resume/download/${app.resume_id}`} className="p-1.5 text-gray-400 hover:text-blue-600">
                        <DownloadIcon size={15} />
                      </a>
                    )}
                    <button onClick={() => setScheduleModal(app.id)} className="p-1.5 text-gray-400 hover:text-purple-600">
                      <CalendarIcon size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {app.interview && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                  <CalendarIcon size={13} />
                  Interview: {new Date(app.interview.interview_date).toLocaleString()} • {app.interview.interview_type}
                  {app.interview.meeting_link && <a href={app.interview.meeting_link} target="_blank" rel="noreferrer" className="underline">Join</a>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Interview scheduling modal */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Schedule Interview</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Interview Date & Time</label>
                <input type="datetime-local" value={interviewForm.interview_date} onChange={e => setInterviewForm(f => ({ ...f, interview_date: e.target.value }))} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Interview Type</label>
                <select value={interviewForm.interview_type} onChange={e => setInterviewForm(f => ({ ...f, interview_type: e.target.value }))} className="input-field text-sm">
                  <option value="video">Video Call</option>
                  <option value="phone">Phone</option>
                  <option value="onsite">On-site</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Link (optional)</label>
                <input type="url" value={interviewForm.meeting_link} onChange={e => setInterviewForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://..." className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                <textarea value={interviewForm.notes} onChange={e => setInterviewForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input-field text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={scheduleInterview} className="btn-primary flex-1">Schedule</button>
              <button onClick={() => setScheduleModal(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
