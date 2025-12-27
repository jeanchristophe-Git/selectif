import { ThemeToggle } from "@/components/shared/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle in top right */}
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Centered content */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
