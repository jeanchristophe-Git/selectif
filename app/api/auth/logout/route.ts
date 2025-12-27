import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth-utils"

export async function POST() {
  try {
    await deleteSession()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la déconnexion" },
      { status: 500 }
    )
  }
}
