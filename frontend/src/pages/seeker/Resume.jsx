import React, { useState, useEffect, useRef } from 'react'
import { UploadIcon, FileTextIcon, TrashIcon, DownloadIcon, CheckCircleIcon, ZapIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function SeekerResume() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const fetchResumes = () => {
    api.get('/resume').then(r => setResumes(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchResumes() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx'].includes(ext)) {
      toast.error('Only PDF and DOCX files are allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Resume uploaded successfully!')
      fetchResumes()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resume/${id}`)
      toast.success('Resume deleted')
      fetchResumes()
    } catch { toast.error('Failed to delete') }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      {/* Upload section */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Upload Resume</h2>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-10 text-center cursor-pointer transition-colors group"
        >
          <UploadIcon size={40} className="mx-auto text-gray-300 group-hover:text-blue-400 mb-3 transition-colors" />
          <p className="font-medium text-gray-700 mb-1">Click to upload resume</p>
          <p className="text-xs text-gray-400">PDF or DOCX • Max 5MB</p>
          {uploading && <div className="mt-3 text-sm text-blue-600 animate-pulse">Uploading...</div>}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={handleUpload} className="hidden" />
      </div>

      {/* Resume list */}
      {resumes.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">My Resumes</h2>
          <div className="space-y-3">
            {resumes.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2.5 rounded-xl">
                    <FileTextIcon size={20} className="text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-900">{r.filename}</p>
                      {r.is_primary && (
                        <span className="badge-green text-xs flex items-center gap-1">
                          <CheckCircleIcon size={10} /> Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {r.file_type?.toUpperCase()} • {formatSize(r.file_size)} • {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/uploads/resumes/${r.filename}`} download className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                    <DownloadIcon size={16} />
                  </a>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resumes.length === 0 && (
        <div className="card text-center py-8 text-gray-400">
          <FileTextIcon size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">No resumes uploaded yet</p>
          <p className="text-sm mt-1">Upload your resume to get started</p>
        </div>
      )}

      {resumes.some(r => r.is_primary) && (
        <div className="card bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <ZapIcon size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Resume Analysis Available</p>
              <p className="text-sm text-blue-600 mt-1">Get your AI resume score and improvement suggestions.</p>
              <Link to="/seeker/resume-analysis" className="btn-primary text-sm mt-3 inline-block">Analyze Resume</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
