import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth-utils"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    console.log("🔐 Login attempt started")
    const body = await req.json()
    console.log("📧 Email:", body.email)
    const { email, password } = loginSchema.parse(body)

    // Trouver l'utilisateur
    console.log("🔍 Looking for user in database...")
    const user = await db.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.log("❌ User not found")
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    console.log("✅ User found:", user.email, "Role:", user.role)

    // Vérifier le mot de passe
    console.log("🔑 Verifying password...")
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      console.log("❌ Password incorrect")
      return NextResponse.json(
        { message: "Email ou mot de passe incorrect" },
        { status: 401 }
      )
    }

    console.log("✅ Password valid")

    // Créer la session
    console.log("🍪 Creating session...")
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    })

    console.log("✅ Session created successfully")

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
      },
    })
  } catch (error) {
    console.error("Login error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la connexion" },
      { status: 500 }
    )
  }
}
