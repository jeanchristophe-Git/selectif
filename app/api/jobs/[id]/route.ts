import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { jobOfferSchema } from "@/lib/validations/job"
import { z } from "zod"

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

    // Get job offer
    const jobOffer = await db.jobOffer.findUnique({
      where: { id },
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

    return NextResponse.json({
      success: true,
      job: jobOffer,
    })
  } catch (error) {
    console.error("Job fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération de l'offre" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await req.json()
    const validatedData = jobOfferSchema.parse(body)

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

    // Check if published - only allow limited modifications
    if (jobOffer.status === "PUBLISHED") {
      // Only allow description and salaryRange modifications
      const updatedJob = await db.jobOffer.update({
        where: { id },
        data: {
          description: validatedData.description,
          salaryRange: validatedData.salaryRange,
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
        job: updatedJob,
        message: "Seules la description et la fourchette salariale peuvent être modifiées pour une offre publiée",
      })
    }

    // Full update for non-published jobs
    const updatedJob = await db.jobOffer.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        requirements: validatedData.requirements,
        location: validatedData.location,
        jobType: validatedData.jobType,
        salaryRange: validatedData.salaryRange,
        interviewSlots: validatedData.interviewSlots,
        expiresAt: validatedData.expiresAt,
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
      job: updatedJob,
    })
  } catch (error) {
    console.error("Job update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la modification de l'offre" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Get job offer with applications count
    const jobOffer = await db.jobOffer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { applications: true },
        },
      },
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

    // Check if has applications
    if (jobOffer._count.applications > 0) {
      return NextResponse.json(
        { message: "Impossible de supprimer une offre avec des candidatures" },
        { status: 400 }
      )
    }

    // Delete job offer
    await db.jobOffer.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Offre supprimée avec succès",
    })
  } catch (error) {
    console.error("Job delete error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'offre" },
      { status: 500 }
    )
  }
}
