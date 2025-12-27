import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Get all notifications for this user
    const notifications = await db.notification.findMany({
      where: {
        userId: sessionUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent
    })

    // Count unread notifications
    const unreadCount = await db.notification.count({
      where: {
        userId: sessionUser.id,
        read: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    // Mark all notifications as read
    await db.notification.updateMany({
      where: {
        userId: sessionUser.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Mark notifications read error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour" },
      { status: 500 }
    )
  }
}
