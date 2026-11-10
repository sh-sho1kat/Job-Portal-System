import { MarketingNavbar } from '@/components/layout/marketing-navbar'

import { LandingHero } from './components/landing-hero'

/** Public entry page — hero with search; signing in lands users on /jobs. */
export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingNavbar />
      <LandingHero />
    </div>
  )
}
