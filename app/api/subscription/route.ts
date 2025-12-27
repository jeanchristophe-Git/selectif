import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { getSubscriptionWithFeatures } from "@/lib/subscription"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Get user to determine userType
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Get or create subscription with features
    const subscriptionData = await getSubscriptionWithFeatures(sessionUser.id)

    // If no subscription exists, create one
    let subscription = subscriptionData
    if (!subscription) {
      const { getOrCreateSubscription } = await import("@/lib/subscription")
      const newSub = await getOrCreateSubscription(sessionUser.id, user.userType)
      subscription = await getSubscriptionWithFeatures(sessionUser.id)
    }

    if (!subscription) {
      return NextResponse.json(
        { message: "Erreur lors de la création de l'abonnement" },
        { status: 500 }
      )
    }

    // Get usage counts with company data
    const userWithCompany = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        company: {
          include: {
            jobOffers: {
              where: {
                status: {
                  in: ["DRAFT", "PUBLISHED"],
                },
              },
            },
          },
        },
      },
    })

    const currentJobs = userWithCompany?.company?.jobOffers?.length || 0

    return NextResponse.json({
      subscription: {
        ...subscription,
        currentJobs,
      },
    })
  } catch (error) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération de l'abonnement" },
      { status: 500 }
    )
  }
}
