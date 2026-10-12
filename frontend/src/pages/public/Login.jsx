import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success('Welcome back!')
      if (user.role === 'job_seeker') navigate('/seeker/dashboard')
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard')
      else if (user.role === 'admin') navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { label: 'Job Seeker', email: 'john.doe@example.com', password: 'Seeker@123' },
    { label: 'Recruiter', email: 'recruiter@techcorp.com', password: 'Recruiter@123' },
    { label: 'Admin', email: 'admin@jobportal.com', password: 'Admin@123' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-blue-600 p-2 rounded-xl">
              <BriefcaseIcon size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">JobPortal<span className="text-blue-600">AI</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="Your password"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Sign up</Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-xs text-center text-gray-400 mb-3">Quick demo accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.label}
                onClick={() => setForm({ email: acc.email, password: acc.password })}
                className="text-xs bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg px-2 py-2 text-gray-600 hover:text-blue-600 transition-all"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
