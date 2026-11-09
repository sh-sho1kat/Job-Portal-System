import { HugeiconsIcon } from '@hugeicons/react'
import { Moon02Icon, Sun02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Button
      variant="default"
      size="icon"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
    >
      <HugeiconsIcon icon={isDark ? Sun02Icon : Moon02Icon} />
    </Button>
  )
}
