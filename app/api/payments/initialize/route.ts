import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"

// Prix des plans en FCFA
const PLAN_PRICES = {
  COMPANY_BUSINESS: 50000, // 50,000 FCFA/mois
  COMPANY_ENTERPRISE: 150000, // 150,000 FCFA/mois
  CANDIDATE_PREMIUM: 5000, // 5,000 FCFA/mois
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 })
    }

    const { plan } = await req.json()

    if (!plan || !PLAN_PRICES[plan as keyof typeof PLAN_PRICES]) {
      return NextResponse.json({ message: "Plan invalide" }, { status: 400 })
    }

    const amount = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]

    // Initialiser le paiement avec GeniusPay
    const geniusPayResponse = await fetch("https://api.pay.genius.ci/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GENIUSPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "XOF",
        description: `Abonnement ${plan}`,
        customer: {
          email: sessionUser.email,
          name: sessionUser.name || sessionUser.email,
        },
        metadata: {
          userId: sessionUser.id,
          plan,
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/checkout/success`,
        webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
      }),
    })

    if (!geniusPayResponse.ok) {
      const error = await geniusPayResponse.json()
      console.error("GeniusPay error:", error)
      return NextResponse.json(
        { message: "Erreur lors de l'initialisation du paiement" },
        { status: 500 }
      )
    }

    const paymentData = await geniusPayResponse.json()

    return NextResponse.json({
      success: true,
      paymentUrl: paymentData.payment_url,
      reference: paymentData.reference,
    })
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'initialisation du paiement" },
      { status: 500 }
    )
  }
}
