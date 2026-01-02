import { db } from "./db"

/**
 * Calcule le badge donateur basé sur le montant total donné
 * @param totalDonated - Montant total en FCFA
 * @returns Badge name ou null
 */
export function calculateDonorBadge(totalDonated: number): string | null {
  if (totalDonated >= 20000) return "GENEROUS" // > 20000 FCFA (~30€)
  if (totalDonated >= 5000) return "SUPPORTER" // > 5000 FCFA (~7.6€)
  return null
}

/**
 * Configuration des badges donateurs
 */
export const DONOR_BADGES = {
  SUPPORTER: {
    icon: "❤️",
    label: "Supporter",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    description: "A soutenu Selectif",
  },
  GENEROUS: {
    icon: "⭐",
    label: "Généreux Donateur",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    description: "Donateur généreux de Selectif",
  },
  FOUNDING: {
    icon: "👑",
    label: "Founding Supporter",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "Pionnier de Selectif",
  },
} as const

export type DonorBadgeType = keyof typeof DONOR_BADGES

/**
 * Met à jour le badge donateur d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @param totalDonated - Nouveau montant total
 */
export async function updateDonorBadge(
  userId: string,
  totalDonated: number
): Promise<void> {
  const badge = calculateDonorBadge(totalDonated)

  await db.subscription.update({
    where: { userId },
    data: {
      donorBadge: badge,
      totalDonated,
    },
  })
}

/**
 * Récupère les informations de donation d'un utilisateur
 * @param userId - ID de l'utilisateur
 */
export async function getDonationInfo(userId: string) {
  const subscription = await db.subscription.findUnique({
    where: { userId },
    select: {
      donorBadge: true,
      totalDonated: true,
    },
  })

  return {
    badge: subscription?.donorBadge as DonorBadgeType | null,
    totalDonated: subscription?.totalDonated || 0,
    badgeInfo: subscription?.donorBadge
      ? DONOR_BADGES[subscription.donorBadge as DonorBadgeType]
      : null,
  }
}

/**
 * Récupère les statistiques globales des donations
 */
export async function getDonationStats() {
  const [totalCount, totalAmount, thisMonth] = await Promise.all([
    // Nombre total de donateurs
    db.subscription.count({
      where: {
        totalDonated: { gt: 0 },
      },
    }),

    // Montant total collecté
    db.subscription.aggregate({
      _sum: {
        totalDonated: true,
      },
    }),

    // Donations ce mois
    db.donation.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    }),
  ])

  return {
    totalDonors: totalCount,
    totalCollected: totalAmount._sum.totalDonated || 0,
    thisMonthAmount: thisMonth._sum.amount || 0,
    thisMonthCount: thisMonth._count,
  }
}

/**
 * Récupère les donateurs récents (non-anonymes)
 * @param limit - Nombre max de donateurs à retourner
 */
export async function getRecentDonors(limit: number = 10) {
  const donations = await db.donation.findMany({
    where: {
      status: "COMPLETED",
      isAnonymous: false,
    },
    orderBy: {
      completedAt: "desc",
    },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          subscription: {
            select: {
              donorBadge: true,
            },
          },
        },
      },
    },
  })

  return donations.map((d) => ({
    id: d.id,
    userName: d.user.name || "Utilisateur",
    badge: d.user.subscription?.donorBadge as DonorBadgeType | null,
    amount: d.amount,
    message: d.message,
    completedAt: d.completedAt,
  }))
}
