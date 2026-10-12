import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, MapPinIcon, MailIcon, PhoneIcon, LinkedinIcon, GithubIcon, DownloadIcon } from 'lucide-react'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function CandidateDetails() {
  const { id } = useParams()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/recruiter/candidates/${id}`).then(r => setCandidate(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <PageLoader />
  if (!candidate) return <div className="text-center py-20 text-gray-500">Candidate not found</div>

  return (
    <div className="max-w-3xl fade-in">
      <Link to="/recruiter/applicants" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-5">
        <ArrowLeftIcon size={15} /> Back to Applicants
      </Link>

      <div className="space-y-5">
        {/* Header */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
              {candidate.first_name?.[0]}{candidate.last_name?.[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{candidate.first_name} {candidate.last_name}</h1>
              {candidate.desired_role && <p className="text-gray-600 text-sm">{candidate.desired_role}</p>}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MailIcon size={12} />{candidate.email}</span>
                {candidate.phone && <span className="flex items-center gap-1"><PhoneIcon size={12} />{candidate.phone}</span>}
                {candidate.location && <span className="flex items-center gap-1"><MapPinIcon size={12} />{candidate.location}</span>}
              </div>
              <div className="flex gap-3 mt-2">
                {candidate.linkedin_url && <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs">LinkedIn</a>}
                {candidate.github_url && <a href={candidate.github_url} target="_blank" rel="noreferrer" className="text-gray-700 hover:underline text-xs">GitHub</a>}
              </div>
            </div>
            {candidate.resumes?.length > 0 && (
              <a href={`/api/resume/download/${candidate.resumes.find(r => r.is_primary)?.id || candidate.resumes[0].id}`}
                className="btn-secondary flex items-center gap-2 text-sm">
                <DownloadIcon size={14} /> Resume
              </a>
            )}
          </div>
        </div>

        {/* Skills */}
        {candidate.skills?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s, i) => (
                <span key={i} className="badge-blue">{s.name}<span className="ml-1 text-blue-400 text-xs">({s.proficiency})</span></span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {candidate.experience?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Work Experience</h3>
            {candidate.experience.map((e, i) => (
              <div key={i} className="mb-3 last:mb-0 p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-sm text-gray-900">{e.job_title}</p>
                <p className="text-xs text-gray-600">{e.company}</p>
                <p className="text-xs text-gray-400">{e.start_date} – {e.is_current === 'true' ? 'Present' : e.end_date}</p>
                {e.description && <p className="text-xs text-gray-500 mt-1">{e.description}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {candidate.education?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Education</h3>
            {candidate.education.map((e, i) => (
              <div key={i} className="mb-2 p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-sm text-gray-900">{e.degree}</p>
                <p className="text-xs text-gray-600">{e.institution}{e.field_of_study ? ` • ${e.field_of_study}` : ''}</p>
                <p className="text-xs text-gray-400">{e.start_year} – {e.end_year}</p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {candidate.certifications?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">Certifications</h3>
            {candidate.certifications.map((c, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <p className="text-sm text-gray-900">{c.name}{c.issuer ? ` — ${c.issuer}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
