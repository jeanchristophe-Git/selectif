import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { PromoType } from "@prisma/client"

const ADMIN_EMAIL = "bogbe@example.com"

export async function GET() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.email !== ADMIN_EMAIL) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const promos = await db.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ promos })
  } catch (error) {
    console.error("Admin promos list error:", error)
    return NextResponse.json({ message: "Error fetching promos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.email !== ADMIN_EMAIL) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { code, type, value, applicableTo, maxUses, expiresAt, description } = body

    // Validation
    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await db.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { message: "Code already exists" },
        { status: 400 }
      )
    }

    const promo = await db.promoCode.create({
      data: {
        code: code.toUpperCase(),
        type: type as PromoType,
        value: parseFloat(value),
        applicableTo: applicableTo || "ALL",
        maxUses: maxUses ? parseInt(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        description,
        createdBy: sessionUser.id,
      },
    })

    return NextResponse.json({
      success: true,
      promo,
    })
  } catch (error) {
    console.error("Admin create promo error:", error)
    return NextResponse.json({ message: "Error creating promo" }, { status: 500 })
  }
}
