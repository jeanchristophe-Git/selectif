import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const user = await getSessionUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Récupérer onboardingCompleted et subscription depuis la base de données
    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        candidate: true,
        company: true,
        subscription: true
      }
    })

    console.log('Session check:', {
      userId: user.id,
      userType: user.userType,
      onboardingCompletedDB: dbUser?.onboardingCompleted,
      hasCandidate: !!dbUser?.candidate,
      hasCompany: !!dbUser?.company
    })

    // Si l'utilisateur a un profil candidate ou company mais onboardingCompleted est false, le corriger
    const shouldBeCompleted = !!(dbUser?.candidate || dbUser?.company)
    if (shouldBeCompleted && !dbUser?.onboardingCompleted) {
      console.log('Fixing onboardingCompleted for user', user.id)
      await db.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true }
      })
    }

    return NextResponse.json({
      user: {
        ...user,
        onboardingCompleted: shouldBeCompleted || dbUser?.onboardingCompleted,
        subscription: dbUser?.subscription || null
      }
    })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
