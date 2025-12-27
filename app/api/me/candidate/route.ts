import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { z } from "zod"

const updateCandidateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
})

export async function GET() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Get candidate profile
    const candidate = await db.candidate.findUnique({
      where: { userId: sessionUser.id },
    })

    if (!candidate) {
      return NextResponse.json(
        { candidate: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      phone: candidate.phone,
      linkedinUrl: candidate.linkedinUrl,
      portfolioUrl: candidate.portfolioUrl,
      bio: candidate.bio,
      onboardingStep: candidate.onboardingStep,
      onboardedAt: candidate.onboardedAt,
    })
  } catch (error) {
    console.error("Candidate profile fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération du profil" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = updateCandidateSchema.parse(body)

    // Upsert - créer ou mettre à jour le profil candidat
    const candidate = await db.candidate.upsert({
      where: { userId: sessionUser.id },
      update: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        linkedinUrl: validatedData.linkedinUrl || null,
        portfolioUrl: validatedData.portfolioUrl || null,
        bio: validatedData.bio || null,
      },
      create: {
        userId: sessionUser.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
        linkedinUrl: validatedData.linkedinUrl || null,
        portfolioUrl: validatedData.portfolioUrl || null,
        bio: validatedData.bio || null,
        onboardingStep: 3,
        onboardedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, candidate })
  } catch (error) {
    console.error("Candidate profile update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}
