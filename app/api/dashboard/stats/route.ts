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

    // Get stats
    const [totalJobs, draftJobs, publishedJobs, closedJobs, applications] = await Promise.all([
      // Total jobs
      db.jobOffer.count({
        where: { companyId: user.company.id },
      }),
      // Draft jobs
      db.jobOffer.count({
        where: {
          companyId: user.company.id,
          status: "DRAFT",
        },
      }),
      // Published jobs
      db.jobOffer.count({
        where: {
          companyId: user.company.id,
          status: "PUBLISHED",
        },
      }),
      // Closed jobs
      db.jobOffer.count({
        where: {
          companyId: user.company.id,
          status: "CLOSED",
        },
      }),
      // All applications for this company's jobs
      db.application.findMany({
        where: {
          jobOffer: {
            companyId: user.company.id,
          },
        },
        select: {
          status: true,
        },
      }),
    ])

    const totalApplications = applications.length
    const pendingApplications = applications.filter(
      (app) => app.status === "PENDING" || app.status === "ANALYZING"
    ).length

    return NextResponse.json({
      success: true,
      stats: {
        totalJobs,
        draftJobs,
        publishedJobs,
        closedJobs,
        totalApplications,
        pendingApplications,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    )
  }
}
