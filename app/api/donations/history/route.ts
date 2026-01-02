import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Get user's donation history
    const donations = await db.donation.findMany({
      where: {
        userId: sessionUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        message: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
    })

    // Get total donated
    const totalDonated = donations
      .filter((d) => d.status === "COMPLETED")
      .reduce((sum, d) => sum + d.amount, 0)

    return NextResponse.json({
      success: true,
      donations,
      totalDonated,
    })
  } catch (error) {
    console.error("Donation history error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    )
  }
}
