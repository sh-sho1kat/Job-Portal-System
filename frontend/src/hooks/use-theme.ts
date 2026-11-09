import { useCallback, useState } from 'react'

import { THEME_STORAGE_KEY } from '@/lib/constants'

export type Theme = 'light' | 'dark'

function persist(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage unavailable (private mode) — the choice just won't survive a reload.
  }
}

/**
 * Theme is owned by the .dark class on <html>. The initial value is set by the
 * pre-paint script in index.html (system preference or stored choice), so the
 * hook only needs to read the current state and toggle.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      document.documentElement.classList.toggle('dark', next === 'dark')
      persist(next)
      return next
    })
  }, [])

  return { theme, toggleTheme } as const
}
