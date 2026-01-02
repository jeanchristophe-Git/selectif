import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { geniuspay } from "@/lib/geniuspay"
import { z } from "zod"

const donationSchema = z.object({
  amount: z.number().min(100, "Le montant minimum est de 100 FCFA"),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = donationSchema.parse(body)

    // Get user info
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Create donation record
    const donation = await db.donation.create({
      data: {
        userId: sessionUser.id,
        amount: validatedData.amount,
        currency: "XOF",
        message: validatedData.message,
        isAnonymous: validatedData.isAnonymous,
        status: "PENDING",
      },
    })

    // Create GeniusPay payment
    const payment = await geniuspay.createPayment({
      amount: validatedData.amount,
      description: `Don à Selectif${validatedData.message ? ` - ${validatedData.message}` : ""}`,
      customer_email: user.email,
      customer_name: user.name || "Donateur",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/success`,
      error_url: `${process.env.NEXT_PUBLIC_APP_URL}/donate/error`,
      metadata: {
        donationId: donation.id,
        userId: sessionUser.id,
        type: "donation",
      },
    })

    // Update donation with GeniusPay reference
    await db.donation.update({
      where: { id: donation.id },
      data: {
        geniuspayReference: payment.reference,
        geniuspayStatus: payment.status,
      },
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.checkout_url || payment.payment_url,
      reference: payment.reference,
      donationId: donation.id,
    })
  } catch (error) {
    console.error("Donation initialization error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de l'initialisation du don" },
      { status: 500 }
    )
  }
}
