"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { candidateStep1Schema, type CandidateStep1Input } from "@/lib/validations/onboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingStepper } from "@/components/shared/onboarding-stepper"
import { useSessionZustand } from "@/lib/use-session-zustand"
import { toast } from "sonner"

export default function CandidateOnboardingStep1() {
  const router = useRouter()
  const { user, loading } = useSessionZustand()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateStep1Input>({
    resolver: zodResolver(candidateStep1Schema),
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user?.userType !== "CANDIDATE") {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const onSubmit = (data: CandidateStep1Input) => {
    try {
      localStorage.setItem("onboarding_candidate_step1", JSON.stringify(data))
      toast.success("Progression sauvegardée")
      router.push("/onboarding/candidate/step-2")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    }
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
          Étape 1/3 - Informations personnelles
        </CardDescription>
        <OnboardingStepper
          currentStep={1}
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                placeholder="Jean"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                placeholder="Dupont"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit">
              Continuer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
