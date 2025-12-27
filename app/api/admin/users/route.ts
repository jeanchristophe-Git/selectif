import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { upgradePlan } from "@/lib/subscription"
import { SubscriptionPlan } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const userType = searchParams.get("userType") || "" // COMPANY, CANDIDATE
    const plan = searchParams.get("plan") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ]
    }

    if (userType) {
      where.userType = userType
    }

    // Get users with subscriptions
    const users = await db.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        subscription: true,
        company: {
          select: {
            companyName: true,
            _count: {
              select: { jobOffers: true },
            },
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            _count: {
              select: { applications: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Filter by plan if specified
    let filteredUsers = users
    if (plan) {
      filteredUsers = users.filter((u) => u.subscription?.plan === plan)
    }

    const total = await db.user.count({ where })

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin users list error:", error)
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const body = await req.json()
    const { action, userId, newPlan, reason } = body

    // Log l'action admin
    const logAction = async (actionName: string, entityId: string, metadata?: any) => {
      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: actionName,
          entity: "USER",
          entityId,
          metadata: metadata || {},
        },
      })
    }

    if (action === "changePlan") {
      await upgradePlan(userId, newPlan as SubscriptionPlan)
      await logAction("CHANGE_PLAN", userId, { newPlan, adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Plan modifié avec succès",
      })
    }

    if (action === "suspend") {
      await db.user.update({
        where: { id: userId },
        data: {
          suspended: true,
          suspendedAt: new Date(),
          suspensionReason: reason
        },
      })
      await logAction("SUSPEND_USER", userId, { reason, adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Utilisateur suspendu",
      })
    }

    if (action === "unsuspend") {
      await db.user.update({
        where: { id: userId },
        data: {
          suspended: false,
          suspendedAt: null,
          suspensionReason: null
        },
      })
      await logAction("UNSUSPEND_USER", userId, { adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Utilisateur réactivé",
      })
    }

    if (action === "delete") {
      await db.user.delete({
        where: { id: userId },
      })
      await logAction("DELETE_USER", userId, { reason, adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Utilisateur supprimé",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin user action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
