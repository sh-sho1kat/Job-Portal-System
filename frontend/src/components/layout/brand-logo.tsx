import markDarkUrl from '@/assets/hirely-logo/hirely-mark-dark.svg'
import markLightUrl from '@/assets/hirely-logo/hirely-mark.svg'

/**
 * Hirely brand lockup: the geometric H mark plus the wordmark. Both marks
 * render and the `dark:` variant picks the surface-appropriate one — the
 * asset set ships a dedicated light-on-dark design (`hirely-mark-dark.svg`).
 */
export function BrandLogo() {
  return (
    <>
      <img src={markLightUrl} alt="" aria-hidden="true" className="size-9 shrink-0 dark:hidden" />
      <img src={markDarkUrl} alt="" aria-hidden="true" className="hidden size-9 shrink-0 dark:block" />
      <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">Hirely</span>
    </>
  )
}
