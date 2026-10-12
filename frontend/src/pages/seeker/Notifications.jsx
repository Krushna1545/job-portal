import React, { useState, useEffect } from 'react'
import { BellIcon, CheckIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function SeekerNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => api.get('/notifications').then(r => setNotifications(r.data)).finally(() => setLoading(false))
  useEffect(() => { fetch() }, [])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    toast.success('All marked as read')
  }

  if (loading) return <PageLoader />
  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="max-w-2xl space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{unread} unread</p>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <CheckIcon size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <BellIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        notifications.map(n => (
          <div
            key={n.id}
            onClick={() => !n.is_read && markRead(n.id)}
            className={`card cursor-pointer transition-all ${!n.is_read ? 'border-l-4 border-blue-500 bg-blue-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`font-medium text-sm ${!n.is_read ? 'text-blue-900' : 'text-gray-900'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.is_read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
