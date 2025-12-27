"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Eye, Activity } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Suivez les performances de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visites totales</p>
                <p className="text-2xl font-bold text-foreground mt-2">0</p>
                <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux d'engagement</p>
                <p className="text-2xl font-bold text-foreground mt-2">0%</p>
                <p className="text-xs text-muted-foreground mt-1">Non disponible</p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de conversion</p>
                <p className="text-2xl font-bold text-foreground mt-2">0%</p>
                <p className="text-xs text-muted-foreground mt-1">Non disponible</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps moyen</p>
                <p className="text-2xl font-bold text-foreground mt-2">0min</p>
                <p className="text-xs text-muted-foreground mt-1">Par session</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trafic par source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Données non disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Les statistiques de trafic seront affichées ici
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Croissance mensuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Données non disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Les graphiques de croissance seront affichés ici
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
