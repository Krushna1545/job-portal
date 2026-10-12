import React, { useState, useEffect } from 'react'
import { TrashIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchJobs = () => {
    api.get('/admin/jobs').then(r => {
      setJobs(r.data.jobs)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [])

  const deleteJob = async (id) => {
    if (!confirm('Delete this job permanently?')) return
    try {
      await api.delete(`/admin/jobs/${id}`)
      toast.success('Job deleted')
      fetchJobs()
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4 fade-in">
      <p className="text-sm text-gray-500">{total} total jobs</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium text-gray-500">Title</th>
              <th className="pb-3 font-medium text-gray-500">Company</th>
              <th className="pb-3 font-medium text-gray-500">Location</th>
              <th className="pb-3 font-medium text-gray-500">Status</th>
              <th className="pb-3 font-medium text-gray-500">Apps</th>
              <th className="pb-3 font-medium text-gray-500">Posted</th>
              <th className="pb-3 font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900 max-w-xs truncate">{j.title}</td>
                <td className="py-3 text-gray-600">{j.company_name}</td>
                <td className="py-3 text-gray-500">{j.location || '—'}</td>
                <td className="py-3">
                  <span className={`badge text-xs ${j.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{j.status}</span>
                </td>
                <td className="py-3 text-gray-600">{j.applications_count}</td>
                <td className="py-3 text-gray-500">{new Date(j.created_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <button onClick={() => deleteJob(j.id)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
