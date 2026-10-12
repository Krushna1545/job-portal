import React, { useState, useEffect } from 'react'
import { SaveIcon, EditIcon, BuildingIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editProfile, setEditProfile] = useState(false)
  const [editCompany, setEditCompany] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [companyForm, setCompanyForm] = useState({})

  const fetchProfile = () => {
    api.get('/profile').then(r => {
      setProfile(r.data)
      setProfileForm({ first_name: r.data.first_name, last_name: r.data.last_name, phone: r.data.phone || '', job_title: r.data.job_title || '' })
      if (r.data.company) {
        setCompanyForm({
          name: r.data.company.name || '', description: r.data.company.description || '',
          industry: r.data.company.industry || '', company_size: r.data.company.company_size || '',
          website: r.data.company.website || '', location: r.data.company.location || ''
        })
      }
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchProfile() }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      await api.put('/profile/recruiter', profileForm)
      toast.success('Profile updated!')
      setEditProfile(false)
      fetchProfile()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const saveCompany = async () => {
    setSaving(true)
    try {
      if (profile?.company) {
        await api.put('/profile/company', companyForm)
      } else {
        await api.post('/profile/company', companyForm)
      }
      toast.success('Company profile saved!')
      setEditCompany(false)
      fetchProfile()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      {/* Recruiter Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recruiter Profile</h2>
          <button onClick={() => setEditProfile(v => !v)} className="btn-secondary text-sm flex items-center gap-1.5">
            <EditIcon size={14} /> {editProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {editProfile ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'first_name', label: 'First Name' }, { key: 'last_name', label: 'Last Name' },
              { key: 'phone', label: 'Phone' }, { key: 'job_title', label: 'Job Title' }
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input value={profileForm[f.key] || ''} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field text-sm" />
              </div>
            ))}
            <div className="col-span-2">
              <button onClick={saveProfile} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                <SaveIcon size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">Name</p><p className="font-medium">{profile?.first_name} {profile?.last_name}</p></div>
            <div><p className="text-gray-500 text-xs">Email</p><p className="font-medium">{profile?.email}</p></div>
            <div><p className="text-gray-500 text-xs">Phone</p><p className="font-medium">{profile?.phone || '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Title</p><p className="font-medium">{profile?.job_title || '—'}</p></div>
          </div>
        )}
      </div>

      {/* Company Profile */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BuildingIcon size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-900">Company Profile</h2>
          </div>
          <button onClick={() => setEditCompany(v => !v)} className="btn-secondary text-sm flex items-center gap-1.5">
            <EditIcon size={14} /> {editCompany ? 'Cancel' : profile?.company ? 'Edit' : 'Add Company'}
          </button>
        </div>
        {editCompany ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Company Name', span: 2 },
              { key: 'description', label: 'Description', span: 2, textarea: true },
              { key: 'industry', label: 'Industry' }, { key: 'company_size', label: 'Company Size' },
              { key: 'website', label: 'Website' }, { key: 'location', label: 'Location' }
            ].map(f => (
              <div key={f.key} className={f.span === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                {f.textarea ? (
                  <textarea value={companyForm[f.key] || ''} onChange={e => setCompanyForm(c => ({ ...c, [f.key]: e.target.value }))} className="input-field text-sm resize-none" rows={3} />
                ) : (
                  <input value={companyForm[f.key] || ''} onChange={e => setCompanyForm(c => ({ ...c, [f.key]: e.target.value }))} className="input-field text-sm" />
                )}
              </div>
            ))}
            <div className="col-span-2">
              <button onClick={saveCompany} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                <SaveIcon size={14} /> {saving ? 'Saving...' : 'Save Company'}
              </button>
            </div>
          </div>
        ) : profile?.company ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-gray-500 text-xs">Name</p><p className="font-medium">{profile.company.name}</p></div>
            <div><p className="text-gray-500 text-xs">Industry</p><p className="font-medium">{profile.company.industry || '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Size</p><p className="font-medium">{profile.company.company_size || '—'}</p></div>
            <div><p className="text-gray-500 text-xs">Location</p><p className="font-medium">{profile.company.location || '—'}</p></div>
            {profile.company.description && (
              <div className="col-span-2"><p className="text-gray-500 text-xs">About</p><p className="font-medium">{profile.company.description}</p></div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No company profile. Click Edit to add one.</p>
        )}
      </div>
    </div>
  )
}
