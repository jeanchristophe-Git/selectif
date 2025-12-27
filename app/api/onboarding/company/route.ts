import { NextRequest, NextResponse } from "next/server"
import { getSessionUser, createSession } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import {
  companyStep1Schema,
  companyStep2Schema,
} from "@/lib/validations/onboarding"
import { z } from "zod"

const completeOnboardingSchema = z
  .object({})
  .merge(companyStep1Schema)
  .merge(companyStep2Schema)

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
    const validatedData = completeOnboardingSchema.parse(body)

    // Verify user is a company
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    if (user.userType !== "COMPANY") {
      return NextResponse.json(
        { message: "Type d'utilisateur invalide" },
        { status: 403 }
      )
    }

    // Create or update company profile
    const company = await db.company.upsert({
      where: { userId: sessionUser.id },
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
      update: {
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

    // Mettre à jour onboardingCompleted dans User
    await db.user.update({
      where: { id: sessionUser.id },
      data: { onboardingCompleted: true },
    })

    // Recréer la session avec onboardingCompleted à true
    await createSession({
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      userType: sessionUser.userType,
      role: sessionUser.role,
      onboardingCompleted: true,
    })

    return NextResponse.json({
      success: true,
      company,
    })
  } catch (error) {
    console.error("Company onboarding error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la sauvegarde du profil" },
      { status: 500 }
    )
  }
}
