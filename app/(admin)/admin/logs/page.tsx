"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, User, Briefcase, FileText, Shield, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AuditLog {
  id: string
  userId: string | null
  action: string
  entity: string
  entityId: string
  metadata: any
  ipAddress: string | null
  createdAt: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [entityFilter, setEntityFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  useEffect(() => {
    fetchLogs()
  }, [entityFilter, actionFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: "100",
        ...(entityFilter !== "all" && { entity: entityFilter }),
        ...(actionFilter !== "all" && { action: actionFilter }),
      })

      const response = await fetch(`/api/admin/logs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, { color: string; label: string }> = {
      CREATE: { color: "bg-green-500/10 text-green-600 border-green-600", label: "Création" },
      UPDATE: { color: "bg-blue-500/10 text-blue-600 border-blue-600", label: "Mise à jour" },
      DELETE: { color: "bg-red-500/10 text-red-600 border-red-600", label: "Suppression" },
      SUSPEND_USER: { color: "bg-orange-500/10 text-orange-600 border-orange-600", label: "Suspension" },
      UNSUSPEND_USER: { color: "bg-green-500/10 text-green-600 border-green-600", label: "Réactivation" },
      CHANGE_PLAN: { color: "bg-purple-500/10 text-purple-600 border-purple-600", label: "Changement plan" },
      DELETE_USER: { color: "bg-red-500/10 text-red-600 border-red-600", label: "Suppr. utilisateur" },
    }
    const config = colors[action] || { color: "bg-muted text-muted-foreground border-border", label: action }
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>
  }

  const getEntityIcon = (entity: string) => {
    const icons: Record<string, any> = {
      USER: User,
      JOB: Briefcase,
      APPLICATION: FileText,
      ADMIN: Shield,
    }
    const Icon = icons[entity] || Activity
    return <Icon className="h-4 w-4" />
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return "À l'instant"
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`
    return `Il y a ${Math.floor(seconds / 86400)}j`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Logs d'activité</h1>
        <p className="text-muted-foreground mt-1">Historique de toutes les actions admin</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Entité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les entités</SelectItem>
                <SelectItem value="USER">Utilisateurs</SelectItem>
                <SelectItem value="JOB">Offres d'emploi</SelectItem>
                <SelectItem value="APPLICATION">Candidatures</SelectItem>
                <SelectItem value="ADMIN">Administration</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les actions</SelectItem>
                <SelectItem value="CREATE">Création</SelectItem>
                <SelectItem value="UPDATE">Mise à jour</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
                <SelectItem value="SUSPEND_USER">Suspension</SelectItem>
                <SelectItem value="CHANGE_PLAN">Changement plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline des événements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun log</h3>
              <p className="text-sm text-muted-foreground">
                Les logs d'activité apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
                    {getEntityIcon(log.entity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(log.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-foreground">
                      <span className="font-medium">{log.entity}</span>
                      {" - "}
                      <span className="text-muted-foreground">ID: {log.entityId.slice(0, 8)}...</span>
                    </p>

                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 p-2 rounded bg-muted/50 border border-border">
                        <p className="text-xs font-mono text-muted-foreground">
                          {JSON.stringify(log.metadata, null, 2)}
                        </p>
                      </div>
                    )}

                    {log.ipAddress && (
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
