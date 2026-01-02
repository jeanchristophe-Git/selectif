"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, TrendingUp, Sparkles, Server, Database, Zap } from "lucide-react"
import { toast } from "sonner"
import { useSessionZustand } from "@/lib/use-session-zustand"
import { DonorBadge } from "@/components/ui/donor-badge"
import { DONOR_BADGES, DonorBadgeType } from "@/lib/donations"

interface DonationStats {
  totalDonors: number
  totalCollected: number
  thisMonthAmount: number
  thisMonthCount: number
}

interface RecentDonor {
  id: string
  userName: string
  badge: DonorBadgeType | null
  amount: number
  message: string | null
  completedAt: string
}

export default function DonatePage() {
  const { user } = useSessionZustand()
  const [amount, setAmount] = useState<string>("")
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [recentDonors, setRecentDonors] = useState<RecentDonor[]>([])

  // Objectif mensuel: 50 000 FCFA (~76€) pour couvrir les coûts serveurs
  const MONTHLY_GOAL = 50000

  useEffect(() => {
    fetchStats()
    fetchRecentDonors()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/donations/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchRecentDonors = async () => {
    try {
      const response = await fetch("/api/donations/recent")
      if (response.ok) {
        const data = await response.json()
        setRecentDonors(data.donors || [])
      }
    } catch (error) {
      console.error("Error fetching recent donors:", error)
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountNumber = parseFloat(amount)

    if (!amountNumber || amountNumber < 100) {
      toast.error("Le montant minimum est de 100 FCFA")
      return
    }

    if (!user) {
      toast.error("Vous devez être connecté pour faire un don")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/donations/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountNumber,
          message: message.trim() || undefined,
          isAnonymous,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Erreur lors de l'initialisation du don")
      }

      const data = await response.json()

      // Redirect to GeniusPay checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("URL de paiement non reçue")
      }
    } catch (error) {
      console.error("Donation error:", error)
      toast.error(error instanceof Error ? error.message : "Erreur lors du don")
      setLoading(false)
    }
  }

  const progressPercent = stats
    ? Math.min((stats.thisMonthAmount / MONTHLY_GOAL) * 100, 100)
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Soutenez Selectif
          <Heart className="inline-block ml-2 h-8 w-8 text-pink-600 fill-pink-600" />
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Selectif est 100% gratuit et le restera. Votre soutien nous aide à
          maintenir les serveurs et à continuer d'innover pour tous.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Donation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Faire un don</CardTitle>
            <CardDescription>
              Choisissez le montant que vous souhaitez donner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDonate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  step="100"
                  placeholder="Montant libre (minimum 100 FCFA)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  100 FCFA ≈ 0.15€ | 1000 FCFA ≈ 1.52€ | 5000 FCFA ≈ 7.62€
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Message optionnel
                </Label>
                <Textarea
                  id="message"
                  placeholder="Laissez un message de soutien..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked === true)}
                />
                <Label
                  htmlFor="anonymous"
                  className="text-sm font-normal cursor-pointer"
                >
                  Rester anonyme (votre nom ne sera pas affiché)
                </Label>
              </div>

              {/* Badge Preview */}
              {user?.subscription && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium mb-2">Badges donateurs:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>5 000 FCFA+</span>
                        <DonorBadge badge="SUPPORTER" showLabel={true} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>20 000 FCFA+</span>
                        <DonorBadge badge="GENEROUS" showLabel={true} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                    Redirection...
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Faire un don
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Paiement sécurisé via Wave, Orange Money, MTN Money
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Stats & Transparency */}
        <div className="space-y-6">
          {/* Monthly Goal */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Objectif de ce mois
                </CardTitle>
                <CardDescription>
                  {stats.thisMonthAmount.toLocaleString("fr-FR")} FCFA /{" "}
                  {MONTHLY_GOAL.toLocaleString("fr-FR")} FCFA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progressPercent} className="h-3" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {stats.thisMonthCount} donation{stats.thisMonthCount > 1 ? "s" : ""} ce mois
                </p>
              </CardContent>
            </Card>
          )}

          {/* Why Donate */}
          <Card>
            <CardHeader>
              <CardTitle>Pourquoi donner ?</CardTitle>
              <CardDescription>
                Votre soutien finance directement:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                  <Server className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Hébergement Vercel</p>
                  <p className="text-xs text-muted-foreground">
                    ~20 000 FCFA/mois pour les serveurs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                  <Database className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Base de données Neon</p>
                  <p className="text-xs text-muted-foreground">
                    ~15 000 FCFA/mois pour PostgreSQL
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">APIs (Groq IA, JSearch)</p>
                  <p className="text-xs text-muted-foreground">
                    ~10 000 FCFA/mois pour l'IA et la recherche
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Impact de la communauté
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total collecté</span>
                  <span className="text-lg font-bold">
                    {stats.totalCollected.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Donateurs</span>
                  <span className="text-lg font-bold">{stats.totalDonors}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Donors */}
      {recentDonors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nos généreux donateurs</CardTitle>
            <CardDescription>
              Merci à ceux qui soutiennent Selectif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonors.map((donor) => (
                <div
                  key={donor.id}
                  className="flex items-start justify-between pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{donor.userName}</p>
                      {donor.badge && <DonorBadge badge={donor.badge} showLabel={false} />}
                    </div>
                    {donor.message && (
                      <p className="text-sm text-muted-foreground italic">
                        "{donor.message}"
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-pink-600">
                      {donor.amount.toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donor.completedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
