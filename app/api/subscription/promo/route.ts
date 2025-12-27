import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { applyPromoCode } from "@/lib/subscription"

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    const { code } = await req.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { message: "Code promo requis" },
        { status: 400 }
      )
    }

    const result = await applyPromoCode(sessionUser.id, code)

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error("Promo code apply error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'application du code promo" },
      { status: 500 }
    )
  }
}
