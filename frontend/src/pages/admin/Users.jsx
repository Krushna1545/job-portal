import React, { useState, useEffect } from 'react'
import { SearchIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = () => {
    const params = new URLSearchParams({ page, per_page: 20 })
    if (roleFilter) params.set('role', roleFilter)
    api.get(`/admin/users?${params}`).then(r => {
      setUsers(r.data.users)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const toggleActive = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-active`)
      toast.success(res.data.message)
      fetchUsers()
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {['', 'job_seeker', 'recruiter', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-1.5 text-sm rounded-lg font-medium ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
              {r || 'All'}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">{total} users</span>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium text-gray-500">ID</th>
              <th className="pb-3 font-medium text-gray-500">Name</th>
              <th className="pb-3 font-medium text-gray-500">Email</th>
              <th className="pb-3 font-medium text-gray-500">Role</th>
              <th className="pb-3 font-medium text-gray-500">Status</th>
              <th className="pb-3 font-medium text-gray-500">Joined</th>
              <th className="pb-3 font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 text-gray-400">{u.id}</td>
                <td className="py-3 font-medium">{u.name || '—'}</td>
                <td className="py-3 text-gray-600">{u.email}</td>
                <td className="py-3">
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'recruiter' ? 'badge-purple' : 'badge-blue'}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3">
                  <span className={`badge text-xs ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="py-3">
                  <button onClick={() => toggleActive(u.id)} className="text-gray-400 hover:text-blue-600">
                    {u.is_active ? <ToggleRightIcon size={20} className="text-green-500" /> : <ToggleLeftIcon size={20} />}
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
