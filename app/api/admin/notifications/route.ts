import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const where: any = {}
    if (unreadOnly) {
      where.read = false
    }

    const notifications = await db.adminNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unreadCount = await db.adminNotification.count({
      where: { read: false },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Admin notifications error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des notifications" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const body = await req.json()
    const { action, notificationId } = body

    if (action === "markAsRead") {
      await db.adminNotification.update({
        where: { id: notificationId },
        data: { read: true },
      })

      return NextResponse.json({
        success: true,
        message: "Notification marquée comme lue",
      })
    }

    if (action === "markAllAsRead") {
      await db.adminNotification.updateMany({
        where: { read: false },
        data: { read: true },
      })

      return NextResponse.json({
        success: true,
        message: "Toutes les notifications marquées comme lues",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin notification action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
