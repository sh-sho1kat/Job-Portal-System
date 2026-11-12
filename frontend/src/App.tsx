import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ApplyPage } from '@/features/jobs/apply/apply-page'
import { LandingPage } from '@/features/landing/landing-page'
import { JobDetailPage } from '@/features/jobs/job-detail-page'
import { JobPage } from '@/features/jobs/job-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page; the jobs page is the post-login destination. */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs/:id/apply" element={<ApplyPage />} />
      </Routes>
    </BrowserRouter>
  )
}
