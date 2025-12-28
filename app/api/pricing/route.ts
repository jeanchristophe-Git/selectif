import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// API publique pour récupérer les prix avec promotions actives
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const planFilter = searchParams.get("plan")

    // Récupérer toutes les promotions actives et valides
    const now = new Date()
    const activePromotions = await db.pricingPromotion.findMany({
      where: {
        active: true,
        OR: [
          {
            AND: [
              { validFrom: { lte: now } },
              { validUntil: { gte: now } }
            ]
          },
          {
            AND: [
              { validFrom: null },
              { validUntil: null }
            ]
          },
          {
            AND: [
              { validFrom: { lte: now } },
              { validUntil: null }
            ]
          },
          {
            AND: [
              { validFrom: null },
              { validUntil: { gte: now } }
            ]
          }
        ]
      }
    })

    // Créer un map des promotions par plan
    const promotionsByPlan = activePromotions.reduce((acc, promo) => {
      acc[promo.plan] = promo
      return acc
    }, {} as Record<string, any>)

    // Prix de base pour chaque plan
    const basePricing = {
      COMPANY_FREE: { price: 0, name: "Gratuit Entreprise", billingPeriod: "MONTHLY" },
      COMPANY_BUSINESS: { price: 79, name: "Business", billingPeriod: "MONTHLY" },
      COMPANY_ENTERPRISE: { price: 299, name: "Enterprise", billingPeriod: "MONTHLY" },
      CANDIDATE_FREE: { price: 0, name: "Gratuit", billingPeriod: "MONTHLY" },
      CANDIDATE_PREMIUM: { price: 19, name: "Premium", billingPeriod: "MONTHLY" },
    }

    // Appliquer les promotions
    const pricing = Object.entries(basePricing).map(([plan, data]) => {
      const promotion = promotionsByPlan[plan]

      if (promotion && data.price > 0) {
        const discountedPrice = data.price * (1 - promotion.discountPercent / 100)
        return {
          plan,
          ...data,
          originalPrice: data.price,
          price: Math.round(discountedPrice * 100) / 100,
          discount: promotion.discountPercent,
          promotionLabel: promotion.label,
          hasPromotion: true
        }
      }

      return {
        plan,
        ...data,
        hasPromotion: false
      }
    })

    // Si un plan spécifique est demandé, retourner uniquement celui-ci
    if (planFilter) {
      const planData = pricing.find(p => p.plan === planFilter)
      if (!planData) {
        return NextResponse.json({ message: "Plan introuvable" }, { status: 404 })
      }
      return NextResponse.json({
        plan: planData.plan,
        displayName: planData.name,
        price: planData.price,
        originalPrice: 'originalPrice' in planData ? planData.originalPrice : planData.price,
        hasPromotion: planData.hasPromotion,
        billingPeriod: planData.billingPeriod,
      })
    }

    return NextResponse.json({ pricing })
  } catch (error) {
    console.error("Get pricing error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des prix" },
      { status: 500 }
    )
  }
}
