"use client"

import { useState } from "react"
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
import { Loader2, Briefcase, FileText, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Temps plein" },
  { value: "PART_TIME", label: "Temps partiel" },
  { value: "CONTRACT", label: "Contrat" },
  { value: "INTERNSHIP", label: "Stage" },
  { value: "FREELANCE", label: "Freelance" },
] as const

export default function NewJobOfferPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobOfferInput>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      jobType: "FULL_TIME",
      interviewSlots: 5,
    },
  })

  const jobType = watch("jobType")

  const onSubmit = async (data: JobOfferInput) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la création")
      }

      const result = await response.json()
      toast.success("Offre d'emploi créée avec succès!")
      router.push(`/dashboard/jobs/${result.job.id}`)
    } catch (error) {
      console.error("Job creation error:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Créer une offre d'emploi</h1>
        <p className="text-muted-foreground mt-2">
          Remplissez les informations pour publier votre offre
        </p>
      </div>

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
- Collaborer avec l'équipe product

Votre environnement de travail:
- Stack: React, Next.js, TypeScript
- Équipe: 5 développeurs
- Outils: GitHub, Jira, Slack`}
                rows={12}
                {...register("description")}
              />
              <p className="text-xs text-muted-foreground">
                💡 Astuce: Utilisez des TITRES EN MAJUSCULES, des lignes se terminant par : pour les sous-titres, et des - pour les listes à puces. Le formatage sera automatique !
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
- 3+ ans d'expérience en développement web
- Maîtrise de React et TypeScript
- Expérience avec les APIs REST

Compétences appréciées:
- Connaissance de Next.js
- Expérience en architecture microservices
- Contributions open-source

Soft Skills:
- Excellent communication
- Esprit d'équipe
- Autonomie et prise d'initiative`}
                rows={10}
                {...register("requirements")}
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
                Création en cours...
              </>
            ) : (
              "Créer l'offre (brouillon)"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
