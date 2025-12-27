"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Building2, Briefcase, FileText, TrendingUp, DollarSign, Bell, AlertCircle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { DashboardSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface Stats {
  users: {
    total: number
    companies: number
    candidates: number
    new7d: number
    new30d: number
    activeRate: number
  }
  jobs: {
    total: number
    published: number
    new30d: number
  }
  applications: {
    total: number
    new30d: number
    avgPerJob: number
  }
  subscriptions: {
    distribution: Record<string, number>
    mrr: number
    aiAnalysesMonth: number
  }
}

interface AdminNotification {
  id: string
  type: string
  title: string
  message: string
  severity: string
  read: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const showLoading = useMinimumLoading(loading, 800)

  useEffect(() => {
    fetchStats()
    fetchNotifications()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications.slice(0, 5))
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  if (showLoading) {
    return <DashboardSkeleton />
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">Erreur de chargement des statistiques</p>
      </div>
    )
  }

  const statCards = [
    {
      title: "Utilisateurs totaux",
      value: stats.users.total,
      change: `+${stats.users.new7d} cette semaine`,
      icon: Users,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Entreprises",
      value: stats.users.companies,
      change: `${stats.users.activeRate}% actifs`,
      icon: Building2,
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary-foreground",
    },
    {
      title: "Offres publiées",
      value: stats.jobs.published,
      change: `+${stats.jobs.new30d} ce mois`,
      icon: Briefcase,
      iconBg: "bg-accent/10",
      iconColor: "text-accent-foreground",
    },
    {
      title: "Candidatures",
      value: stats.applications.total,
      change: `${stats.applications.avgPerJob} par offre`,
      icon: FileText,
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground mt-1">Vue d'ensemble de la plateforme Selectif</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-2">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-lg`}>
                  <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MRR & Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenus Mensuels (MRR)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats.subscriptions.mrr.toFixed(0)}€
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Revenus récurrents mensuels
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Analyses IA ce mois</span>
                <span className="font-medium text-foreground">{stats.subscriptions.aiAnalysesMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribution des Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.subscriptions.distribution).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      plan.includes("FREE") ? "bg-muted" :
                      plan.includes("BUSINESS") ? "bg-primary" :
                      plan.includes("ENTERPRISE") ? "bg-secondary" :
                      "bg-accent"
                    }`} />
                    <span className="text-sm font-medium text-foreground">{plan.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-accent/10 rounded-lg border border-border">
                <div className="h-2 w-2 bg-primary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Nouveaux utilisateurs (7j)</p>
                  <p className="text-xs text-muted-foreground">+{stats.users.new7d} inscrits</p>
                </div>
                <span className="text-sm font-bold text-primary">+{stats.users.new7d}</span>
              </div>

              <div className="flex items-center gap-4 p-3 bg-accent/10 rounded-lg border border-border">
                <div className="h-2 w-2 bg-secondary rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Nouvelles offres (30j)</p>
                  <p className="text-xs text-muted-foreground">Offres publiées</p>
                </div>
                <span className="text-sm font-bold text-secondary-foreground">+{stats.jobs.new30d}</span>
              </div>

              <div className="flex items-center gap-4 p-3 bg-accent/10 rounded-lg border border-border">
                <div className="h-2 w-2 bg-accent rounded-full" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Nouvelles candidatures (30j)</p>
                  <p className="text-xs text-muted-foreground">Candidatures reçues</p>
                </div>
                <span className="text-sm font-bold text-accent-foreground">+{stats.applications.new30d}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Admin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
              )}
            </CardTitle>
            <Link href="/admin/logs">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      notif.read ? "bg-card border-border" : "bg-accent/10 border-primary/20"
                    }`}
                  >
                    <div className="mt-0.5">
                      {notif.severity === "CRITICAL" ? (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      ) : notif.severity === "WARNING" ? (
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Gérer les utilisateurs</p>
                  <p className="text-xs text-muted-foreground">Suspendre, modifier, supprimer</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/marketing">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <DollarSign className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Campagnes email</p>
                  <p className="text-xs text-muted-foreground">Envoyer des communications</p>
                </div>
              </Button>
            </Link>
            <Link href="/admin/logs">
              <Button variant="outline" className="w-full justify-start gap-2 h-auto py-4">
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Voir les logs</p>
                  <p className="text-xs text-muted-foreground">Audit trail complet</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
