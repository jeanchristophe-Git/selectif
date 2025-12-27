import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth-utils"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  userType: z.enum(["COMPANY", "CANDIDATE"]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, userType } = registerSchema.parse(body)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Un compte existe déjà avec cet email" },
        { status: 400 }
      )
    }

    // Créer l'utilisateur
    const hashedPassword = await hashPassword(password)

    const user = await db.user.create({
      data: {
        email,
        name,
        userType,
        password: hashedPassword,
      },
    })

    // Créer la session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      onboardingCompleted: user.onboardingCompleted,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        onboardingCompleted: user.onboardingCompleted,
      },
    })
  } catch (error) {
    console.error("Register error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}
