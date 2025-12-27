"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { candidateStep2Schema, type CandidateStep2Input } from "@/lib/validations/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingStepper } from "@/components/shared/onboarding-stepper"
import { useSessionZustand } from "@/lib/use-session-zustand"
import { toast } from "sonner"

export default function CandidateOnboardingStep2() {
  const router = useRouter()
  const { user, loading } = useSessionZustand()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateStep2Input>({
    resolver: zodResolver(candidateStep2Schema),
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user?.userType !== "CANDIDATE") {
      router.push("/dashboard")
    }

    // Verify step 1 is completed
    const step1Data = localStorage.getItem("onboarding_candidate_step1")
    if (!step1Data) {
      router.push("/onboarding/candidate/step-1")
    }
  }, [user, loading, router])

  const onSubmit = (data: CandidateStep2Input) => {
    try {
      localStorage.setItem("onboarding_candidate_step2", JSON.stringify(data))
      toast.success("Progression sauvegardée")
      router.push("/onboarding/candidate/step-3")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    }
  }

  const handleBack = () => {
    router.push("/onboarding/candidate/step-1")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user || user.userType !== "CANDIDATE") {
    return null
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Profil candidat</CardTitle>
        <CardDescription>
          Étape 2/3 - Profil professionnel
        </CardDescription>
        <OnboardingStepper
          currentStep={2}
          totalSteps={3}
          steps={[
            { label: "Informations personnelles" },
            { label: "Profil professionnel" },
            { label: "Récapitulatif" }
          ]}
          className="mt-4"
        />
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn (optionnel)</Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/votre-profil"
              {...register("linkedinUrl")}
            />
            {errors.linkedinUrl && (
              <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio (optionnel)</Label>
            <Input
              id="portfolioUrl"
              type="url"
              placeholder="https://votre-portfolio.com"
              {...register("portfolioUrl")}
            />
            {errors.portfolioUrl && (
              <p className="text-sm text-destructive">{errors.portfolioUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Présentation (optionnel)</Label>
            <Textarea
              id="bio"
              placeholder="Parlez-nous de vous, vos compétences, vos objectifs..."
              rows={5}
              maxLength={500}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Maximum 500 caractères
            </p>
          </div>

          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={handleBack}>
              Retour
            </Button>
            <Button type="submit">
              Continuer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
