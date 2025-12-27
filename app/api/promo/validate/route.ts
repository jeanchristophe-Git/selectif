import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// POST - Valider un code promo
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ valid: false, message: "Code promo requis" }, { status: 400 })
    }

    const promoCode = await db.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promoCode) {
      return NextResponse.json(
        { valid: false, message: "Code promo invalide" },
        { status: 404 }
      )
    }

    // Vérifier si le code est actif
    if (!promoCode.isActive) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo n'est plus actif" },
        { status: 400 }
      )
    }

    // Vérifier les dates de validité
    const now = new Date()
    if (now < promoCode.startDate || now > promoCode.endDate) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo a expiré" },
        { status: 400 }
      )
    }

    // Vérifier le nombre d'utilisations
    if (promoCode.usageCount >= promoCode.maxUsage) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo a atteint sa limite d'utilisation" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      discountPercent: promoCode.discountPercent,
      message: `Code promo valide! -${promoCode.discountPercent}%`,
    })
  } catch (error) {
    console.error("Validate promo error:", error)
    return NextResponse.json(
      { valid: false, message: "Erreur lors de la validation du code promo" },
      { status: 500 }
    )
  }
}
