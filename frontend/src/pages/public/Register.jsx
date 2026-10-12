import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BriefcaseIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', role: 'job_seeker'
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Account created successfully!')
      if (user.role === 'job_seeker') navigate('/seeker/dashboard')
      else if (user.role === 'recruiter') navigate('/recruiter/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start your career journey today</p>
        </div>

        <div className="card">
          {/* Role toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, role: 'job_seeker' }))}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${form.role === 'job_seeker' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, role: 'recruiter' }))}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${form.role === 'recruiter' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  className="input-field"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  className="input-field"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
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
                  placeholder="Min. 6 characters"
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
