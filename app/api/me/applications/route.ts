import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    if (sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json(
        { message: "Accès réservé aux candidats" },
        { status: 403 }
      )
    }

    // Get candidate profile
    const candidate = await db.candidate.findUnique({
      where: { userId: sessionUser.id },
    })

    if (!candidate) {
      // Pas encore de profil candidat, retourner liste vide
      return NextResponse.json({ applications: [] })
    }

    // Get all applications for this candidate
    const applications = await db.application.findMany({
      where: {
        candidateId: candidate.id,
        deletedAt: null, // Only non-deleted applications
      },
      include: {
        jobOffer: {
          include: {
            company: {
              select: {
                companyName: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format response
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      status: app.status,
      aiScore: app.aiScore,
      aiAnalysis: app.aiAnalysis,
      createdAt: app.createdAt,
      jobOffer: {
        id: app.jobOffer.id,
        title: app.jobOffer.title,
        location: app.jobOffer.location,
        jobType: app.jobOffer.jobType,
        company: {
          companyName: app.jobOffer.company.companyName,
          logo: app.jobOffer.company.logo,
        },
      },
    }))

    return NextResponse.json({ applications: formattedApplications })
  } catch (error) {
    console.error("Get applications error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    )
  }
}
