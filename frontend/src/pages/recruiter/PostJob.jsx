import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, XIcon, ZapIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const skillSuggestions = ['Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'FastAPI', 'Django', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Machine Learning', 'SQL', 'Git']

export default function PostJob() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [jdSuggestions, setJdSuggestions] = useState(null)
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', responsibilities: '',
    location: '', job_type: 'full-time', work_mode: 'onsite',
    salary_min: '', salary_max: '', experience_min: 0, experience_max: '',
    education_required: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSkill = (s) => {
    const skill = s || skillInput.trim()
    if (skill && !skills.includes(skill)) {
      setSkills(prev => [...prev, skill])
    }
    setSkillInput('')
  }

  const removeSkill = (s) => setSkills(prev => prev.filter(sk => sk !== s))

  const analyzeJD = async () => {
    if (!form.description) { toast.error('Enter a job description first'); return }
    setAnalyzing(true)
    try {
      const res = await api.post('/ai/analyze-jd', { description: form.description })
      setJdSuggestions(res.data)
      // Auto-add detected skills
      if (res.data.detected_skills) {
        const newSkills = res.data.detected_skills.filter(s => !skills.includes(s))
        setSkills(prev => [...prev, ...newSkills.slice(0, 5)])
      }
      toast.success('AI analysis complete!')
    } catch { toast.error('Analysis failed') } finally { setAnalyzing(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description) { toast.error('Title and description are required'); return }
    setLoading(true)
    try {
      await api.post('/jobs', {
        ...form,
        salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
        salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
        experience_min: parseFloat(form.experience_min) || 0,
        experience_max: form.experience_max ? parseFloat(form.experience_max) : null,
        skills
      })
      toast.success('Job posted successfully!')
      navigate('/recruiter/jobs')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Job Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Python Developer" className="input-field" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select value={form.job_type} onChange={e => set('job_type', e.target.value)} className="input-field">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                <select value={form.work_mode} onChange={e => set('work_mode', e.target.value)} className="input-field">
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. New York, NY or Remote" className="input-field" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Job Description *</h2>
            <button type="button" onClick={analyzeJD} disabled={analyzing} className="flex items-center gap-1.5 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
              <ZapIcon size={14} /> {analyzing ? 'Analyzing...' : 'AI Analyze'}
            </button>
          </div>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Describe the role, responsibilities, and what makes it great..."
            rows={6}
            className="input-field resize-none"
            required
          />
          {jdSuggestions?.suggestions?.length > 0 && (
            <div className="mt-3 bg-yellow-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-yellow-800 mb-2">AI Suggestions:</p>
              {jdSuggestions.suggestions.map((s, i) => (
                <p key={i} className="text-xs text-yellow-700 mb-1">• {s}</p>
              ))}
            </div>
          )}
        </div>

        {/* Requirements & Responsibilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Requirements</h2>
            <textarea
              value={form.requirements}
              onChange={e => set('requirements', e.target.value)}
              placeholder="List requirements, one per line..."
              rows={5}
              className="input-field resize-none"
            />
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">Responsibilities</h2>
            <textarea
              value={form.responsibilities}
              onChange={e => set('responsibilities', e.target.value)}
              placeholder="List key responsibilities..."
              rows={5}
              className="input-field resize-none"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
          <div className="flex gap-2 mb-3">
            <input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill"
              className="input-field flex-1 text-sm"
            />
            <button type="button" onClick={() => addSkill()} className="btn-primary text-sm px-3">
              <PlusIcon size={15} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {skillSuggestions.map(s => (
              !skills.includes(s) && (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 px-2 py-1 rounded-lg transition-colors">
                  + {s}
                </button>
              )
            ))}
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1 badge-blue">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="ml-1 text-blue-400 hover:text-red-500">
                    <XIcon size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Salary & Experience */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Compensation & Requirements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Salary ($)</label>
              <input type="number" value={form.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="70000" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Salary ($)</label>
              <input type="number" value={form.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="120000" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Experience (yrs)</label>
              <input type="number" value={form.experience_min} onChange={e => set('experience_min', e.target.value)} min="0" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Experience (yrs)</label>
              <input type="number" value={form.experience_max} onChange={e => set('experience_max', e.target.value)} className="input-field text-sm" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}
