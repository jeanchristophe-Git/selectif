import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { updateDonorBadge } from "@/lib/donations"
import { createNotification } from "@/lib/notifications"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log("[Donations Webhook] Received:", body)

    // Verify webhook signature if needed
    // const signature = req.headers.get("x-geniuspay-signature")
    // if (!geniuspay.verifyWebhookSignature(JSON.stringify(body), signature, process.env.GENIUSPAY_WEBHOOK_SECRET)) {
    //   return NextResponse.json({ message: "Invalid signature" }, { status: 401 })
    // }

    const { event, data } = body

    if (event === "charge.succeeded" || event === "payment.success") {
      const { reference, status, amount, metadata } = data

      // Find donation by reference
      const donation = await db.donation.findFirst({
        where: {
          geniuspayReference: reference,
        },
      })

      if (!donation) {
        console.error("[Donations Webhook] Donation not found for reference:", reference)
        return NextResponse.json(
          { message: "Donation non trouvée" },
          { status: 404 }
        )
      }

      // Check if already processed
      if (donation.status === "COMPLETED") {
        console.log("[Donations Webhook] Already processed:", reference)
        return NextResponse.json({ message: "Already processed" })
      }

      // Update donation status
      await db.donation.update({
        where: { id: donation.id },
        data: {
          status: "COMPLETED",
          geniuspayStatus: status,
          completedAt: new Date(),
        },
      })

      // Get current subscription
      const subscription = await db.subscription.findUnique({
        where: { userId: donation.userId },
      })

      // Calculate new total donated
      const newTotalDonated = (subscription?.totalDonated || 0) + donation.amount

      // Update donor badge
      await updateDonorBadge(donation.userId, newTotalDonated)

      // Get updated subscription to see new badge
      const updatedSubscription = await db.subscription.findUnique({
        where: { userId: donation.userId },
      })

      // Create notification for user
      let notificationMessage = `Merci pour votre don de ${donation.amount} FCFA ! 💖`

      if (updatedSubscription?.donorBadge && !subscription?.donorBadge) {
        // New badge earned
        const badgeLabels: Record<string, string> = {
          SUPPORTER: "Supporter ❤️",
          GENEROUS: "Généreux Donateur ⭐",
          FOUNDING: "Founding Supporter 👑"
        }
        notificationMessage += ` Vous avez obtenu le badge ${badgeLabels[updatedSubscription.donorBadge] || updatedSubscription.donorBadge} !`
      }

      await createNotification({
        userId: donation.userId,
        type: "DONATION_SUCCESS",
        title: "Don reçu avec succès",
        message: notificationMessage,
        metadata: {
          donationId: donation.id,
          amount: donation.amount,
          badge: updatedSubscription?.donorBadge,
        },
      })

      console.log(`[Donations Webhook] Processed donation ${donation.id} - New total: ${newTotalDonated} FCFA - Badge: ${updatedSubscription?.donorBadge || "none"}`)

      return NextResponse.json({
        success: true,
        message: "Donation processed",
      })
    }

    if (event === "charge.failed" || event === "payment.failed") {
      const { reference } = data

      const donation = await db.donation.findFirst({
        where: { geniuspayReference: reference },
      })

      if (donation) {
        await db.donation.update({
          where: { id: donation.id },
          data: {
            status: "FAILED",
            geniuspayStatus: data.status,
          },
        })

        await createNotification({
          userId: donation.userId,
          type: "DONATION_FAILED",
          title: "Échec du don",
          message: "Votre don n'a pas pu être traité. Veuillez réessayer.",
          metadata: { donationId: donation.id },
        })
      }
    }

    return NextResponse.json({ message: "Webhook received" })
  } catch (error) {
    console.error("[Donations Webhook] Error:", error)
    return NextResponse.json(
      { message: "Webhook processing error" },
      { status: 500 }
    )
  }
}
