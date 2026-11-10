import { MarketingNavbar } from '@/components/layout/marketing-navbar'

import { FeaturedJobs } from './components/featured-jobs'
import { LandingHero } from './components/landing-hero'
import { SiteFooter } from './components/site-footer'

/** Public entry page — hero with search, featured roles, footer. Signing in lands users on /jobs. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNavbar />
      <main className="flex-1">
        <LandingHero />
        <FeaturedJobs />
      </main>
      <SiteFooter />
    </div>
  )
}
