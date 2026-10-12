import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react'
import api from '../../api/axios'
import JobCard from '../../components/ui/JobCard'
import { PageLoader } from '../../components/ui/LoadingSpinner'

const jobTypes = ['full-time', 'part-time', 'contract', 'internship']
const workModes = ['remote', 'onsite', 'hybrid']

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: '',
    job_type: '',
    work_mode: '',
    salary_min: '',
    experience_min: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      params.set('page', page)
      params.set('per_page', '12')
      const res = await api.get(`/jobs/public?${params}`)
      setJobs(res.data.jobs || [])
      setTotal(res.data.total || 0)
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const handleFilterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({ keyword: '', location: '', job_type: '', work_mode: '', salary_min: '', experience_min: '' })
    setPage(1)
  }

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">{total} opportunities available</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={e => handleFilterChange('keyword', e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        >
          <FilterIcon size={15} />
          Filters
        </button>
        {Object.values(filters).some(v => v) && (
          <button onClick={clearFilters} className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg border border-red-200">
            <XIcon size={15} />
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={e => handleFilterChange('location', e.target.value)}
                placeholder="City or Remote"
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Job Type</label>
              <select value={filters.job_type} onChange={e => handleFilterChange('job_type', e.target.value)} className="input-field text-sm">
                <option value="">All Types</option>
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Work Mode</label>
              <select value={filters.work_mode} onChange={e => handleFilterChange('work_mode', e.target.value)} className="input-field text-sm">
                <option value="">All Modes</option>
                {workModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Salary ($)</label>
              <input
                type="number"
                value={filters.salary_min}
                onChange={e => handleFilterChange('salary_min', e.target.value)}
                placeholder="e.g. 50000"
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No jobs found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 text-sm border rounded-lg ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
