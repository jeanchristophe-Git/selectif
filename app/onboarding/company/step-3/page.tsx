"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingStepper } from "@/components/shared/onboarding-stepper"
import { Building2, MapPin, Globe, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface OnboardingData {
  companyName: string
  industry: string
  companySize: string
  location: string
  website: string
  description: string
}

export default function CompanyOnboardingStep3() {
  const router = useRouter()
  const [data, setData] = useState<OnboardingData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const step1Data = localStorage.getItem("onboarding_company_step1")
    const step2Data = localStorage.getItem("onboarding_company_step2")

    if (!step1Data || !step2Data) {
      toast.error("Données manquantes, retour à l'étape 1")
      router.push("/onboarding/company/step-1")
      return
    }

    const combined = {
      ...JSON.parse(step1Data),
      ...JSON.parse(step2Data),
    }
    setData(combined)
  }, [router])

  const handleSubmit = async () => {
    if (!data) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/onboarding/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la sauvegarde")
      }

      // Clear localStorage
      localStorage.removeItem("onboarding_company_step1")
      localStorage.removeItem("onboarding_company_step2")

      toast.success("Profil entreprise créé avec succès!")

      // Recharger la page pour mettre à jour la session
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Onboarding error:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push("/onboarding/company/step-2")
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Récapitulatif</h1>
        <p className="text-muted-foreground mt-2">
          Vérifiez vos informations avant de finaliser votre profil
        </p>
      </div>

      <OnboardingStepper
        currentStep={3}
        totalSteps={3}
        steps={[
          { label: "Informations" },
          { label: "Coordonnées" },
          { label: "Confirmation" },
        ]}
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nom de l'entreprise</p>
              <p className="font-medium">{data.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Secteur d'activité</p>
              <p className="font-medium">{data.industry}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taille de l'entreprise</p>
              <p className="font-medium">{data.companySize}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Coordonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Localisation</p>
              <p className="font-medium">{data.location}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Site web</p>
              <p className="font-medium">
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  {data.website}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{data.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={isSubmitting}
          className="flex-1"
        >
          Retour
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalisation...
            </>
          ) : (
            "Finaliser mon profil"
          )}
        </Button>
      </div>
    </div>
  )
}
