"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, Crown, Brain } from "lucide-react"
import { PLAN_LIMITS } from "@/lib/subscription"

interface PricingData {
  plan: string
  name: string
  price: number
  originalPrice?: number
  discount?: number
  promotionLabel?: string | null
  hasPromotion: boolean
}

interface PricingSectionProps {
  userType: "company" | "candidate"
}

export function PricingSection({ userType }: PricingSectionProps) {
  const [pricing, setPricing] = useState<PricingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await fetch("/api/pricing")
        if (response.ok) {
          const data = await response.json()
          setPricing(data.pricing)
        }
      } catch (error) {
        console.error("Error fetching pricing:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [])

  const getPriceForPlan = (plan: string) => {
    const priceData = pricing.find(p => p.plan === plan)
    return priceData || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {/* Plans Entreprises */}
      {userType === "company" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE */}
          <Card className="border-border bg-card hover:shadow-xl transition-all">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-16 h-16" />
              </div>
              <CardTitle className="text-2xl mb-2">Free</CardTitle>
              <CardDescription>Idéal pour démarrer</CardDescription>
              <div className="text-5xl font-bold mt-4">0€</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left text-muted-foreground mb-8">
                {PLAN_LIMITS.COMPANY_FREE.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 text-sm items-start">
                    <Check size={16} className="shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?type=company&plan=free">
                <Button variant="outline" className="w-full rounded-xl">
                  Commencer
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* BUSINESS */}
          {(() => {
            const businessPrice = getPriceForPlan("COMPANY_BUSINESS")
            return (
              <Card className="border-primary/50 bg-primary/5 hover:shadow-xl transition-all relative overflow-hidden scale-105">
                {businessPrice?.hasPromotion && businessPrice.promotionLabel && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground animate-pulse">
                    {businessPrice.promotionLabel}
                  </Badge>
                )}
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  POPULAIRE
                </Badge>
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <Zap className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary mb-2">Business</CardTitle>
                  <CardDescription>Pour les PME en croissance</CardDescription>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    {businessPrice?.hasPromotion ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="text-5xl font-bold text-primary">{businessPrice.price}€</div>
                          <div className="flex flex-col items-start">
                            <span className="text-2xl text-muted-foreground line-through">{businessPrice.originalPrice}€</span>
                            <Badge variant="secondary" className="text-xs">-{businessPrice.discount}%</Badge>
                          </div>
                        </div>
                        <span className="text-lg text-muted-foreground">/mois</span>
                      </>
                    ) : (
                      <div className="text-5xl font-bold">
                        {businessPrice?.price || 79}€<span className="text-lg text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-muted-foreground mb-8">
                    {PLAN_LIMITS.COMPANY_BUSINESS.features.map((feature, i) => (
                      <li key={i} className="flex gap-2 text-sm items-start">
                        <Check size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?type=company&plan=business">
                    <Button className="w-full rounded-xl">
                      Choisir Business
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })()}

          {/* ENTERPRISE */}
          {(() => {
            const enterprisePrice = getPriceForPlan("COMPANY_ENTERPRISE")
            return (
              <Card className="border-border bg-card hover:shadow-xl transition-all relative">
                {enterprisePrice?.hasPromotion && enterprisePrice.promotionLabel && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground animate-pulse">
                    {enterprisePrice.promotionLabel}
                  </Badge>
                )}
                <Badge variant="secondary" className="absolute top-4 right-4">Pro</Badge>
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <Crown className="w-16 h-16" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                  <CardDescription>Pour les grandes entreprises</CardDescription>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    {enterprisePrice?.hasPromotion ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="text-5xl font-bold">{enterprisePrice.price}€</div>
                          <div className="flex flex-col items-start">
                            <span className="text-2xl text-muted-foreground line-through">{enterprisePrice.originalPrice}€</span>
                            <Badge variant="secondary" className="text-xs">-{enterprisePrice.discount}%</Badge>
                          </div>
                        </div>
                        <span className="text-lg text-muted-foreground">/mois</span>
                      </>
                    ) : (
                      <div className="text-5xl font-bold">
                        {enterprisePrice?.price || 299}€<span className="text-lg text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-muted-foreground mb-8">
                    {PLAN_LIMITS.COMPANY_ENTERPRISE.features.map((feature, i) => (
                      <li key={i} className="flex gap-2 text-sm items-start">
                        <Check size={16} className="shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?type=company&plan=enterprise">
                    <Button variant="outline" className="w-full rounded-xl">
                      Contacter l'équipe
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })()}
        </div>
      )}

      {/* Plans Candidats */}
      {userType === "candidate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* GRATUIT */}
          <Card className="border-border bg-card hover:shadow-xl transition-all">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-16 h-16" />
              </div>
              <CardTitle className="text-2xl mb-2">Gratuit</CardTitle>
              <CardDescription>Accès basique aux offres</CardDescription>
              <div className="text-5xl font-bold mt-4">0€</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left text-muted-foreground mb-8">
                {PLAN_LIMITS.CANDIDATE_FREE.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 text-sm items-start">
                    <Check size={16} className="shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?type=candidate">
                <Button variant="outline" className="w-full rounded-xl">
                  S'inscrire gratuitement
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* PREMIUM */}
          {(() => {
            const premiumPrice = getPriceForPlan("CANDIDATE_PREMIUM")
            return (
              <Card className="border-primary/50 bg-primary/5 hover:shadow-xl transition-all relative scale-105">
                {premiumPrice?.hasPromotion && premiumPrice.promotionLabel && (
                  <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground animate-pulse">
                    {premiumPrice.promotionLabel}
                  </Badge>
                )}
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                  RECOMMANDÉ
                </Badge>
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-4">
                    <Brain className="w-16 h-16 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-primary mb-2">Premium</CardTitle>
                  <CardDescription>Démarquez-vous</CardDescription>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    {premiumPrice?.hasPromotion ? (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="text-5xl font-bold text-primary">{premiumPrice.price}€</div>
                          <div className="flex flex-col items-start">
                            <span className="text-2xl text-muted-foreground line-through">{premiumPrice.originalPrice}€</span>
                            <Badge variant="secondary" className="text-xs">-{premiumPrice.discount}%</Badge>
                          </div>
                        </div>
                        <span className="text-lg text-muted-foreground">/mois</span>
                      </>
                    ) : (
                      <div className="text-5xl font-bold">
                        {premiumPrice?.price || 19}€<span className="text-lg text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left text-muted-foreground mb-8">
                    {PLAN_LIMITS.CANDIDATE_PREMIUM.features.map((feature, i) => (
                      <li key={i} className="flex gap-2 text-sm items-start">
                        <Check size={16} className="text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register?type=candidate&plan=premium">
                    <Button className="w-full rounded-xl">
                      Passer à Premium
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })()}
        </div>
      )}
    </>
  )
}
