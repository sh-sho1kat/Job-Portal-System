import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ApplyPage } from '@/features/user/jobs/apply/apply-page'
import { LandingPage } from '@/features/landing/landing-page'
import { JobDetailPage } from '@/features/user/jobs/job-detail-page'
import { JobPage } from '@/features/user/jobs/job-page'
import { ProfilePage } from '@/features/user/profile/profile-page'
import { ApplicationsPage } from '@/features/user/applications/applications-page'
import { SavedJobsPage } from '@/features/user/saved/saved-jobs-page'
import { ResumesPage } from '@/features/user/resumes/resumes-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page; the jobs page is the post-login destination. */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs/:id/apply" element={<ApplyPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        {/* Bookmarks for the jobs workspace — shared store in features/user/saved. */}
        <Route path="/saved" element={<SavedJobsPage />} />
        {/* The candidate's resumes — resume-service mirror in features/user/resumes. */}
        <Route path="/resumes" element={<ResumesPage />} />
      </Routes>
    </BrowserRouter>
  )
}
