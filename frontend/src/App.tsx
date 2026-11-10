import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { LandingPage } from '@/features/landing/landing-page'
import { JobPage } from '@/features/jobs/job-page'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page; the jobs page is the post-login destination. */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobPage />} />
      </Routes>
    </BrowserRouter>
  )
}
