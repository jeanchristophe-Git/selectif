"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, Building2, UserCircle, TrendingUp, MoreVertical, Search, Ban, CheckCircle, Trash2, Settings2, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AdminUsersPageSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface User {
  id: string
  email: string
  name: string | null
  userType: string
  role: string
  emailVerified: boolean
  suspended?: boolean
  createdAt: string
  subscription: {
    plan: string
    status: string
  } | null
  company: {
    companyName: string
  } | null
  candidate: {
    firstName: string
    lastName: string
  } | null
}

interface UserStats {
  total: number
  companies: number
  candidates: number
  activeRate: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const showLoading = useMinimumLoading(loading, 800)
  const [search, setSearch] = useState("")
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedUserForPlanChange, setSelectedUserForPlanChange] = useState<User | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [search, userTypeFilter, page])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.users)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        ...(userTypeFilter !== "all" && { userType: userTypeFilter }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, userId: string, newPlanOrReason?: string) => {
    try {
      const payload: any = { action, userId }

      // Si c'est un changement de plan, on envoie newPlan
      if (action === "changePlan") {
        payload.newPlan = newPlanOrReason
      } else {
        // Sinon c'est une raison (suspend, delete, etc.)
        payload.reason = newPlanOrReason
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || "Action effectuée avec succès")
        fetchUsers()
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de l'action")
      }
    } catch (error) {
      console.error("Error performing action:", error)
      toast.error("Erreur lors de l'action")
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      COMPANY_FREE: "bg-muted text-muted-foreground",
      COMPANY_BUSINESS: "bg-primary/10 text-primary",
      COMPANY_ENTERPRISE: "bg-secondary/10 text-secondary-foreground",
      CANDIDATE_FREE: "bg-muted text-muted-foreground",
      CANDIDATE_PREMIUM: "bg-accent/10 text-accent-foreground",
    }
    return colors[plan] || "bg-muted text-muted-foreground"
  }

  const handleExport = () => {
    window.open("/api/admin/export/users", "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Utilisateurs</h1>
          <p className="text-muted-foreground mt-1">Gérez les utilisateurs de la plateforme</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total utilisateurs</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.total || 0}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.companies || 0}</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Candidats</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.candidates || 0}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <UserCircle className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux d'activité</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats?.activeRate || 0}%</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="COMPANY">Entreprises</SelectItem>
                <SelectItem value="CANDIDATE">Candidats</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showLoading ? (
            <div className="space-y-2">
              <AdminUsersPageSkeleton />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.company?.companyName ||
                              (user.candidate ? `${user.candidate.firstName} ${user.candidate.lastName}` : user.name || "Sans nom")}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.userType === "COMPANY" ? (
                            <>
                              <Building2 className="h-3 w-3 mr-1" />
                              Entreprise
                            </>
                          ) : (
                            <>
                              <UserCircle className="h-3 w-3 mr-1" />
                              Candidat
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.subscription ? (
                          <Badge className={getPlanBadge(user.subscription.plan)}>
                            {user.subscription.plan.replace(/_/g, " ")}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Aucun</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.suspended ? (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspendu
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {user.emailVerified ? (
                              <DropdownMenuItem
                                onClick={() => handleAction("suspend", user.id, "Action admin")}
                                className="text-orange-600"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Suspendre
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleAction("unsuspend", user.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Réactiver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUserForPlanChange(user)
                                setSelectedPlan(user.subscription?.plan || "")
                                setShowPlanChangeDialog(true)
                              }}
                            >
                              <Settings2 className="h-4 w-4 mr-2" />
                              Modifier le plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                toast.warning("Êtes-vous sûr de vouloir supprimer cet utilisateur ?", {
                                  action: {
                                    label: "Supprimer",
                                    onClick: () => handleAction("delete", user.id, "Suppression par admin")
                                  },
                                  cancel: {
                                    label: "Annuler",
                                    onClick: () => {}
                                  }
                                })
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Affichage de {Math.min((page - 1) * 20 + 1, total)} à {Math.min(page * 20, total)} sur {total} utilisateurs
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= total}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de changement de plan */}
      <Dialog open={showPlanChangeDialog} onOpenChange={setShowPlanChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le plan d'abonnement</DialogTitle>
            <DialogDescription>
              Choisissez le nouveau plan pour {selectedUserForPlanChange?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un plan" />
              </SelectTrigger>
              <SelectContent>
                {selectedUserForPlanChange?.userType === "COMPANY" ? (
                  <>
                    <SelectItem value="COMPANY_FREE">Free (5 offres)</SelectItem>
                    <SelectItem value="COMPANY_BUSINESS">Business (25 offres, 200 IA/mois)</SelectItem>
                    <SelectItem value="COMPANY_ENTERPRISE">Enterprise (Illimité)</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="CANDIDATE_FREE">Gratuit</SelectItem>
                    <SelectItem value="CANDIDATE_PREMIUM">Premium (CVs illimités, Recherche Internet)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanChangeDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (selectedPlan && selectedUserForPlanChange) {
                  handleAction("changePlan", selectedUserForPlanChange.id, selectedPlan)
                  setShowPlanChangeDialog(false)
                }
              }}
              disabled={!selectedPlan}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
