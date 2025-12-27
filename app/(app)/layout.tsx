"use client"

import { useSessionZustand } from "@/lib/use-session-zustand"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Briefcase,
  FileText,
  LogOut,
  Moon,
  Sun,
  Users,
  Search,
  User,
  LayoutDashboard,
  Bell,
  PenTool,
} from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SupportWidget } from "@/components/shared/support-widget"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSessionZustand()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router, pathname])

  useEffect(() => {
    if (!user) return

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
      })
      if (response.ok) {
        setUnreadCount(0)
        setNotifications(notifications.map(n => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Échec de la déconnexion")
      }

      toast.success("Déconnecté avec succès")
      router.push("/login")
    } catch (error) {
      toast.error("Erreur lors de la déconnexion")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isCompany = user.userType === "COMPANY"
  const initials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U"

  const companyNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Mes offres",
      href: "/dashboard/jobs",
      icon: Briefcase,
    },
    {
      title: "Candidatures",
      href: "/dashboard/applications",
      icon: Users,
    },
  ]

  const candidateNavItems = [
    {
      title: "Offres disponibles",
      href: "/dashboard/jobs-available",
      icon: Search,
    },
    {
      title: "Mes candidatures",
      href: "/dashboard/my-applications",
      icon: FileText,
    },
    {
      title: "CV Builder",
      href: "/dashboard/cv-builder",
      icon: PenTool,
    },
    {
      title: "Mon profil",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  const navItems = isCompany ? companyNavItems : candidateNavItems

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image
                  src="/logo.svg"
                  alt="Selectif Logo"
                  fill
                  className="object-contain dark:invert"
                />
              </div>
              <span className="text-xl font-semibold">Selectif</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* User menu at bottom */}
          <div className="border-t p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left text-sm">
                    <span className="font-medium truncate max-w-[140px]">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {isCompany ? "Entreprise" : "Candidat"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" side="top">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <User className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Mode clair</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Mode sombre</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-8">
            <div>
              <h2 className="text-lg font-semibold">
                {pathname === "/dashboard" && "Dashboard"}
                {pathname === "/dashboard/jobs" && "Mes offres"}
                {pathname === "/dashboard/jobs/new" && "Créer une offre"}
                {pathname.startsWith("/dashboard/jobs/") && pathname.includes("/edit") && "Modifier l'offre"}
                {pathname.startsWith("/dashboard/jobs/") && !pathname.includes("/edit") && !pathname.includes("/new") && "Détails de l'offre"}
                {pathname === "/dashboard/applications" && "Candidatures"}
                {pathname === "/dashboard/jobs-available" && "Offres disponibles"}
                {pathname === "/dashboard/my-applications" && "Mes candidatures"}
                {pathname === "/dashboard/cv-builder" && "CV Builder"}
                {pathname === "/dashboard/settings" && "Paramètres"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={markAllAsRead}>
                        Tout marquer lu
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <DropdownMenuItem
                          key={notif.id}
                          className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${!notif.read ? "bg-primary/5" : ""}`}
                        >
                          <div className="flex items-start justify-between w-full gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notif.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                            </div>
                            {!notif.read && (
                              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="container mx-auto py-8 px-8">{children}</div>
      </main>

      {/* Support Widget - accessible depuis toute l'app */}
      <SupportWidget />
    </div>
  )
}
