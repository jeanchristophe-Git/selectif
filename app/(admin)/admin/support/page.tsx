"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageCircle, Bug, HelpCircle, Lightbulb, Mail, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SupportTicketsSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface SupportTicket {
  id: string
  category: string
  subject: string
  description: string
  priority: string
  status: string
  createdAt: string
  user: {
    email: string
    name: string | null
    userType: string
  }
  currentUrl: string | null
  userAgent: string | null
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const showLoading = useMinimumLoading(loading, 800)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/support/tickets")
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BUG":
        return <Bug className="h-4 w-4" />
      case "HELP":
        return <HelpCircle className="h-4 w-4" />
      case "FEATURE":
        return <Lightbulb className="h-4 w-4" />
      case "CONTACT":
        return <Mail className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "BUG":
        return "Bug"
      case "HELP":
        return "Aide"
      case "FEATURE":
        return "Fonctionnalité"
      case "CONTACT":
        return "Contact"
      default:
        return category
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-600">Ouvert</Badge>
      case "IN_PROGRESS":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-600">En cours</Badge>
      case "RESOLVED":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600">Résolu</Badge>
      case "CLOSED":
        return <Badge variant="secondary">Fermé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      case "HIGH":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-600">Haute</Badge>
      case "NORMAL":
        return <Badge variant="outline">Normale</Badge>
      case "LOW":
        return <Badge variant="secondary">Basse</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false
    if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false
    return true
  })

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  }

  if (showLoading) {
    return <SupportTicketsSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support Client</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les tickets de support de vos utilisateurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Ouverts</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.open}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">En cours</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.inProgress}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Résolus</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tickets de support</CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="OPEN">Ouvert</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="RESOLVED">Résolu</SelectItem>
                  <SelectItem value="CLOSED">Fermé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="BUG">Bug</SelectItem>
                  <SelectItem value="HELP">Aide</SelectItem>
                  <SelectItem value="FEATURE">Fonctionnalité</SelectItem>
                  <SelectItem value="CONTACT">Contact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun ticket</h3>
              <p className="text-sm text-muted-foreground">
                Aucun ticket de support pour le moment
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(ticket.category)}
                        <span className="text-sm">{getCategoryLabel(ticket.category)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{ticket.user.name || "Sans nom"}</p>
                        <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog - Improved Horizontal Layout */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTicket && getCategoryIcon(selectedTicket.category)}
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.id.slice(0, 8)} • Créé le {selectedTicket && new Date(selectedTicket.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="grid grid-cols-3 gap-6 overflow-auto max-h-[calc(85vh-120px)]">
              {/* Colonne gauche - Infos principales */}
              <div className="col-span-2 space-y-4 pr-4">
                <div className="flex gap-2 flex-wrap">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <Badge variant="outline">
                    {getCategoryLabel(selectedTicket.category)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Description complète</h4>
                  <div className="rounded-lg border border-border p-4 bg-accent/20 max-h-[300px] overflow-y-auto">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                  </div>
                </div>

                {selectedTicket.currentUrl && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">URL de la page</h4>
                    <div className="rounded-lg border border-border bg-muted/50 p-3">
                      <code className="text-xs break-all">
                        {selectedTicket.currentUrl}
                      </code>
                    </div>
                  </div>
                )}

                {selectedTicket.userAgent && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Informations techniques</h4>
                    <div className="rounded-lg border border-border bg-muted/50 p-3">
                      <code className="text-xs break-all block">
                        {selectedTicket.userAgent}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* Colonne droite - Utilisateur et actions */}
              <div className="col-span-1 space-y-4 border-l pl-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Utilisateur</h4>
                  <div className="rounded-lg border border-border p-3 bg-accent/20">
                    <p className="text-sm font-medium">{selectedTicket.user.name || "Sans nom"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedTicket.user.email}</p>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {selectedTicket.user.userType === "COMPANY" ? "Entreprise" : "Candidat"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Actions rapides</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Répondre par email
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Changer le statut
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
                      Fermer le ticket
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Métadonnées</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>ID: {selectedTicket.id.slice(0, 12)}...</p>
                    <p>Créé: {new Date(selectedTicket.createdAt).toLocaleString("fr-FR")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
