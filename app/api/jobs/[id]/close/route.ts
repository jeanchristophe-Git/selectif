import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Get user's company
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: { company: true },
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: "Profil entreprise requis" },
        { status: 403 }
      )
    }

    // Get job offer
    const jobOffer = await db.jobOffer.findUnique({
      where: { id },
    })

    if (!jobOffer) {
      return NextResponse.json(
        { message: "Offre non trouvée" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (jobOffer.companyId !== user.company.id) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Check if published
    if (jobOffer.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Seules les offres publiées peuvent être fermées" },
        { status: 400 }
      )
    }

    // Close job offer
    const updatedJob = await db.jobOffer.update({
      where: { id },
      data: {
        status: "CLOSED",
      },
      include: {
        company: {
          select: {
            companyName: true,
            logo: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      job: updatedJob,
    })
  } catch (error) {
    console.error("Job close error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la fermeture de l'offre" },
      { status: 500 }
    )
  }
}
