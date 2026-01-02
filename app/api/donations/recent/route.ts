import { NextRequest, NextResponse } from "next/server"
import { getRecentDonors } from "@/lib/donations"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    const donors = await getRecentDonors(limit)

    return NextResponse.json({
      success: true,
      donors,
    })
  } catch (error) {
    console.error("Recent donors error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des donateurs récents" },
      { status: 500 }
    )
  }
}
