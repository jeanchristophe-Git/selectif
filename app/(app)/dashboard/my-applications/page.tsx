"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, MapPin, Briefcase, Calendar, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ApplicationsListSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface Application {
  id: string
  status: string
  aiScore: number | null
  aiAnalysis: string | null
  createdAt: string
  jobOffer: {
    id: string
    title: string
    location: string | null
    jobType: string
    company: {
      companyName: string
      logo: string | null
    }
  }
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "En attente", variant: "secondary" },
  ANALYZING: { label: "Analyse en cours", variant: "default" },
  ANALYZED: { label: "Analysée", variant: "default" },
  SHORTLISTED: { label: "Présélectionné", variant: "default" },
  REJECTED: { label: "Rejetée", variant: "destructive" },
  CONTACTED: { label: "Contacté", variant: "default" },
  WITHDRAWN: { label: "Retirée", variant: "outline" },
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Temps plein",
  PART_TIME: "Temps partiel",
  CONTRACT: "Contrat",
  INTERNSHIP: "Stage",
  FREELANCE: "Freelance",
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const showLoading = useMinimumLoading(isLoading, 800)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/me/applications")

      if (!response.ok) {
        throw new Error("Erreur lors du chargement")
      }

      const data = await response.json()
      setApplications(data.applications)
    } catch (error) {
      console.error("Fetch applications error:", error)
      toast.error("Impossible de charger vos candidatures")
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600 dark:text-green-400"
    if (score >= 50) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  if (showLoading) {
    return <ApplicationsListSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mes candidatures</h1>
        <p className="text-muted-foreground">
          Suivez l'état de vos candidatures et consultez les retours de l'IA
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune candidature</h3>
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas encore postulé à des offres
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => {
            const statusInfo = STATUS_LABELS[application.status] || STATUS_LABELS.PENDING

            return (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {application.jobOffer.company.logo && (
                          <img
                            src={application.jobOffer.company.logo}
                            alt={application.jobOffer.company.companyName}
                            className="w-10 h-10 rounded object-cover border"
                          />
                        )}
                        <div>
                          <CardTitle className="text-xl">{application.jobOffer.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{application.jobOffer.company.companyName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>

                        <Badge variant="outline" className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {JOB_TYPE_LABELS[application.jobOffer.jobType]}
                        </Badge>

                        {application.jobOffer.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {application.jobOffer.location}
                          </Badge>
                        )}

                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(application.createdAt), "d MMM yyyy", { locale: fr })}
                        </Badge>
                      </div>
                    </div>

                    {application.aiScore !== null && (
                      <div className="flex flex-col items-center gap-1 ml-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Score IA</span>
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(application.aiScore)}`}>
                          {application.aiScore}
                        </div>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                {application.aiAnalysis && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Analyse de l'IA
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {application.aiAnalysis}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
