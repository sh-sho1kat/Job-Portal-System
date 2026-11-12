import { cn } from '@/lib/utils'

/**
 * Bengali taka sign (৳) — Hirely's currency marker. Rendered as text so it
 * matches the figures beside it (the icon set has no taka glyph).
 */
export function TakaMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn('inline-block font-bold leading-none', className)}>
      ৳
    </span>
  )
}
