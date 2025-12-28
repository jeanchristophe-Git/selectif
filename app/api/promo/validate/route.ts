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
    if (!promoCode.active) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo n'est plus actif" },
        { status: 400 }
      )
    }

    // Vérifier les dates de validité
    const now = new Date()
    if (promoCode.expiresAt && now > promoCode.expiresAt) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo a expiré" },
        { status: 400 }
      )
    }

    // Vérifier le nombre d'utilisations
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { valid: false, message: "Ce code promo a atteint sa limite d'utilisation" },
        { status: 400 }
      )
    }

    // Calculer le discount basé sur le type
    let discountMessage = ""
    if (promoCode.type === "PERCENTAGE") {
      discountMessage = `Code promo valide! -${promoCode.value}%`
    } else if (promoCode.type === "FIXED_AMOUNT") {
      discountMessage = `Code promo valide! -${promoCode.value} FCFA`
    } else if (promoCode.type === "FREE_MONTHS") {
      discountMessage = `Code promo valide! ${promoCode.value} mois gratuit(s)`
    }

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      type: promoCode.type,
      value: promoCode.value,
      message: discountMessage,
    })
  } catch (error) {
    console.error("Validate promo error:", error)
    return NextResponse.json(
      { valid: false, message: "Erreur lors de la validation du code promo" },
      { status: 500 }
    )
  }
}
