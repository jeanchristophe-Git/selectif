"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Briefcase, MoreVertical, Search, Archive, Trash2, CheckCircle, XCircle, Eye } from "lucide-react"

interface Job {
  id: string
  title: string
  status: string
  location: string | null
  jobType: string
  createdAt: string
  publishedAt: string | null
  viewCount: number
  company: {
    companyName: string
    user: {
      email: string
    }
  }
  _count: {
    applications: number
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchJobs()
  }, [search, statusFilter, page])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, jobId: string, reason?: string) => {
    try {
      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, jobId, reason }),
      })

      if (response.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error("Error performing action:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      DRAFT: { color: "bg-muted text-muted-foreground", label: "Brouillon" },
      PUBLISHED: { color: "bg-green-500/10 text-green-600 border-green-600", label: "Publiée" },
      CLOSED: { color: "bg-orange-500/10 text-orange-600 border-orange-600", label: "Fermée" },
      ARCHIVED: { color: "bg-muted text-muted-foreground border-border", label: "Archivée" },
    }
    const config = variants[status] || { color: "bg-muted", label: status }
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Offres d'emploi</h1>
        <p className="text-muted-foreground mt-1">Modérez et gérez les offres publiées</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total offres</p>
                <p className="text-2xl font-bold text-foreground mt-2">{total}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publiées</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {jobs.filter((j) => j.status === "PUBLISHED").length}
                </p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brouillons</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {jobs.filter((j) => j.status === "DRAFT").length}
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archivées</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {jobs.filter((j) => j.status === "ARCHIVED").length}
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Archive className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des offres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou entreprise..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="DRAFT">Brouillons</SelectItem>
                <SelectItem value="PUBLISHED">Publiées</SelectItem>
                <SelectItem value="CLOSED">Fermées</SelectItem>
                <SelectItem value="ARCHIVED">Archivées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Candidatures</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{job.company.companyName}</p>
                          <p className="text-xs text-muted-foreground">{job.company.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.jobType}</Badge>
                      </TableCell>
                      <TableCell>{job._count.applications}</TableCell>
                      <TableCell>{job.viewCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString("fr-FR")}
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
                            {job.status === "DRAFT" && (
                              <DropdownMenuItem
                                onClick={() => handleAction("publish", job.id)}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publier
                              </DropdownMenuItem>
                            )}
                            {job.status === "PUBLISHED" && (
                              <DropdownMenuItem
                                onClick={() => handleAction("close", job.id, "Fermée par admin")}
                                className="text-orange-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Fermer
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleAction("archive", job.id, "Archivée par admin")}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archiver
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm("Supprimer cette offre définitivement ?")) {
                                  handleAction("delete", job.id, "Suppression par admin")
                                }
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
                  Affichage de {Math.min((page - 1) * 20 + 1, total)} à {Math.min(page * 20, total)} sur {total} offres
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
    </div>
  )
}
