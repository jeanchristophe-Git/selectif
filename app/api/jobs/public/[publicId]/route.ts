import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params

    const job = await db.jobOffer.findFirst({
      where: {
        publicId,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        location: true,
        jobType: true,
        salaryRange: true,
        company: {
          select: {
            companyName: true,
            logo: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { message: "Offre non trouvée ou non publiée" },
        { status: 404 }
      )
    }

    // Increment view count
    await db.jobOffer.update({
      where: { id: job.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      job,
    })
  } catch (error) {
    console.error("Public job fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération de l'offre" },
      { status: 500 }
    )
  }
}
