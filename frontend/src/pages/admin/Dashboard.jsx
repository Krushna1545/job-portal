import React, { useState, useEffect } from 'react'
import { UsersIcon, BriefcaseIcon, ClipboardListIcon, TrendingUpIcon, UserCheckIcon, BuildingIcon } from 'lucide-react'
import api from '../../api/axios'
import StatCard from '../../components/ui/StatCard'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={data?.stats.total_users} icon={UsersIcon} color="blue" />
        <StatCard title="Job Seekers" value={data?.stats.job_seekers} icon={UserCheckIcon} color="green" />
        <StatCard title="Recruiters" value={data?.stats.recruiters} icon={BuildingIcon} color="purple" />
        <StatCard title="Total Jobs" value={data?.stats.total_jobs} icon={BriefcaseIcon} color="yellow" />
        <StatCard title="Active Jobs" value={data?.stats.active_jobs} icon={TrendingUpIcon} color="green" />
        <StatCard title="Applications" value={data?.stats.total_applications} icon={ClipboardListIcon} color="indigo" />
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="pb-2 text-gray-500 font-medium">Email</th>
                <th className="pb-2 text-gray-500 font-medium">Role</th>
                <th className="pb-2 text-gray-500 font-medium">Status</th>
                <th className="pb-2 text-gray-500 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_users?.map(u => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-2.5 text-gray-900">{u.email}</td>
                  <td className="py-2.5">
                    <span className={`badge text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'recruiter' ? 'badge-purple' : 'badge-blue'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className={`badge text-xs ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
