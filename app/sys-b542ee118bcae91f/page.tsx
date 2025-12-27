"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"
import { Shield } from "lucide-react"

const MAX_ATTEMPTS = 3
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()

  // Check lockout status on mount
  useEffect(() => {
    const lockoutData = localStorage.getItem("admin_lockout")
    if (lockoutData) {
      const lockoutTime = parseInt(lockoutData)
      if (Date.now() < lockoutTime) {
        setLockedUntil(lockoutTime)
      } else {
        localStorage.removeItem("admin_lockout")
        localStorage.removeItem("admin_attempts")
      }
    }

    const attemptsData = localStorage.getItem("admin_attempts")
    if (attemptsData) {
      setAttempts(parseInt(attemptsData))
    }
  }, [])

  // Update countdown timer
  useEffect(() => {
    if (!lockedUntil) return

    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now()
      if (remaining <= 0) {
        setLockedUntil(null)
        setAttempts(0)
        setTimeLeft(0)
        localStorage.removeItem("admin_lockout")
        localStorage.removeItem("admin_attempts")
      } else {
        setTimeLeft(Math.ceil(remaining / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockedUntil])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lockedUntil && Date.now() < lockedUntil) {
      toast.error("Trop de tentatives. Veuillez réessayer plus tard.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion")
      }

      // Vérifier si l'utilisateur est admin
      if (data.user.role !== "ADMIN") {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        localStorage.setItem("admin_attempts", newAttempts.toString())

        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_TIME
          setLockedUntil(lockoutTime)
          localStorage.setItem("admin_lockout", lockoutTime.toString())
          toast.error("Trop de tentatives échouées. Compte bloqué pendant 15 minutes.")
        } else {
          toast.error(`Accès refusé. ${MAX_ATTEMPTS - newAttempts} tentatives restantes.`)
        }

        await fetch("/api/auth/logout", { method: "POST" })
        setLoading(false)
        return
      }

      // Reset attempts on success
      localStorage.removeItem("admin_attempts")
      localStorage.removeItem("admin_lockout")

      toast.success("Connexion réussie !")
      router.push("/admin/dashboard")
    } catch (error: any) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem("admin_attempts", newAttempts.toString())

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_TIME
        setLockedUntil(lockoutTime)
        localStorage.setItem("admin_lockout", lockoutTime.toString())
        toast.error("Trop de tentatives échouées. Compte bloqué pendant 15 minutes.")
      } else {
        toast.error(`${error.message || "Erreur de connexion"}. ${MAX_ATTEMPTS - newAttempts} tentatives restantes.`)
      }

      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Admin Panel</CardTitle>
          <CardDescription>
            Connectez-vous avec vos identifiants administrateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@selectif.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {lockedUntil && timeLeft > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200 text-center">
                  Trop de tentatives échouées. Réessayez dans{" "}
                  <span className="font-bold">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                  </span>
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
              disabled={loading || (lockedUntil !== null && Date.now() < lockedUntil)}
            >
              {loading ? "Connexion..." : lockedUntil && Date.now() < lockedUntil ? "Bloqué" : "Se connecter"}
            </Button>
          </form>

          {/* No link to user login - security by obscurity */}
        </CardContent>
      </Card>
    </div>
  )
}
