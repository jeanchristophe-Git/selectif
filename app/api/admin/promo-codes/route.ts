import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { PromoType } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const promoCodes = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ promoCodes })
  } catch (error) {
    console.error("Admin promo codes error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des codes promo" },
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
    const { action, promoCodeId, code, type, value, applicableTo, maxUses, expiresAt, description } = body

    if (action === "create") {
      const promoCode = await db.promoCode.create({
        data: {
          code: code.toUpperCase(),
          type: type as PromoType,
          value: parseFloat(value),
          applicableTo,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          description,
          createdBy: sessionUser.id,
        },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "CREATE_PROMO_CODE",
          entity: "PROMO_CODE",
          entityId: promoCode.id,
          metadata: { code, type, value },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Code promo créé",
        promoCode,
      })
    }

    if (action === "toggle") {
      const promoCode = await db.promoCode.findUnique({
        where: { id: promoCodeId },
      })

      if (!promoCode) {
        return NextResponse.json({ message: "Code promo introuvable" }, { status: 404 })
      }

      await db.promoCode.update({
        where: { id: promoCodeId },
        data: { active: !promoCode.active },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: promoCode.active ? "DISABLE_PROMO_CODE" : "ENABLE_PROMO_CODE",
          entity: "PROMO_CODE",
          entityId: promoCodeId,
          metadata: { code: promoCode.code },
        },
      })

      return NextResponse.json({
        success: true,
        message: promoCode.active ? "Code désactivé" : "Code activé",
      })
    }

    if (action === "delete") {
      await db.promoCode.delete({
        where: { id: promoCodeId },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "DELETE_PROMO_CODE",
          entity: "PROMO_CODE",
          entityId: promoCodeId,
          metadata: {},
        },
      })

      return NextResponse.json({
        success: true,
        message: "Code promo supprimé",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin promo code action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
