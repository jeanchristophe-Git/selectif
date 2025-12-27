"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companyStep2Schema, type CompanyStep2Input } from "@/lib/validations/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingStepper } from "@/components/shared/onboarding-stepper"
import { toast } from "sonner"

export default function CompanyOnboardingStep2() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyStep2Input>({
    resolver: zodResolver(companyStep2Schema),
  })

  const onSubmit = async (data: CompanyStep2Input) => {
    setIsLoading(true)
    try {
      localStorage.setItem("onboarding_company_step2", JSON.stringify(data))
      toast.success("Informations sauvegardées!")
      router.push("/onboarding/company/step-3")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <OnboardingStepper
        currentStep={2}
        totalSteps={3}
        steps={[
          { label: "Informations" },
          { label: "Coordonnées" },
          { label: "Confirmation" },
        ]}
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
          <CardDescription>
            Complétez votre profil avec vos coordonnées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input
                id="location"
                placeholder="Paris, France"
                {...register("location")}
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://monentreprise.com"
                {...register("website")}
                disabled={isLoading}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description de l'entreprise</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre entreprise en quelques mots..."
                rows={4}
                {...register("description")}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Maximum 500 caractères</p>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/onboarding/company/step-1")}
                disabled={isLoading}
              >
                Précédent
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sauvegarde..." : "Continuer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
