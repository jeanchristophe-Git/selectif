"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSessionZustand } from "@/lib/use-session-zustand"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, loading } = useSessionZustand()

  useEffect(() => {
    if (!loading && user) {
      // Rediriger vers le bon flux d'onboarding selon le type d'utilisateur
      if (user.userType === "COMPANY") {
        router.push("/onboarding/company/step-1")
      } else if (user.userType === "CANDIDATE") {
        router.push("/onboarding/candidate/step-1")
      }
    } else if (!loading && !user) {
      // Si pas d'utilisateur, rediriger vers login
      router.push("/login")
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirection vers l'onboarding...</p>
      </div>
    </div>
  )
}
