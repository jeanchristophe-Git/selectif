"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, Tag, Check } from "lucide-react"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan")

  const [promoCode, setPromoCode] = useState("")
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [creating, setCreating] = useState(false)
  const [pricing, setPricing] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!plan) {
      router.push("/dashboard")
      return
    }

    const fetchPricing = async () => {
      try {
        const response = await fetch(`/api/pricing?plan=${plan}`)
        if (response.ok) {
          const data = await response.json()
          setPricing(data)
        } else {
          toast.error("Plan introuvable")
          router.push("/dashboard")
        }
      } catch (error) {
        toast.error("Erreur lors du chargement du plan")
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [plan, router])

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Veuillez entrer un code promo")
      return
    }

    setApplyingPromo(true)

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setAppliedPromo(data)
        toast.success(`Code promo appliqué! -${data.discountPercent}%`)
      } else {
        toast.error(data.message || "Code promo invalide")
      }
    } catch (error) {
      toast.error("Erreur lors de la validation du code promo")
    } finally {
      setApplyingPromo(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!plan) return

    setCreating(true)

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan,
          promoCode: appliedPromo?.code || null,
        }),
      })

      const data = await response.json()

      if (response.ok && data.checkoutUrl) {
        // Rediriger vers la page de paiement GeniusPay
        window.location.href = data.checkoutUrl
      } else {
        toast.error(data.message || "Erreur lors de la création du paiement")
      }
    } catch (error) {
      toast.error("Erreur lors de la création du paiement")
    } finally {
      setCreating(false)
    }
  }

  if (loading || !pricing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const originalPrice = pricing.price
  const discount = appliedPromo ? (originalPrice * appliedPromo.discountPercent) / 100 : 0
  const finalPrice = originalPrice - discount

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Finaliser votre abonnement</h1>
        <p className="text-muted-foreground">
          Vous êtes sur le point de souscrire au plan <strong>{pricing.displayName}</strong>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Résumé de la commande */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé</CardTitle>
            <CardDescription>Détails de votre abonnement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <p className="font-semibold">{pricing.displayName}</p>
                <p className="text-sm text-muted-foreground">Abonnement mensuel</p>
              </div>
              <div className="text-right">
                {appliedPromo && (
                  <p className="text-sm text-muted-foreground line-through">
                    {originalPrice.toLocaleString()} FCFA
                  </p>
                )}
                <p className="font-bold text-lg">
                  {finalPrice.toLocaleString()} FCFA
                </p>
              </div>
            </div>

            {appliedPromo && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Tag className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Code promo: {appliedPromo.code}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    -{appliedPromo.discountPercent}% de réduction
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                  -{discount.toLocaleString()} FCFA
                </Badge>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total à payer</span>
                <span>{finalPrice.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="pt-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Paiement sécurisé via GeniusPay
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Activation immédiate après paiement
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Support Orange Money, Wave, MTN, Moov
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Code promo et paiement */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Code promo
              </CardTitle>
              <CardDescription>
                Vous avez un code promo? Entrez-le ici
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promo">Code promo</Label>
                <div className="flex gap-2">
                  <Input
                    id="promo"
                    placeholder="PROMO2025"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={!!appliedPromo || applyingPromo}
                  />
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!!appliedPromo || applyingPromo || !promoCode.trim()}
                    variant="outline"
                  >
                    {applyingPromo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : appliedPromo ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      "Appliquer"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement
              </CardTitle>
              <CardDescription>
                Procédez au paiement sécurisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleProceedToPayment}
                className="w-full"
                size="lg"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Procéder au paiement
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En cliquant sur "Procéder au paiement", vous serez redirigé vers notre partenaire
                de paiement sécurisé GeniusPay
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
