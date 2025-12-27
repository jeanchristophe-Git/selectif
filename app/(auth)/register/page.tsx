"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerSchema, type RegisterInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Building2, User } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<"COMPANY" | "CANDIDATE" | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de la création du compte")
      }

      toast.success("Compte créé avec succès!")

      // Rediriger vers le dashboard
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypeSelect = (type: "COMPANY" | "CANDIDATE") => {
    setSelectedType(type)
    setValue("userType", type)
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
        <CardDescription>
          Rejoignez Selectif en tant qu'entreprise ou candidat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* User Type Selection */}
          <div className="space-y-2">
            <Label>Je suis...</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeSelect("COMPANY")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  selectedType === "COMPANY"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Building2 className="h-8 w-8" />
                <span className="font-medium">Entreprise</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect("CANDIDATE")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                  selectedType === "CANDIDATE"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User className="h-8 w-8" />
                <span className="font-medium">Candidat</span>
              </button>
            </div>
            {errors.userType && (
              <p className="text-sm text-destructive">{errors.userType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              {selectedType === "COMPANY" ? "Nom de l'entreprise" : "Nom complet"}
            </Label>
            <Input
              id="name"
              placeholder={selectedType === "COMPANY" ? "Mon Entreprise" : "Jean Dupont"}
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !selectedType}>
            {isLoading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Vous avez déjà un compte?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
