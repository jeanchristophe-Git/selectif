"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="pt-12 pb-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative h-16 w-16">
              <Image
                src="/logo.svg"
                alt="Selectif Logo"
                fill
                className="object-contain dark:invert"
              />
            </div>
          </div>

          {/* 404 Animation */}
          <div className="mb-6">
            <h1 className="text-9xl font-bold text-primary/20 mb-2">404</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Search className="h-5 w-5 animate-pulse" />
              <p className="text-lg">Page introuvable</p>
            </div>
          </div>

          {/* Message */}
          <div className="max-w-md mx-auto mb-8 space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              Oups ! Cette page n'existe pas
            </h2>
            <p className="text-muted-foreground">
              La page que vous recherchez a peut-être été supprimée, son nom a changé,
              ou elle est temporairement indisponible.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto gap-2"
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Accueil
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Besoin d'aide ? Voici quelques liens utiles :
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <Link href="/dashboard/jobs-available" className="text-primary hover:underline">
                Offres disponibles
              </Link>
              <Link href="/dashboard/settings" className="text-primary hover:underline">
                Paramètres
              </Link>
              <Link href="/dashboard" className="text-primary hover:underline">
                Dashboard
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
