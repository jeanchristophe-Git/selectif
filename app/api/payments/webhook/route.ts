import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-geniuspay-signature")

    // Vérifier la signature du webhook
    const expectedSignature = crypto
      .createHmac("sha256", process.env.GENIUSPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    console.log("GeniusPay webhook event:", event.type)

    // Gérer les événements de paiement
    if (event.type === "charge.succeeded") {
      const { metadata, amount } = event.data
      const { userId, plan } = metadata

      if (!userId || !plan) {
        console.error("Missing metadata in webhook:", metadata)
        return NextResponse.json({ message: "Missing metadata" }, { status: 400 })
      }

      // Mettre à jour ou créer l'abonnement
      const existingSubscription = await db.subscription.findUnique({
        where: { userId },
      })

      const newPeriodEnd = new Date()
      newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

      if (existingSubscription) {
        await db.subscription.update({
          where: { userId },
          data: {
            plan,
            status: "ACTIVE",
            currentPeriodEnd: newPeriodEnd,
          },
        })
      } else {
        // Définir les limites selon le plan
        let maxJobs = 5
        let maxAppsPerJob = 50
        let maxAIAnalysesMonth = 20
        let maxCVs = 1
        let alertsEnabled = false
        let cvBuilderEnabled = false

        if (plan === "COMPANY_BUSINESS") {
          maxJobs = 50
          maxAppsPerJob = 500
          maxAIAnalysesMonth = 200
        } else if (plan === "COMPANY_ENTERPRISE") {
          maxJobs = 999
          maxAppsPerJob = 9999
          maxAIAnalysesMonth = 9999
        } else if (plan === "CANDIDATE_PREMIUM") {
          maxCVs = 10
          alertsEnabled = true
          cvBuilderEnabled = true
        }

        await db.subscription.create({
          data: {
            userId,
            plan,
            status: "ACTIVE",
            maxJobs,
            maxAppsPerJob,
            maxAIAnalysesMonth,
            maxCVs,
            alertsEnabled,
            cvBuilderEnabled,
            currentPeriodEnd: newPeriodEnd,
          },
        })
      }

      console.log(`✅ Subscription activated for user ${userId} - Plan: ${plan}`)
    } else if (event.type === "charge.failed") {
      const { metadata } = event.data
      const { userId } = metadata

      if (userId) {
        // Marquer l'abonnement comme PAST_DUE
        await db.subscription.updateMany({
          where: { userId },
          data: { status: "PAST_DUE" },
        })

        console.log(`⚠️ Payment failed for user ${userId}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { message: "Webhook processing error" },
      { status: 500 }
    )
  }
}
