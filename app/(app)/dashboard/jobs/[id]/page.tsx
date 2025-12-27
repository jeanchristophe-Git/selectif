"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2,
  Share2,
  Eye,
  Users,
  Calendar,
  Briefcase,
  MapPin,
  DollarSign,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { FormattedText } from "@/components/formatted-text"

interface JobOffer {
  id: string
  title: string
  description: string
  requirements: string
  location: string | null
  jobType: string
  salaryRange: string | null
  interviewSlots: number
  status: string
  publicId: string
  viewCount: number
  publishedAt: string | null
  createdAt: string
  company: {
    companyName: string
    logo: string | null
  }
  _count: {
    applications: number
  }
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Temps plein",
  PART_TIME: "Temps partiel",
  CONTRACT: "Contrat",
  INTERNSHIP: "Stage",
  FREELANCE: "Freelance",
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publiée",
  CLOSED: "Fermée",
  ARCHIVED: "Archivée",
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobOffer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = job
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/apply/${job.publicId}`
    : ""

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`)
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setJob(data.job)
    } catch (error) {
      console.error("Job fetch error:", error)
      toast.error("Impossible de charger l'offre")
      router.push("/dashboard/jobs")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/jobs/${params.id}/publish`, {
        method: "POST",
      })
      if (!response.ok) throw new Error("Erreur lors de la publication")
      const data = await response.json()
      setJob(data.job)
      toast.success("Offre publiée avec succès!")
    } catch (error) {
      console.error("Publish error:", error)
      toast.error("Erreur lors de la publication")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast.success("Lien copié!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Erreur lors de la copie")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge variant={job.status === "PUBLISHED" ? "default" : "secondary"}>
              {STATUS_LABELS[job.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground">{job.company.companyName}</p>
        </div>
        {job.status === "DRAFT" && (
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : (
              "Publier l'offre"
            )}
          </Button>
        )}
      </div>

      {job.status === "PUBLISHED" && (
        <Card className="mb-6 border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Lien de candidature
            </CardTitle>
            <CardDescription>
              Partagez ce lien pour recevoir des candidatures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input value={publicUrl} readOnly className="pr-24" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="absolute right-1 top-1 h-7"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(publicUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{job._count.applications}</p>
                <p className="text-sm text-muted-foreground">Candidatures</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{job.viewCount}</p>
                <p className="text-sm text-muted-foreground">Vues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{job.interviewSlots}</p>
                <p className="text-sm text-muted-foreground">Slots entretien</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description du poste</CardTitle>
            </CardHeader>
            <CardContent>
              <FormattedText text={job.description} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exigences et compétences</CardTitle>
            </CardHeader>
            <CardContent>
              <FormattedText text={job.requirements} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Type de contrat</p>
                  <p className="text-sm text-muted-foreground">
                    {JOB_TYPE_LABELS[job.jobType]}
                  </p>
                </div>
              </div>

              {job.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Localisation</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
              )}

              {job.salaryRange && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Salaire</p>
                    <p className="text-sm text-muted-foreground">{job.salaryRange}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Créée le</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
