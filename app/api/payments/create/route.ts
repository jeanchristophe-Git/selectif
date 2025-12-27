import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { geniuspay } from "@/lib/geniuspay"

// POST - Créer un paiement pour un abonnement
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 })
    }

    const body = await req.json()
    const { plan, promoCode } = body

    // Valider le plan
    const validPlans = ["CANDIDATE_PREMIUM", "BUSINESS", "ENTERPRISE"]
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ message: "Plan invalide" }, { status: 400 })
    }

    // Récupérer le pricing depuis la BDD
    const pricing = await db.pricing.findUnique({
      where: { plan },
    })

    if (!pricing) {
      return NextResponse.json({ message: "Plan introuvable" }, { status: 404 })
    }

    let finalPrice = pricing.price
    let discount = 0

    // Appliquer le code promo si fourni
    if (promoCode) {
      const promo = await db.promoCode.findUnique({
        where: { code: promoCode },
      })

      if (promo && promo.isActive && promo.usageCount < promo.maxUsage) {
        const now = new Date()
        if (now >= promo.startDate && now <= promo.endDate) {
          discount = (pricing.price * promo.discountPercent) / 100
          finalPrice = pricing.price - discount

          console.log(`✅ Code promo appliqué: ${promoCode} (-${promo.discountPercent}%)`)
        }
      }
    }

    // Convertir en FCFA (arrondir à l'entier supérieur)
    // Minimum 100 FCFA requis par GeniusPay
    const amountInFCFA = Math.max(100, Math.ceil(finalPrice))

    // Créer le paiement avec GeniusPay
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const payment = await geniuspay.createPayment({
      amount: amountInFCFA,
      description: `Abonnement ${pricing.displayName} - Selectif`,
      customer_email: sessionUser.email,
      customer_name: sessionUser.name || undefined,
      success_url: `${appUrl}/dashboard/subscription?payment=success`,
      error_url: `${appUrl}/dashboard/subscription?payment=error`,
      metadata: {
        userId: sessionUser.id,
        plan: plan,
        promoCode: promoCode || null,
        discount: discount,
        originalPrice: pricing.price,
        finalPrice: finalPrice,
      },
    })

    // Sauvegarder la transaction dans la BDD
    await db.transaction.create({
      data: {
        userId: sessionUser.id,
        amount: finalPrice,
        currency: "FCFA",
        plan: plan,
        status: "PENDING",
        paymentReference: payment.reference,
        metadata: {
          geniuspayReference: payment.reference,
          promoCode: promoCode || null,
          discount: discount,
        },
      },
    })

    // Log dans l'audit
    await db.auditLog.create({
      data: {
        userId: sessionUser.id,
        action: "INITIATE_PAYMENT",
        entity: "TRANSACTION",
        entityId: payment.reference,
        metadata: {
          plan,
          amount: amountInFCFA,
          promoCode,
        },
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.checkout_url || payment.payment_url,
      reference: payment.reference,
      amount: amountInFCFA,
    })
  } catch (error) {
    console.error("Create payment error:", error)
    return NextResponse.json(
      {
        message: "Erreur lors de la création du paiement",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
