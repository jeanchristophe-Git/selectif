import { db } from "./db"
import { SubscriptionPlan } from "@prisma/client"

// Plan limits configuration
export const PLAN_LIMITS = {
  COMPANY_FREE: {
    maxJobs: 5,
    maxAppsPerJob: 50,
    maxAIAnalysesMonth: 20,
    maxCVs: 1,
    price: 0,
    name: "Free",
    features: [
      "5 offres actives",
      "50 candidatures par offre",
      "20 analyses IA/mois",
      "Dashboard basique",
    ],
  },
  COMPANY_BUSINESS: {
    maxJobs: 25,
    maxAppsPerJob: 150,
    maxAIAnalysesMonth: 200,
    maxCVs: 1,
    price: 39,
    name: "Business",
    features: [
      "25 offres actives",
      "150 candidatures par offre",
      "200 analyses IA/mois",
      "Shortlist IA automatique",
      "Analytics avancées",
      "Export CSV",
      "Sans badge 'Propulsé par Selectif'",
    ],
  },
  COMPANY_ENTERPRISE: {
    maxJobs: 999999,
    maxAppsPerJob: 999999,
    maxAIAnalysesMonth: 999999,
    maxCVs: 1,
    price: 199,
    name: "Enterprise",
    features: [
      "Offres illimitées",
      "Candidatures illimitées",
      "Analyses IA illimitées",
      "Multi-utilisateurs (10)",
      "API access",
      "White-label complet",
      "Support dédié",
      "SLA 99.9%",
    ],
  },
  CANDIDATE_FREE: {
    maxJobs: 0,
    maxAppsPerJob: 0,
    maxAIAnalysesMonth: 0,
    maxCVs: 1,
    price: 0,
    name: "Gratuit",
    features: [
      "Postuler aux offres",
      "Dashboard candidatures",
      "1 CV",
    ],
  },
  CANDIDATE_PREMIUM: {
    maxJobs: 0,
    maxAppsPerJob: 0,
    maxAIAnalysesMonth: 50,
    maxCVs: 999,
    price: 10,
    name: "Premium",
    features: [
      "CVs illimités",
      "50 analyses IA/mois",
      "Recherche d'offres sur Internet",
      "Statistiques détaillées",
      "Historique complet",
      "Alertes personnalisées",
      "CV Builder IA",
    ],
  },
}

/**
 * Get or create subscription for user
 */
export async function getOrCreateSubscription(userId: string, userType: string) {
  let subscription = await db.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    // Create default subscription based on user type
    const defaultPlan = userType === "COMPANY" ? "COMPANY_FREE" : "CANDIDATE_FREE"
    const limits = PLAN_LIMITS[defaultPlan as SubscriptionPlan]

    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    subscription = await db.subscription.create({
      data: {
        userId,
        plan: defaultPlan as SubscriptionPlan,
        maxJobs: limits.maxJobs,
        maxAppsPerJob: limits.maxAppsPerJob,
        maxAIAnalysesMonth: limits.maxAIAnalysesMonth,
        maxCVs: limits.maxCVs,
        currentPeriodEnd: periodEnd,
      },
    })
  }

  return subscription
}

/**
 * Check if user can create a job offer
 */
export async function canCreateJob(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getOrCreateSubscription(userId, "COMPANY")

  const activeJobs = await db.jobOffer.count({
    where: {
      company: {
        userId,
      },
      status: {
        in: ["DRAFT", "PUBLISHED"],
      },
    },
  })

  if (activeJobs >= subscription.maxJobs) {
    return {
      allowed: false,
      reason: `Limite atteinte : ${subscription.maxJobs} offres actives maximum. Passez à un plan supérieur.`,
    }
  }

  return { allowed: true }
}

/**
 * Check if user can use AI analysis
 */
export async function canUseAIAnalysis(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const subscription = await getOrCreateSubscription(userId, "COMPANY")

  // Reset monthly counter if needed
  const now = new Date()
  const lastReset = new Date(subscription.lastResetAt)

  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    await db.subscription.update({
      where: { userId },
      data: {
        currentAIUses: 0,
        lastResetAt: now,
      },
    })
    return { allowed: true }
  }

  if (subscription.currentAIUses >= subscription.maxAIAnalysesMonth) {
    return {
      allowed: false,
      reason: `Limite mensuelle atteinte : ${subscription.maxAIAnalysesMonth} analyses IA. Passez à un plan supérieur.`,
    }
  }

  return { allowed: true }
}

