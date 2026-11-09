import { HugeiconsIcon } from '@hugeicons/react'
import { MoonStarIcon, Sun02Icon } from '@hugeicons/core-free-icons'

import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

/**
 * Theme switch replica of the reference pen: a flat pill whose interior is
 * darkened by wide inset fills, with a raised 6.5rem knob (16rem × 7rem
 * track, 9.25rem travel, 600ms ease-out). Sun and moon sit inside the pill —
 * the active one prints on the knob, the idle one rests in the deep well.
 * Dark mode = knob right.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  const trackShadow = isDark
    ? 'shadow-[inset_0_0_7rem_7rem_rgb(0_0_0_/_0.30),inset_0_0.8rem_0.4rem_rgb(0_0_0_/_0.30),inset_0_3rem_1rem_rgb(0_0_0_/_0.25),0_-0.25rem_0.25rem_rgb(0_0_0_/_0.20),0_0.25rem_0.25rem_rgb(255_255_255_/_0.08)]'
    : 'shadow-[inset_0_0_7rem_7rem_rgb(0_0_0_/_0.10),inset_0_0.8rem_0.4rem_rgb(0_0_0_/_0.20),inset_0_3rem_1rem_rgb(0_0_0_/_0.10),0_-0.25rem_0.25rem_rgb(0_0_0_/_0.15),0_0.25rem_0.25rem_rgb(255_255_255_/_0.40)]'

  /* Solid colors on both sides — gradients can't crossfade, so swapping to a
     colored image would snap to its color while the underlying fade plays
     (the dark→light jump). The glossy read comes from the knob's white
     inset halo instead. */
  const knobBg = isDark
    ? 'bg-[#2e3543]'
    : 'bg-[var(--neu-surface-soft)]'

  const knobShadow = isDark
    ? 'shadow-[inset_0_0.25rem_0.25rem_rgb(255_255_255_/_0.08),inset_0_-0.25rem_0.25rem_rgb(0_0_0_/_0.20),0_0.6rem_0.4rem_rgb(0_0_0_/_0.50),0_1.25rem_1rem_rgb(0_0_0_/_0.50)]'
    : 'shadow-[inset_0_0.25rem_0.25rem_rgb(255_255_255_/_0.65),inset_0_-0.25rem_0.25rem_rgb(0_0_0_/_0.15),0_0.6rem_0.4rem_rgb(0_0_0_/_0.25),0_1.25rem_1rem_rgb(0_0_0_/_0.25)]'

  return (
    <span className="relative inline-block h-28 w-64 shrink-0 align-middle">
      {/* visually hidden input keeps native switch semantics + keyboard use.
          z-10 keeps it above the icons so clicks always land on the control. */}
      <input
        type="checkbox"
        role="switch"
        checked={isDark}
        onChange={toggleTheme}
        aria-label={label}
        className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0"
      />
      {/* well — the pen darkens the page color inside the pill; bg stays transparent */}
      <span
        aria-hidden="true"
        className={cn(
          'theme-switch-track absolute inset-0 rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-solid peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--ring)]',
          trackShadow,
        )}
      />
      {/* knob — 6.5rem disc, 4px inset, travels beneath the icons */}
      <span
        aria-hidden="true"
        className={cn(
          'theme-switch-knob absolute left-1 top-1 size-[6.5rem] rounded-full',
          isDark ? 'translate-x-[9.25rem]' : 'translate-x-0',
          knobBg,
          knobShadow,
        )}
      />
      {/* sun — 48px, centered on the left knob position (light: printed on the
          knob, dark: idle in the deep well) */}
      <HugeiconsIcon
        icon={Sun02Icon}
        aria-hidden="true"
        strokeWidth={1.8}
        className={cn(
          'absolute left-8 top-8 size-12 shrink-0',
          isDark ? 'text-muted-foreground/70' : 'text-foreground',
        )}
      />
      {/* moon — 48px, centered on the right knob position (dark: printed on
          the knob, light: idle in the deep well) */}
      <HugeiconsIcon
        icon={MoonStarIcon}
        aria-hidden="true"
        strokeWidth={1.8}
        className={cn(
          'absolute right-7 top-8 size-12 shrink-0',
          isDark ? 'text-foreground' : 'text-muted-foreground/70',
        )}
      />
    </span>
  )
}
