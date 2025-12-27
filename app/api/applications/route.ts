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

    // Get query params for filtering
    const { searchParams } = new URL(req.url)
    const jobOfferId = searchParams.get("jobOfferId")
    const status = searchParams.get("status")

    // Build where clause
    const where: any = {
      jobOffer: {
        companyId: user.company.id,
      },
    }

    if (jobOfferId) {
      where.jobOfferId = jobOfferId
    }

    if (status) {
      where.status = status
    }

    // Get all applications for this company's job offers
    const applications = await db.application.findMany({
      where,
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            linkedinUrl: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        aiScore: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      applications,
    })
  } catch (error) {
    console.error("Applications fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des candidatures" },
      { status: 500 }
    )
  }
}
