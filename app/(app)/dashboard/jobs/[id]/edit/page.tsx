"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { jobOfferSchema, type JobOfferInput } from "@/lib/validations/job"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Briefcase, FileText, MapPin, Calendar, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Temps plein" },
  { value: "PART_TIME", label: "Temps partiel" },
  { value: "CONTRACT", label: "Contrat" },
  { value: "INTERNSHIP", label: "Stage" },
  { value: "FREELANCE", label: "Freelance" },
] as const

interface JobOffer {
  id: string
  title: string
  description: string
  requirements: string
  location: string | null
  salaryRange: string | null
  jobType: string
  interviewSlots: number
  status: string
}

export default function EditJobOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [jobId, setJobId] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobOfferInput>({
    resolver: zodResolver(jobOfferSchema),
  })

  const jobType = watch("jobType")

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setJobId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (!jobId) return

    const fetchJobOffer = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        if (!response.ok) {
          throw new Error("Offre non trouvée")
        }

        const data = await response.json()
        const job = data.job

        setJobOffer(job)

        // Pre-populate form
        setValue("title", job.title)
        setValue("description", job.description)
        setValue("requirements", job.requirements)
        setValue("location", job.location || "")
        setValue("salaryRange", job.salaryRange || "")
        setValue("jobType", job.jobType)
        setValue("interviewSlots", job.interviewSlots)
      } catch (error) {
        console.error("Fetch error:", error)
        toast.error("Erreur lors du chargement de l'offre")
        router.push("/dashboard/jobs")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobOffer()
  }, [jobId, router, setValue])

  const onSubmit = async (data: JobOfferInput) => {
    if (!jobId) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la modification")
      }

      const result = await response.json()

      if (result.message) {
        toast.success(result.message)
      } else {
        toast.success("Offre d'emploi modifiée avec succès!")
      }

      router.push(`/dashboard/jobs/${jobId}`)
    } catch (error) {
      console.error("Job update error:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isPublished = jobOffer?.status === "PUBLISHED"

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Modifier l'offre d'emploi</h1>
        <p className="text-muted-foreground mt-2">
          {jobOffer?.title}
        </p>
      </div>

      {isPublished && (
        <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Cette offre est publiée. Seules la description et la fourchette salariale peuvent être modifiées.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations générales
            </CardTitle>
            <CardDescription>
              Les détails principaux de votre offre d'emploi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre du poste *</Label>
              <Input
                id="title"
                placeholder="ex: Développeur Full-Stack Senior"
                {...register("title")}
                disabled={isPublished}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobType">Type de contrat *</Label>
                <Select
                  value={jobType}
                  onValueChange={(value) =>
                    setValue("jobType", value as JobOfferInput["jobType"])
                  }
                  disabled={isPublished}
                >
                  <SelectTrigger id="jobType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jobType && (
                  <p className="text-sm text-destructive">{errors.jobType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localisation</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="ex: Paris, France (ou Remote)"
                    className="pl-9"
                    {...register("location")}
                    disabled={isPublished}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryRange">Fourchette salariale (optionnel)</Label>
              <Input
                id="salaryRange"
                placeholder="ex: 45K - 65K EUR annuel"
                {...register("salaryRange")}
              />
              {errors.salaryRange && (
                <p className="text-sm text-destructive">{errors.salaryRange.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description et exigences
            </CardTitle>
            <CardDescription>
              Décrivez le poste et les compétences recherchées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description du poste *</Label>
              <Textarea
                id="description"
                placeholder={`PRÉSENTATION DE L'ENTREPRISE
Nous sommes une startup SaaS innovante...

DESCRIPTION DU POSTE
Dans le cadre du renforcement de notre équipe...

Vos missions principales:
- Développer des fonctionnalités web et mobile
- Participer aux code reviews
- Collaborer avec l'équipe product`}
                rows={12}
                {...register("description")}
              />
              <p className="text-xs text-muted-foreground">
                💡 Utilisez des TITRES EN MAJUSCULES, des lignes se terminant par : pour les sous-titres, et des - pour les listes à puces
              </p>
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Exigences et compétences *</Label>
              <Textarea
                id="requirements"
                placeholder={`Compétences techniques requises:
- Diplôme Bac+5 en informatique
- 3+ ans d'expérience
- Maîtrise de React et TypeScript

Compétences appréciées:
- Connaissance de Next.js
- Contributions open-source`}
                rows={10}
                {...register("requirements")}
                disabled={isPublished}
              />
              <p className="text-xs text-muted-foreground">
                💡 Structurez avec des sous-titres (ligne se terminant par :) et des listes à puces (-)
              </p>
              {errors.requirements && (
                <p className="text-sm text-destructive">{errors.requirements.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Paramètres de recrutement
            </CardTitle>
            <CardDescription>
              Configurez les options de candidature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interviewSlots">
                Nombre de candidats à présélectionner
              </Label>
              <Input
                id="interviewSlots"
                type="number"
                min="1"
                max="50"
                {...register("interviewSlots", { valueAsNumber: true })}
                disabled={isPublished}
              />
              <p className="text-xs text-muted-foreground">
                L'IA sélectionnera les meilleurs candidats (entre 1 et 50)
              </p>
              {errors.interviewSlots && (
                <p className="text-sm text-destructive">{errors.interviewSlots.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Modification en cours...
              </>
            ) : (
              "Sauvegarder les modifications"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
