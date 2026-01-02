import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { jobOfferSchema } from "@/lib/validations/job"
import { z } from "zod"

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = jobOfferSchema.parse(body)

    // Verify user has a company profile
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

    // Create job offer
    const jobOffer = await db.jobOffer.create({
      data: {
        companyId: user.company.id,
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        location: validatedData.location,
        jobType: validatedData.jobType,
        salaryRange: validatedData.salaryRange,
        interviewSlots: validatedData.interviewSlots,
        expiresAt: validatedData.expiresAt,
        status: "DRAFT",
      },
      include: {
        company: {
          select: {
            companyName: true,
            logo: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      job: jobOffer,
    })
  } catch (error) {
    console.error("Job creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la création de l'offre" },
      { status: 500 }
    )
  }
}

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

    // Get all job offers for this company
    const jobOffers = await db.jobOffer.findMany({
      where: { companyId: user.company.id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      jobs: jobOffers,
    })
  } catch (error) {
    console.error("Jobs fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des offres" },
      { status: 500 }
    )
  }
}
