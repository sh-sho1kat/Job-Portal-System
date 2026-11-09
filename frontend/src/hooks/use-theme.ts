import { useCallback, useRef, useState } from 'react'

import { THEME_STORAGE_KEY } from '@/lib/constants'

export type Theme = 'light' | 'dark'

/** Must match --theme-switch-duration in src/index.css. */
const SLIDE_MS = 600
const REDUCED_SLIDE_MS = 150

function persist(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (private mode) — the choice just won't survive a reload.
  }
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Theme is owned by the .dark class on <html>. The initial value is set by the
 * pre-paint script in index.html (system preference or stored choice), so the
 * hook only needs to read the current state and toggle.
 *
 * While switching, a .theme-transition class is put on <html> so the whole
 * page crossfades in step with the switch's slide, and removed right after —
 * everyday hover/focus transitions are never affected.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const cleanupTimer = useRef<number | null>(null)

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      const root = document.documentElement
      root.classList.toggle('dark', next === 'dark')
      persist(next)

      // Crossfade window — rerun-safe on rapid clicks (previous timer cleared).
      root.classList.add('theme-transition')
      if (cleanupTimer.current !== null) {
        window.clearTimeout(cleanupTimer.current)
      }
      const duration = reducedMotion() ? REDUCED_SLIDE_MS : SLIDE_MS
      cleanupTimer.current = window.setTimeout(
        () => root.classList.remove('theme-transition'),
        duration + 50,
      )

      return next
    })
  }, [])

  return { theme, toggleTheme } as const
}
