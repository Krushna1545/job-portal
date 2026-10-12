import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ZapIcon, CheckCircleIcon, XCircleIcon, TrendingUpIcon, FileTextIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

export default function ResumeAnalysis() {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await api.post('/ai/resume-score')
      setAnalysis(res.data)
      toast.success('Analysis complete!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Please upload a resume first.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const scoreBg = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="max-w-3xl space-y-5 fade-in">
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2.5 rounded-xl">
            <ZapIcon size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Resume Analyzer</h2>
            <p className="text-sm text-gray-500">Get instant feedback and improvement suggestions</p>
          </div>
        </div>
        <button onClick={analyze} disabled={loading} className="btn-primary flex items-center gap-2">
          <ZapIcon size={16} />
          {loading ? 'Analyzing...' : 'Analyze My Resume'}
        </button>
        <p className="text-xs text-gray-400 mt-2">Make sure you have uploaded a resume and completed your profile</p>
      </div>

      {analysis && (
        <div className="space-y-5 fade-in">
          {/* Score card */}
          <div className={`card bg-gradient-to-br ${scoreBg(analysis.score)} text-white`}>
            <div className="text-center">
              <p className="text-lg font-medium mb-2 opacity-90">Your Resume Score</p>
              <p className="text-7xl font-black mb-2">{analysis.score}</p>
              <p className="text-2xl font-bold opacity-90">/100</p>
              <div className="mt-3 inline-block bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold">
                {analysis.grade}
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Score Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(analysis.breakdown || {}).map(([key, val]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-sm font-semibold">{val}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(val, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Skills */}
          {analysis.extracted_skills?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.extracted_skills.map((skill, i) => (
                  <span key={i} className="badge-blue">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUpIcon size={18} className="text-blue-600" />
                Improvement Suggestions
              </h3>
              <div className="space-y-2">
                {analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-xl">
                    <XCircleIcon size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.score >= 80 && (
            <div className="card bg-green-50 border-green-100">
              <div className="flex items-center gap-3">
                <CheckCircleIcon size={24} className="text-green-500" />
                <div>
                  <p className="font-semibold text-green-800">Excellent Resume!</p>
                  <p className="text-sm text-green-600 mt-0.5">Your resume is well-optimized. Check recommended jobs that match your profile.</p>
                  <Link to="/seeker/recommended" className="text-sm text-green-700 font-medium hover:underline mt-1 block">View Recommendations →</Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!analysis && !loading && (
        <div className="card text-center py-12">
          <FileTextIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No analysis yet</p>
          <p className="text-gray-400 text-sm mt-1">Click "Analyze My Resume" to get started</p>
        </div>
      )}
    </div>
  )
}
