"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { companyStep1Schema, type CompanyStep1Input } from "@/lib/validations/onboarding"
import { useSessionZustand } from "@/lib/use-session-zustand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OnboardingStepper } from "@/components/shared/onboarding-stepper"
import { toast } from "sonner"

const INDUSTRIES = [
  "Technologie",
  "Finance",
  "Santé",
  "E-commerce",
  "Éducation",
  "Marketing",
  "Autre",
]

const COMPANY_SIZES = [
  "1-10 employés",
  "11-50 employés",
  "51-200 employés",
  "201-500 employés",
  "500+ employés",
]

export default function CompanyOnboardingStep1() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading } = useSessionZustand()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CompanyStep1Input>({
    resolver: zodResolver(companyStep1Schema),
  })

  // Pré-remplir le nom de l'entreprise avec le nom du user quand la session est chargée
  useEffect(() => {
    if (user?.name) {
      reset({
        companyName: user.name,
        industry: "",
        companySize: "",
      })
    }
  }, [user, reset])

  const onSubmit = async (data: CompanyStep1Input) => {
    setIsLoading(true)
    try {
      // Sauvegarder dans localStorage temporairement
      localStorage.setItem("onboarding_company_step1", JSON.stringify(data))

      toast.success("Informations sauvegardées!")
      router.push("/onboarding/company/step-2")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <OnboardingStepper
        currentStep={1}
        totalSteps={3}
        steps={[
          { label: "Informations" },
          { label: "Coordonnées" },
          { label: "Confirmation" },
        ]}
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>
            Commencez par nous parler de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de l'entreprise *</Label>
              <Input
                id="companyName"
                placeholder="Mon Entreprise"
                {...register("companyName")}
                disabled={isLoading}
              />
              {errors.companyName && (
                <p className="text-sm text-destructive">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Secteur d'activité *</Label>
              <Select onValueChange={(value) => setValue("industry", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un secteur" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-destructive">{errors.industry.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySize">Taille de l'entreprise *</Label>
              <Select onValueChange={(value) => setValue("companySize", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une taille" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.companySize && (
                <p className="text-sm text-destructive">{errors.companySize.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
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
