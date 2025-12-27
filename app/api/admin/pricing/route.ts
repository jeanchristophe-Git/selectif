import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

interface PricingConfig {
  id: string
  name: string
  displayName: string
  type: "COMPANY" | "CANDIDATE"
  price: number
  billingPeriod: "MONTHLY" | "YEARLY"
  features: {
    maxJobs?: number
    maxAppsPerJob?: number
    maxAIAnalysesMonth?: number
    prioritySupport?: boolean
    advancedAnalytics?: boolean
    customBranding?: boolean
  }
}

const DEFAULT_PRICING: PricingConfig[] = [
  {
    id: "COMPANY_FREE",
    name: "COMPANY_FREE",
    displayName: "Gratuit Entreprise",
    type: "COMPANY",
    price: 0,
    billingPeriod: "MONTHLY",
    features: {
      maxJobs: 1,
      maxAppsPerJob: 50,
      maxAIAnalysesMonth: 10,
      prioritySupport: false,
      advancedAnalytics: false,
      customBranding: false,
    },
  },
  {
    id: "COMPANY_BUSINESS",
    name: "COMPANY_BUSINESS",
    displayName: "Business",
    type: "COMPANY",
    price: 79,
    billingPeriod: "MONTHLY",
    features: {
      maxJobs: 10,
      maxAppsPerJob: 200,
      maxAIAnalysesMonth: 100,
      prioritySupport: true,
      advancedAnalytics: true,
      customBranding: false,
    },
  },
  {
    id: "COMPANY_ENTERPRISE",
    name: "COMPANY_ENTERPRISE",
    displayName: "Enterprise",
    type: "COMPANY",
    price: 299,
    billingPeriod: "MONTHLY",
    features: {
      maxJobs: -1,
      maxAppsPerJob: -1,
      maxAIAnalysesMonth: -1,
      prioritySupport: true,
      advancedAnalytics: true,
      customBranding: true,
    },
  },
  {
    id: "CANDIDATE_FREE",
    name: "CANDIDATE_FREE",
    displayName: "Gratuit Candidat",
    type: "CANDIDATE",
    price: 0,
    billingPeriod: "MONTHLY",
    features: {
      maxAIAnalysesMonth: 5,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  {
    id: "CANDIDATE_PREMIUM",
    name: "CANDIDATE_PREMIUM",
    displayName: "Premium Candidat",
    type: "CANDIDATE",
    price: 19,
    billingPeriod: "MONTHLY",
    features: {
      maxAIAnalysesMonth: 50,
      prioritySupport: true,
      advancedAnalytics: true,
    },
  },
]

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // For now, we'll use the default pricing config
    // In a real app, this would be stored in a PricingConfig table
    return NextResponse.json({ plans: DEFAULT_PRICING })
  } catch (error) {
    console.error("Admin pricing error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des plans" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const body = await req.json()
    const { action, planId, price, features } = body

    if (action === "update") {
      // Log the pricing update
      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "UPDATE_PRICING",
          entity: "PRICING",
          entityId: planId,
          metadata: {
            price,
            features,
            adminId: sessionUser.id,
          },
        },
      })

      // In a real app, you would update the pricing in a PricingConfig table
      // For now, we'll just log the action and return success
      return NextResponse.json({
        success: true,
        message: "Tarification mise à jour",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin pricing action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
