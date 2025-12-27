import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { geniuspay } from "@/lib/geniuspay"

// POST - Webhook GeniusPay pour recevoir les notifications de paiement
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-geniuspay-signature")
    const body = await req.text()

    // Vérifier la signature du webhook
    if (!signature || !process.env.GENIUSPAY_WEBHOOK_SECRET) {
      console.error("❌ Webhook signature missing or secret not configured")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const isValid = geniuspay.verifyWebhookSignature(
      body,
      signature,
      process.env.GENIUSPAY_WEBHOOK_SECRET
    )

    if (!isValid) {
      console.error("❌ Invalid webhook signature")
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 })
    }

    const event = JSON.parse(body)

    console.log(`📨 Webhook GeniusPay reçu: ${event.type}`)
    console.log("Payload:", event)

    // Traiter les différents types d'événements
    switch (event.type) {
      case "payment.success":
        await handlePaymentSuccess(event.data)
        break

      case "payment.failed":
        await handlePaymentFailed(event.data)
        break

      case "payment.cancelled":
        await handlePaymentCancelled(event.data)
        break

      case "payment.initiated":
        console.log("Payment initiated:", event.data.reference)
        break

      default:
        console.log(`⚠️  Unknown event type: ${event.type}`)
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

async function handlePaymentSuccess(paymentData: any) {
  const { reference, amount, metadata } = paymentData

  console.log(`✅ Paiement réussi: ${reference}`)

  // Récupérer la transaction
  const transaction = await db.transaction.findFirst({
    where: { paymentReference: reference },
    include: { user: true },
  })

  if (!transaction) {
    console.error(`❌ Transaction introuvable: ${reference}`)
    return
  }

  // Mise à jour de la transaction
  await db.transaction.update({
    where: { id: transaction.id },
    data: {
      status: "COMPLETED",
      paidAt: new Date(),
    },
  })

  // Créer ou mettre à jour l'abonnement
  const existingSubscription = await db.subscription.findUnique({
    where: { userId: transaction.userId },
  })

  const now = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 1) // 1 mois d'abonnement

  if (existingSubscription) {
    await db.subscription.update({
      where: { userId: transaction.userId },
      data: {
        plan: transaction.plan,
        status: "ACTIVE",
        startDate: now,
        endDate: endDate,
        autoRenew: false,
      },
    })
  } else {
    await db.subscription.create({
      data: {
        userId: transaction.userId,
        plan: transaction.plan,
        status: "ACTIVE",
        startDate: now,
        endDate: endDate,
        autoRenew: false,
      },
    })
  }

  // Incrémenter l'usage du code promo si utilisé
  if (metadata?.promoCode) {
    await db.promoCode.update({
      where: { code: metadata.promoCode },
      data: {
        usageCount: { increment: 1 },
      },
    })
  }

  // Log dans l'audit
  await db.auditLog.create({
    data: {
      userId: transaction.userId,
      action: "PAYMENT_SUCCESS",
      entity: "SUBSCRIPTION",
      entityId: transaction.id,
      metadata: {
        reference,
        amount,
        plan: transaction.plan,
      },
    },
  })

  console.log(`✅ Abonnement activé pour l'utilisateur ${transaction.userId}`)

  // TODO: Envoyer un email de confirmation
  // await sendEmail({
  //   to: transaction.user.email,
  //   subject: "Abonnement activé - Selectif",
  //   html: getSubscriptionActivatedEmail(...)
  // })
}

async function handlePaymentFailed(paymentData: any) {
  const { reference } = paymentData

  console.log(`❌ Paiement échoué: ${reference}`)

  const transaction = await db.transaction.findFirst({
    where: { paymentReference: reference },
  })

  if (!transaction) {
    console.error(`❌ Transaction introuvable: ${reference}`)
    return
  }

  await db.transaction.update({
    where: { id: transaction.id },
    data: { status: "FAILED" },
  })

  await db.auditLog.create({
    data: {
      userId: transaction.userId,
      action: "PAYMENT_FAILED",
      entity: "TRANSACTION",
      entityId: transaction.id,
      metadata: { reference },
    },
  })
}

async function handlePaymentCancelled(paymentData: any) {
  const { reference } = paymentData

  console.log(`⚠️  Paiement annulé: ${reference}`)

  const transaction = await db.transaction.findFirst({
    where: { paymentReference: reference },
  })

  if (!transaction) {
    console.error(`❌ Transaction introuvable: ${reference}`)
    return
  }

  await db.transaction.update({
    where: { id: transaction.id },
    data: { status: "CANCELLED" },
  })

  await db.auditLog.create({
    data: {
      userId: transaction.userId,
      action: "PAYMENT_CANCELLED",
      entity: "TRANSACTION",
      entityId: transaction.id,
      metadata: { reference },
    },
  })
}