/**
 * Increment AI usage counter
 */
export async function incrementAIUsage(userId: string) {
  await db.subscription.update({
    where: { userId },
    data: {
      currentAIUses: {
        increment: 1,
      },
    },
  })
}

/**
 * Check if job offer can receive more applications
 */
export async function canReceiveApplication(jobOfferId: string): Promise<{ allowed: boolean; reason?: string }> {
  const jobOffer = await db.jobOffer.findUnique({
    where: { id: jobOfferId },
    include: {
      company: true,
      _count: {
        select: { applications: true },
      },
    },
  })

  if (!jobOffer) {
    return { allowed: false, reason: "Offre non trouvée" }
  }

  const subscription = await getOrCreateSubscription(jobOffer.company.userId, "COMPANY")

  if (jobOffer._count.applications >= subscription.maxAppsPerJob) {
    return {
      allowed: false,
      reason: `Cette offre a atteint sa limite de ${subscription.maxAppsPerJob} candidatures.`,
    }
  }

  return { allowed: true }
}

/**
 * Apply promo code to user
 */
export async function applyPromoCode(userId: string, code: string): Promise<{ success: boolean; message: string }> {
  const promo = await db.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!promo || !promo.active) {
    return { success: false, message: "Code promo invalide" }
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { success: false, message: "Code promo expiré" }
  }

  if (promo.maxUses && promo.currentUses >= promo.maxUses) {
    return { success: false, message: "Code promo épuisé" }
  }

  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return { success: false, message: "Abonnement introuvable" }
  }

  // Apply discount
  let discountPercent = 0
  let discountFixed = null

  if (promo.type === "PERCENTAGE") {
    discountPercent = promo.value
  } else if (promo.type === "FIXED_AMOUNT") {
    discountFixed = promo.value
  } else if (promo.type === "FREE_MONTHS") {
    // Extend period by N months
    const newPeriodEnd = new Date(subscription.currentPeriodEnd)
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + promo.value)

    await db.subscription.update({
      where: { userId },
      data: {
        currentPeriodEnd: newPeriodEnd,
        promoCodeUsed: code,
      },
    })

    await db.promoCode.update({
      where: { id: promo.id },
      data: {
        currentUses: {
          increment: 1,
        },
      },
    })

    return { success: true, message: `${promo.value} mois gratuits ajoutés !` }
  }

  // Update subscription with discount
  await db.subscription.update({
    where: { userId },
    data: {
      promoCodeUsed: code,
      discountPercent,
      discountFixed,
    },
  })

  await db.promoCode.update({
    where: { id: promo.id },
    data: {
      currentUses: {
        increment: 1,
      },
    },
  })

  return { success: true, message: "Code promo appliqué avec succès !" }
}

/**
 * Upgrade user plan
 */
export async function upgradePlan(userId: string, newPlan: SubscriptionPlan) {
  const limits = PLAN_LIMITS[newPlan]

  await db.subscription.update({
    where: { userId },
    data: {
      plan: newPlan,
      maxJobs: limits.maxJobs,
      maxAppsPerJob: limits.maxAppsPerJob,
      maxAIAnalysesMonth: limits.maxAIAnalysesMonth,
      maxCVs: limits.maxCVs,
      status: "ACTIVE",
    },
  })
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string, immediate = false) {
  if (immediate) {
    // Immediately downgrade to FREE
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    const freePlan = user?.userType === "COMPANY" ? "COMPANY_FREE" : "CANDIDATE_FREE"
    await upgradePlan(userId, freePlan as SubscriptionPlan)
  } else {
    // Cancel at period end
    await db.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    })
  }
}

/**
 * Get subscription with features
 */
export async function getSubscriptionWithFeatures(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) return null

  const features = PLAN_LIMITS[subscription.plan]

  return {
    ...subscription,
    planName: features.name,
    price: features.price,
    features: features.features,
  }
}
