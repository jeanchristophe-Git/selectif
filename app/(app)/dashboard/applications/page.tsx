"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Download, Eye, Mail, X, XCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { ApplicationsListSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface Application {
  id: string
  status: string
  aiScore: number | null
  aiAnalysis: string | null
  motivationLetter: string
  createdAt: string
  guestEmail: string | null
  guestFirstName: string | null
  guestLastName: string | null
  candidate: {
    firstName: string
    lastName: string
    phone: string | null
    linkedinUrl: string | null
    user: {
      email: string
    }
  } | null
  jobOffer: {
    id: string
    title: string
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const showLoading = useMinimumLoading(loading, 800)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [filterStatus])

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "ALL") {
        params.append("status", filterStatus)
      }

      const response = await fetch(`/api/applications?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }
      const data = await response.json()
      setApplications(data.applications)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Erreur lors du chargement des candidatures")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast.success("Statut mis à jour")
      fetchApplications()
      if (selectedApplication && selectedApplication.id === id) {
        const data = await response.json()
        setSelectedApplication(data.application)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAnalyze = async (id: string) => {
    try {
      toast.loading("Analyse en cours...", { id: "analyze" })
      const response = await fetch(`/api/applications/${id}/analyze`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to analyze")
      }

      toast.success("Analyse terminée", { id: "analyze" })
      fetchApplications()
      if (selectedApplication && selectedApplication.id === id) {
        const data = await response.json()
        setSelectedApplication(data.application)
      }
    } catch (error) {
      console.error("Error analyzing:", error)
      toast.error("Erreur lors de l'analyse", { id: "analyze" })
    }
  }

  const handleDownloadCV = (id: string) => {
    window.open(`/api/applications/${id}/cv`, "_blank")
  }

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline">Non analysé</Badge>
    if (score >= 80)
      return <Badge className="bg-green-600 hover:bg-green-700">{score}%</Badge>
    if (score >= 50)
      return <Badge className="bg-yellow-600 hover:bg-yellow-700">{score}%</Badge>
    return <Badge className="bg-red-600 hover:bg-red-700">{score}%</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>
      case "ANALYZING":
        return <Badge variant="outline">Analyse en cours</Badge>
      case "ANALYZED":
        return <Badge className="bg-blue-600 hover:bg-blue-700">Analysé</Badge>
      case "SHORTLISTED":
        return <Badge className="bg-green-600 hover:bg-green-700">Présélectionné</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejeté</Badge>
      case "CONTACTED":
        return <Badge className="bg-purple-600 hover:bg-purple-700">Contacté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCandidateName = (app: Application) => {
    if (app.candidate) {
      return `${app.candidate.firstName} ${app.candidate.lastName}`
    }
    if (app.guestFirstName && app.guestLastName) {
      return `${app.guestFirstName} ${app.guestLastName}`
    }
    return "Candidat anonyme"
  }

  const getCandidateEmail = (app: Application) => {
    if (app.candidate) {
      return app.candidate.user.email
    }
    return app.guestEmail || "Non renseigné"
  }

  if (showLoading) {
    return <ApplicationsListSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidatures</h1>
          <p className="text-muted-foreground">
            Gérez les candidatures reçues pour vos offres
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les candidatures</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="ANALYZED">Analysées</SelectItem>
            <SelectItem value="SHORTLISTED">Présélectionnées</SelectItem>
            <SelectItem value="REJECTED">Rejetées</SelectItem>
            <SelectItem value="CONTACTED">Contactées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aucune candidature</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {filterStatus === "ALL"
                ? "Vous n'avez pas encore reçu de candidatures"
                : `Aucune candidature avec le statut "${filterStatus}"`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{getCandidateName(app)}</CardTitle>
                    <CardDescription>{app.jobOffer.title}</CardDescription>
                    <p className="text-sm text-muted-foreground">{getCandidateEmail(app)}</p>
                  </div>
                  <div className="flex gap-2">
                    {getScoreBadge(app.aiScore)}
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Candidature reçue le{" "}
                    {format(new Date(app.createdAt), "dd MMM yyyy à HH:mm", {
                      locale: fr,
                    })}
                  </div>
                  <div className="flex gap-2">
                    {app.aiScore === null && app.status !== "ANALYZING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalyze(app.id)}
                      >
                        Analyser
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApplication(app)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog
        open={selectedApplication !== null}
        onOpenChange={() => setSelectedApplication(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>{getCandidateName(selectedApplication)}</DialogTitle>
                <DialogDescription>
                  Candidature pour {selectedApplication.jobOffer.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Informations de contact</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Email:</span>{" "}
                      {getCandidateEmail(selectedApplication)}
                    </p>
                    {selectedApplication.candidate?.phone && (
                      <p>
                        <span className="text-muted-foreground">Téléphone:</span>{" "}
                        {selectedApplication.candidate.phone}
                      </p>
                    )}
                    {selectedApplication.candidate?.linkedinUrl && (
                      <p>
                        <span className="text-muted-foreground">LinkedIn:</span>{" "}
                        <a
                          href={selectedApplication.candidate.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Voir le profil
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* AI Score */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Score IA</h3>
                  {getScoreBadge(selectedApplication.aiScore)}
                </div>

                {/* AI Analysis */}
                {selectedApplication.aiAnalysis && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Analyse IA</h3>
                    <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                      {selectedApplication.aiAnalysis}
                    </div>
                  </div>
                )}

                {/* Motivation Letter */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Lettre de motivation</h3>
                  <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap">
                    {selectedApplication.motivationLetter}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleDownloadCV(selectedApplication.id)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger CV
                  </Button>
                  {selectedApplication.status !== "SHORTLISTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(selectedApplication.id, "SHORTLISTED")
                      }
                      disabled={updatingStatus}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Présélectionner
                    </Button>
                  )}
                  {selectedApplication.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(selectedApplication.id, "REJECTED")
                      }
                      disabled={updatingStatus}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rejeter
                    </Button>
                  )}
                  {selectedApplication.status !== "CONTACTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateStatus(selectedApplication.id, "CONTACTED")
                      }
                      disabled={updatingStatus}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Marquer comme contacté
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
