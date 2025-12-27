import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { z } from "zod"

const updateCompanySchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  companySize: z.string().min(1),
  location: z.string().min(1),
  website: z.string().url(),
  description: z.string().min(1),
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

    // Get company profile
    const company = await db.company.findUnique({
      where: { userId: sessionUser.id },
    })

    if (!company) {
      return NextResponse.json(
        { company: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      id: company.id,
      companyName: company.companyName,
      industry: company.industry,
      companySize: company.companySize,
      location: company.location,
      website: company.website,
      description: company.description,
      logo: company.logo,
      onboardingStep: company.onboardingStep,
      onboardedAt: company.onboardedAt,
    })
  } catch (error) {
    console.error("Company profile fetch error:", error)
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
    const validatedData = updateCompanySchema.parse(body)

    // Upsert - créer ou mettre à jour le profil company
    const company = await db.company.upsert({
      where: { userId: sessionUser.id },
      update: {
        companyName: validatedData.companyName,
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        location: validatedData.location,
        website: validatedData.website,
        description: validatedData.description,
      },
      create: {
        userId: sessionUser.id,
        companyName: validatedData.companyName,
        industry: validatedData.industry,
        companySize: validatedData.companySize,
        location: validatedData.location,
        website: validatedData.website,
        description: validatedData.description,
        onboardingStep: 3,
        onboardedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, company })
  } catch (error) {
    console.error("Company profile update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}
