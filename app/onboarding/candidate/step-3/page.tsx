"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { OnboardingStepper } from "@/components/shared/onboarding-stepper"
import { useSessionZustand } from "@/lib/use-session-zustand"
import { toast } from "sonner"
import type { CandidateStep1Input, CandidateStep2Input } from "@/lib/validations/onboarding"

export default function CandidateOnboardingStep3() {
  const router = useRouter()
  const { user, loading } = useSessionZustand()
  const [step1Data, setStep1Data] = useState<CandidateStep1Input | null>(null)
  const [step2Data, setStep2Data] = useState<CandidateStep2Input | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user?.userType !== "CANDIDATE") {
      router.push("/dashboard")
      return
    }

    // Load data from localStorage
    const step1Raw = localStorage.getItem("onboarding_candidate_step1")
    const step2Raw = localStorage.getItem("onboarding_candidate_step2")

    if (!step1Raw || !step2Raw) {
      toast.error("Données manquantes. Veuillez recommencer.")
      router.push("/onboarding/candidate/step-1")
      return
    }

    setStep1Data(JSON.parse(step1Raw))
    setStep2Data(JSON.parse(step2Raw))
  }, [user, loading, router])

  const handleSubmit = async () => {
    if (!step1Data || !step2Data) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/onboarding/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...step1Data,
          ...step2Data,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la sauvegarde")
      }

      toast.success("Profil créé avec succès!")

      // Clear localStorage
      localStorage.removeItem("onboarding_candidate_step1")
      localStorage.removeItem("onboarding_candidate_step2")

      // Recharger la page pour mettre à jour la session
      window.location.href = "/dashboard"
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la sauvegarde")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push("/onboarding/candidate/step-2")
  }

  if (loading || !step1Data || !step2Data) {
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
          Étape 3/3 - Récapitulatif
        </CardDescription>
        <OnboardingStepper
          currentStep={3}
          totalSteps={3}
          steps={[
            { label: "Informations personnelles" },
            { label: "Profil professionnel" },
            { label: "Récapitulatif" }
          ]}
          className="mt-4"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Informations personnelles</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prénom:</span>
              <span className="font-medium">{step1Data.firstName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nom:</span>
              <span className="font-medium">{step1Data.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Téléphone:</span>
              <span className="font-medium">{step1Data.phone}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-3">Profil professionnel</h3>
          <div className="space-y-2 text-sm">
            {step2Data.linkedinUrl && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">LinkedIn:</span>
                <a
                  href={step2Data.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Voir le profil
                </a>
              </div>
            )}
            {step2Data.portfolioUrl && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Portfolio:</span>
                <a
                  href={step2Data.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Voir le portfolio
                </a>
              </div>
            )}
            {step2Data.bio && (
              <div>
                <span className="text-muted-foreground">Bio:</span>
                <p className="mt-1 text-foreground">{step2Data.bio}</p>
              </div>
            )}
            {!step2Data.linkedinUrl && !step2Data.portfolioUrl && !step2Data.bio && (
              <p className="text-muted-foreground italic">Aucune information professionnelle ajoutée</p>
            )}
          </div>
        </div>

        <div className="flex justify-between gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
            Retour
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création du profil..." : "Finaliser mon profil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
