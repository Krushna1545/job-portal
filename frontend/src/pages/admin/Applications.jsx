import React, { useState, useEffect } from 'react'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const statusColors = {
  applied: 'badge-blue', under_review: 'badge-yellow', shortlisted: 'badge-green',
  interview: 'badge-purple', selected: 'bg-green-100 text-green-800 badge', rejected: 'badge-red'
}

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/applications').then(r => {
      setApplications(r.data.applications)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4 fade-in">
      <p className="text-sm text-gray-500">{total} total applications</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium text-gray-500">ID</th>
              <th className="pb-3 font-medium text-gray-500">Job Title</th>
              <th className="pb-3 font-medium text-gray-500">Candidate</th>
              <th className="pb-3 font-medium text-gray-500">Status</th>
              <th className="pb-3 font-medium text-gray-500">Applied</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(a => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 text-gray-400">{a.id}</td>
                <td className="py-3 font-medium text-gray-900 max-w-xs truncate">{a.job_title}</td>
                <td className="py-3 text-gray-600">{a.candidate}</td>
                <td className="py-3">
                  <span className={`${statusColors[a.status] || 'badge-gray'} text-xs`}>{a.status.replace('_', ' ')}</span>
                </td>
                <td className="py-3 text-gray-500">{new Date(a.applied_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
