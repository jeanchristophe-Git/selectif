import { db } from "./db"

/**
 * Get or create subscription for user
 * Maintenant tous les utilisateurs ont le plan FREE avec accès illimité
 */
export async function getOrCreateSubscription(userId: string) {
  let subscription = await db.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    subscription = await db.subscription.create({
      data: {
        userId,
        plan: "FREE",
        status: "ACTIVE",
      },
    })
  }

  return subscription
}

/**
 * Get subscription with donation info
 */
export async function getSubscriptionWithFeatures(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: {
      id: true,
      plan: true,
      status: true,
      donorBadge: true,
      totalDonated: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!subscription) return null

  return {
    ...subscription,
    planName: "Gratuit",
    features: [
      "Offres d'emploi illimitées",
      "Candidatures illimitées",
      "Analyses IA illimitées",
      "Recherche d'offres sur Internet",
      "CV Builder IA",
      "CVs illimités",
      "Statistiques détaillées",
      "Alertes personnalisées",
      "Toutes les fonctionnalités incluses ✨",
    ],
  }
}
