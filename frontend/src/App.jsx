import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Public pages
import Home from './pages/public/Home'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Jobs from './pages/public/Jobs'
import JobDetail from './pages/public/JobDetail'
import About from './pages/public/About'

// Job Seeker pages
import SeekerDashboard from './pages/seeker/Dashboard'
import SeekerProfile from './pages/seeker/Profile'
import SeekerResume from './pages/seeker/Resume'
import SeekerApplications from './pages/seeker/Applications'
import SeekerSavedJobs from './pages/seeker/SavedJobs'
import SeekerNotifications from './pages/seeker/Notifications'
import ResumeAnalysis from './pages/seeker/ResumeAnalysis'
import RecommendedJobs from './pages/seeker/RecommendedJobs'

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/Dashboard'
import RecruiterProfile from './pages/recruiter/Profile'
import PostJob from './pages/recruiter/PostJob'
import ManageJobs from './pages/recruiter/ManageJobs'
import Applicants from './pages/recruiter/Applicants'
import CandidateDetails from './pages/recruiter/CandidateDetails'
import RecruiterNotifications from './pages/recruiter/Notifications'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminJobs from './pages/admin/Jobs'
import AdminApplications from './pages/admin/Applications'

// Layout
import PublicLayout from './components/layout/PublicLayout'
import DashboardLayout from './components/layout/DashboardLayout'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Job Seeker routes */}
          <Route path="/seeker" element={
            <ProtectedRoute roles={['job_seeker']}>
              <DashboardLayout role="job_seeker" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SeekerDashboard />} />
            <Route path="profile" element={<SeekerProfile />} />
            <Route path="resume" element={<SeekerResume />} />
            <Route path="resume-analysis" element={<ResumeAnalysis />} />
            <Route path="recommended" element={<RecommendedJobs />} />
            <Route path="applications" element={<SeekerApplications />} />
            <Route path="saved-jobs" element={<SeekerSavedJobs />} />
            <Route path="notifications" element={<SeekerNotifications />} />
          </Route>

          {/* Recruiter routes */}
          <Route path="/recruiter" element={
            <ProtectedRoute roles={['recruiter']}>
              <DashboardLayout role="recruiter" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RecruiterDashboard />} />
            <Route path="profile" element={<RecruiterProfile />} />
            <Route path="post-job" element={<PostJob />} />
            <Route path="jobs" element={<ManageJobs />} />
            <Route path="applicants" element={<Applicants />} />
            <Route path="candidates/:id" element={<CandidateDetails />} />
            <Route path="notifications" element={<RecruiterNotifications />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="applications" element={<AdminApplications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
