"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, Heart, Users, Server, Database, Zap, TrendingUp } from "lucide-react"

interface DonationStats {
  totalDonors: number
  totalCollected: number
  thisMonthAmount: number
  thisMonthCount: number
}

const MONTHLY_GOAL = 50000 // 50 000 FCFA (~76€) pour coûts serveurs

export function SupportSection() {
  const [stats, setStats] = useState<DonationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/donations/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching donation stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const progressPercent = stats
    ? Math.min((stats.thisMonthAmount / MONTHLY_GOAL) * 100, 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 dark:bg-pink-900/20 mb-4">
          <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
        </div>
        <h2 className="text-3xl font-bold mb-4">
          Selectif est 100% gratuit pour tous
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Toutes les fonctionnalités sont accessibles sans limite. Si Selectif vous aide,
          soutenez-nous pour maintenir les serveurs et continuer d'innover.
        </p>
      </div>

      {/* Features Grid - All Free */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950/10 dark:to-background">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Tout est gratuit</CardTitle>
            <CardDescription>Pour tout le monde, sans exception</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>Offres d'emploi illimitées</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>Candidatures illimitées</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>Analyses IA illimitées</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>Recherche Internet (JSearch)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>CV Builder IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="shrink-0 mt-0.5 text-green-600" />
                <span>Statistiques détaillées</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/10 dark:to-background">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Transparence totale</CardTitle>
            <CardDescription>Vos dons financent directement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Server size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <span>Hébergement Vercel (~20k FCFA/mois)</span>
              </li>
              <li className="flex items-start gap-2">
                <Database size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <span>Base de données Neon (~15k FCFA/mois)</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap size={16} className="shrink-0 mt-0.5 text-blue-600" />
                <span>APIs IA & JSearch (~10k FCFA/mois)</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-xs text-muted-foreground mb-1">Objectif mensuel</p>
              <p className="font-bold text-blue-600">50 000 FCFA / mois</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/10 dark:to-background">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <CardTitle className="text-xl">Impact communauté</CardTitle>
            <CardDescription>Grâce à votre générosité</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Ce mois</span>
                    <span className="text-sm font-bold text-pink-600">
                      {stats.thisMonthAmount.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.thisMonthCount} donation{stats.thisMonthCount > 1 ? "s" : ""} ce mois
                  </p>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total collecté</span>
                    <span className="font-bold">{stats.totalCollected.toLocaleString("fr-FR")} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Donateurs</span>
                    <span className="font-bold">{stats.totalDonors}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Soyez le premier à soutenir Selectif !
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <Button
          asChild
          size="lg"
          className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-6 text-lg"
        >
          <Link href="/donate">
            <Heart className="w-5 h-5 mr-2 fill-white" />
            Soutenir Selectif
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground mt-4">
          Paiement sécurisé via Wave, Orange Money, MTN Money · Montant libre · Pas d'engagement
        </p>
      </div>
    </div>
  )
}
