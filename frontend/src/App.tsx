import { ThemeToggle } from '@/components/theme-toggle'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-foreground">
      <h1 className="text-3xl font-semibold tracking-tight">Job Portal</h1>
      <p className="text-sm text-muted-foreground">Fresh start — the build begins here.</p>
      <ThemeToggle />
    </div>
  )
}
