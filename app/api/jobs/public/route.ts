import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all published and non-expired job offers
    const jobOffers = await db.jobOffer.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: {
        company: {
          select: {
            companyName: true,
            logo: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      jobs: jobOffers,
    })
  } catch (error) {
    console.error("Public jobs fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des offres" },
      { status: 500 }
    )
  }
}
