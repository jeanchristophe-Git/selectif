import { NextResponse } from "next/server"
import { getDonationStats } from "@/lib/donations"

export async function GET() {
  try {
    const stats = await getDonationStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Donation stats error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
}
