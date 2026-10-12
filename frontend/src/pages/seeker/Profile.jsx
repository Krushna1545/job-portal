import React, { useState, useEffect } from 'react'
import { PlusIcon, TrashIcon, SaveIcon, EditIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

function Section({ title, children, onAdd }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg">
            <PlusIcon size={13} /> Add
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default function SeekerProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editBasic, setEditBasic] = useState(false)
  const [formData, setFormData] = useState({})
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 'intermediate' })
  const [newEdu, setNewEdu] = useState({ degree: '', institution: '', field_of_study: '', start_year: '', end_year: '' })
  const [newExp, setNewExp] = useState({ job_title: '', company: '', location: '', start_date: '', end_date: '', is_current: 'false', description: '' })
  const [newCert, setNewCert] = useState({ name: '', issuer: '', issue_date: '' })
  const [showAddEdu, setShowAddEdu] = useState(false)
  const [showAddExp, setShowAddExp] = useState(false)
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [showAddCert, setShowAddCert] = useState(false)

  const fetchProfile = () => {
    api.get('/profile').then(r => {
      setProfile(r.data)
      setFormData({
        first_name: r.data.first_name, last_name: r.data.last_name,
        phone: r.data.phone || '', location: r.data.location || '',
        bio: r.data.bio || '', linkedin_url: r.data.linkedin_url || '',
        github_url: r.data.github_url || '', desired_role: r.data.desired_role || '',
        years_of_experience: r.data.years_of_experience || 0
      })
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProfile() }, [])

  const saveBasic = async () => {
    setSaving(true)
    try {
      await api.put('/profile', formData)
      toast.success('Profile updated!')
      setEditBasic(false)
      fetchProfile()
    } catch { toast.error('Failed to update') } finally { setSaving(false) }
  }

  const addSkill = async () => {
    if (!newSkill.name) return
    try {
      await api.post('/profile/skills', newSkill)
      toast.success('Skill added')
      setNewSkill({ name: '', proficiency: 'intermediate' })
      setShowAddSkill(false)
      fetchProfile()
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
  }

  const deleteSkill = async (id) => {
    try {
      await api.delete(`/profile/skills/${id}`)
      toast.success('Skill removed')
      fetchProfile()
    } catch { toast.error('Failed') }
  }

  const addEducation = async () => {
    if (!newEdu.degree || !newEdu.institution) return
    try {
      await api.post('/profile/education', newEdu)
      toast.success('Education added')
      setNewEdu({ degree: '', institution: '', field_of_study: '', start_year: '', end_year: '' })
      setShowAddEdu(false)
      fetchProfile()
    } catch { toast.error('Failed') }
  }

  const deleteEducation = async (id) => {
    try {
      await api.delete(`/profile/education/${id}`)
      toast.success('Deleted')
      fetchProfile()
    } catch { toast.error('Failed') }
  }

  const addExperience = async () => {
    if (!newExp.job_title || !newExp.company) return
    try {
      await api.post('/profile/experience', newExp)
      toast.success('Experience added')
      setNewExp({ job_title: '', company: '', location: '', start_date: '', end_date: '', is_current: 'false', description: '' })
      setShowAddExp(false)
      fetchProfile()
    } catch { toast.error('Failed') }
  }

  const addCertification = async () => {
    if (!newCert.name) return
    try {
      await api.post('/profile/certifications', newCert)
      toast.success('Certification added')
      setNewCert({ name: '', issuer: '', issue_date: '' })
      setShowAddCert(false)
      fetchProfile()
    } catch { toast.error('Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      {/* Basic Info */}
      <Section title="Basic Information">
        <div className="flex justify-end mb-3">
          <button onClick={() => setEditBasic(v => !v)} className="btn-secondary text-sm flex items-center gap-1.5">
            <EditIcon size={14} /> {editBasic ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editBasic ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'first_name', label: 'First Name' },
              { key: 'last_name', label: 'Last Name' },
              { key: 'phone', label: 'Phone' },
              { key: 'location', label: 'Location' },
              { key: 'desired_role', label: 'Desired Role' },
              { key: 'years_of_experience', label: 'Years of Experience', type: 'number' },
              { key: 'linkedin_url', label: 'LinkedIn URL' },
              { key: 'github_url', label: 'GitHub URL' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  value={formData[field.key] || ''}
                  onChange={e => setFormData(f => ({ ...f, [field.key]: e.target.value }))}
                  className="input-field text-sm"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Bio</label>
              <textarea
                value={formData.bio || ''}
                onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="input-field text-sm resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <button onClick={saveBasic} disabled={saving} className="btn-primary flex items-center gap-2">
                <SaveIcon size={14} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">Name</p><p className="font-medium">{profile?.first_name} {profile?.last_name}</p></div>
            <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{profile?.email}</p></div>
            <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{profile?.phone || '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Location</p><p className="font-medium">{profile?.location || '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Desired Role</p><p className="font-medium">{profile?.desired_role || '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Experience</p><p className="font-medium">{profile?.years_of_experience || 0} years</p></div>
            {profile?.bio && <div className="col-span-2"><p className="text-gray-500 text-xs">Bio</p><p className="font-medium">{profile.bio}</p></div>}
          </div>
        )}
      </Section>

      {/* Skills */}
      <Section title={`Skills (${profile?.skills?.length || 0})`} onAdd={() => setShowAddSkill(v => !v)}>
        {showAddSkill && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3 flex gap-2">
            <input value={newSkill.name} onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))} placeholder="Skill name" className="input-field flex-1 text-sm" />
            <select value={newSkill.proficiency} onChange={e => setNewSkill(s => ({ ...s, proficiency: e.target.value }))} className="input-field text-sm w-32">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
            <button onClick={addSkill} className="btn-primary text-sm px-3">Add</button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map(s => (
            <div key={s.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm group">
              <span>{s.name}</span>
              <span className="text-xs text-blue-400">({s.proficiency})</span>
              <button onClick={() => deleteSkill(s.id)} className="text-blue-300 hover:text-red-500 ml-1">
                <TrashIcon size={12} />
              </button>
            </div>
          ))}
          {(!profile?.skills || profile.skills.length === 0) && <p className="text-sm text-gray-400">No skills added yet</p>}
        </div>
      </Section>

      {/* Education */}
      <Section title="Education" onAdd={() => setShowAddEdu(v => !v)}>
        {showAddEdu && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2">
            <input value={newEdu.degree} onChange={e => setNewEdu(d => ({ ...d, degree: e.target.value }))} placeholder="Degree*" className="input-field text-sm" />
            <input value={newEdu.institution} onChange={e => setNewEdu(d => ({ ...d, institution: e.target.value }))} placeholder="Institution*" className="input-field text-sm" />
            <input value={newEdu.field_of_study} onChange={e => setNewEdu(d => ({ ...d, field_of_study: e.target.value }))} placeholder="Field of Study" className="input-field text-sm" />
            <input value={newEdu.start_year} onChange={e => setNewEdu(d => ({ ...d, start_year: e.target.value }))} placeholder="Start Year" className="input-field text-sm" />
            <input value={newEdu.end_year} onChange={e => setNewEdu(d => ({ ...d, end_year: e.target.value }))} placeholder="End Year" className="input-field text-sm" />
            <button onClick={addEducation} className="btn-primary text-sm col-span-2">Add Education</button>
          </div>
        )}
        {profile?.education?.map(e => (
          <div key={e.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl mb-2">
            <div>
              <p className="font-medium text-sm text-gray-900">{e.degree}</p>
              <p className="text-xs text-gray-600">{e.institution} {e.field_of_study ? `• ${e.field_of_study}` : ''}</p>
              <p className="text-xs text-gray-400">{e.start_year} - {e.end_year || 'Present'}</p>
            </div>
            <button onClick={() => deleteEducation(e.id)} className="text-gray-300 hover:text-red-500"><TrashIcon size={14} /></button>
          </div>
        ))}
        {(!profile?.education || profile.education.length === 0) && !showAddEdu && <p className="text-sm text-gray-400">No education added yet</p>}
      </Section>

      {/* Experience */}
      <Section title="Work Experience" onAdd={() => setShowAddExp(v => !v)}>
        {showAddExp && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2">
            <input value={newExp.job_title} onChange={e => setNewExp(x => ({ ...x, job_title: e.target.value }))} placeholder="Job Title*" className="input-field text-sm" />
            <input value={newExp.company} onChange={e => setNewExp(x => ({ ...x, company: e.target.value }))} placeholder="Company*" className="input-field text-sm" />
            <input value={newExp.location} onChange={e => setNewExp(x => ({ ...x, location: e.target.value }))} placeholder="Location" className="input-field text-sm" />
            <input value={newExp.start_date} onChange={e => setNewExp(x => ({ ...x, start_date: e.target.value }))} placeholder="Start (YYYY-MM)" className="input-field text-sm" />
            <input value={newExp.end_date} onChange={e => setNewExp(x => ({ ...x, end_date: e.target.value }))} placeholder="End Date" className="input-field text-sm" />
            <textarea value={newExp.description} onChange={e => setNewExp(x => ({ ...x, description: e.target.value }))} placeholder="Description" className="input-field text-sm col-span-2 resize-none" rows={2} />
            <button onClick={addExperience} className="btn-primary text-sm col-span-2">Add Experience</button>
          </div>
        )}
        {profile?.experience?.map(ex => (
          <div key={ex.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl mb-2">
            <div>
              <p className="font-medium text-sm text-gray-900">{ex.job_title}</p>
              <p className="text-xs text-gray-600">{ex.company}{ex.location ? ` • ${ex.location}` : ''}</p>
              <p className="text-xs text-gray-400">{ex.start_date} - {ex.is_current === 'true' ? 'Present' : ex.end_date || '—'}</p>
            </div>
            <button onClick={() => api.delete(`/profile/experience/${ex.id}`).then(fetchProfile)} className="text-gray-300 hover:text-red-500"><TrashIcon size={14} /></button>
          </div>
        ))}
        {(!profile?.experience || profile.experience.length === 0) && !showAddExp && <p className="text-sm text-gray-400">No experience added yet</p>}
      </Section>

      {/* Certifications */}
      <Section title="Certifications" onAdd={() => setShowAddCert(v => !v)}>
        {showAddCert && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2">
            <input value={newCert.name} onChange={e => setNewCert(c => ({ ...c, name: e.target.value }))} placeholder="Certification Name*" className="input-field text-sm col-span-2" />
            <input value={newCert.issuer} onChange={e => setNewCert(c => ({ ...c, issuer: e.target.value }))} placeholder="Issuer" className="input-field text-sm" />
            <input value={newCert.issue_date} onChange={e => setNewCert(c => ({ ...c, issue_date: e.target.value }))} placeholder="Issue Date (YYYY-MM)" className="input-field text-sm" />
            <button onClick={addCertification} className="btn-primary text-sm col-span-2">Add Certification</button>
          </div>
        )}
        {profile?.certifications?.map(c => (
          <div key={c.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl mb-2">
            <div>
              <p className="font-medium text-sm text-gray-900">{c.name}</p>
              {c.issuer && <p className="text-xs text-gray-500">{c.issuer}</p>}
            </div>
            <button onClick={() => api.delete(`/profile/certifications/${c.id}`).then(fetchProfile)} className="text-gray-300 hover:text-red-500"><TrashIcon size={14} /></button>
          </div>
        ))}
        {(!profile?.certifications || profile.certifications.length === 0) && !showAddCert && <p className="text-sm text-gray-400">No certifications added yet</p>}
      </Section>
    </div>
  )
}
