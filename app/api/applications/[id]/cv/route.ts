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

    // Get application
    const application = await db.application.findUnique({
      where: { id },
      include: {
        jobOffer: {
          select: {
            companyId: true,
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
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
    if (application.jobOffer.companyId !== user.company.id) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Check if CV exists
    if (!application.cvData) {
      return NextResponse.json(
        { message: "CV non trouvé" },
        { status: 404 }
      )
    }

    // Generate filename
    const candidateName = application.candidate
      ? `${application.candidate.firstName}_${application.candidate.lastName}`
      : application.guestFirstName && application.guestLastName
      ? `${application.guestFirstName}_${application.guestLastName}`
      : "Candidat"

    const filename = `CV_${candidateName.replace(/\s+/g, "_")}.pdf`

    // Return PDF with appropriate headers
    return new NextResponse(application.cvData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("CV download error:", error)
    return NextResponse.json(
      { message: "Erreur lors du téléchargement du CV" },
      { status: 500 }
    )
  }
}
