import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ApplyPage } from '@/features/jobs/apply/apply-page'
import { LandingPage } from '@/features/landing/landing-page'
import { JobDetailPage } from '@/features/jobs/job-detail-page'
import { JobPage } from '@/features/jobs/job-page'
import { ProfilePage } from '@/features/profile/profile-page'
import { ApplicationsPage } from '@/features/profile/my-applications-page'
import { ResumesPage } from '@/features/profile/my-resumes-page'
import { CompanyPage } from '@/features/profile/my-company-page'

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
        <Route path="/resumes" element={<ResumesPage />} />
        <Route path="/company" element={<CompanyPage />} />
      </Routes>
    </BrowserRouter>
  )
}
