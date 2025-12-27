import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(
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

    // Get application with full details
    const application = await db.application.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        jobOffer: {
          include: {
            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { message: "Candidature non trouvée" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.jobOffer.company.id !== user.company.id) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      application,
    })
  } catch (error) {
    console.error("Application fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération de la candidature" },
      { status: 500 }
    )
  }
}
