import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const promotions = await db.pricingPromotion.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error("Get pricing promotions error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des promotions" },
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
    const { action, promotionId, plan, discountPercent, label, validFrom, validUntil } = body

    if (action === "create") {
      // Désactiver toute promo existante pour ce plan
      await db.pricingPromotion.updateMany({
        where: { plan, active: true },
        data: { active: false }
      })

      const promotion = await db.pricingPromotion.create({
        data: {
          plan,
          discountPercent: parseInt(discountPercent),
          label: label || null,
          validFrom: validFrom ? new Date(validFrom) : null,
          validUntil: validUntil ? new Date(validUntil) : null,
          active: true,
          createdBy: sessionUser.id,
        },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "CREATE_PRICING_PROMOTION",
          entity: "PRICING_PROMOTION",
          entityId: promotion.id,
          metadata: { plan, discountPercent, label },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Promotion créée",
        promotion,
      })
    }

    if (action === "toggle") {
      const promotion = await db.pricingPromotion.findUnique({
        where: { id: promotionId },
      })

      if (!promotion) {
        return NextResponse.json({ message: "Promotion introuvable" }, { status: 404 })
      }

      await db.pricingPromotion.update({
        where: { id: promotionId },
        data: { active: !promotion.active },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: promotion.active ? "DISABLE_PRICING_PROMOTION" : "ENABLE_PRICING_PROMOTION",
          entity: "PRICING_PROMOTION",
          entityId: promotionId,
          metadata: { plan: promotion.plan },
        },
      })

      return NextResponse.json({
        success: true,
        message: promotion.active ? "Promotion désactivée" : "Promotion activée",
      })
    }

    if (action === "delete") {
      await db.pricingPromotion.delete({
        where: { id: promotionId },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "DELETE_PRICING_PROMOTION",
          entity: "PRICING_PROMOTION",
          entityId: promotionId,
          metadata: {},
        },
      })

      return NextResponse.json({
        success: true,
        message: "Promotion supprimée",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Pricing promotion action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
