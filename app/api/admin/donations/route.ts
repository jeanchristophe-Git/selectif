import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    // Check if user is admin
    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status")

    const where: any = {}
    if (status) {
      where.status = status
    }

    // Get donations with pagination
    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      db.donation.count({ where }),
    ])

    // Get statistics
    const stats = await db.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get monthly stats (current month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthlyStats = await db.donation.aggregate({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get unique donors count
    const uniqueDonors = await db.subscription.count({
      where: {
        totalDonated: { gt: 0 },
      },
    })

    return NextResponse.json({
      success: true,
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalDonations: stats._count,
        uniqueDonors,
        monthlyAmount: monthlyStats._sum.amount || 0,
        monthlyDonations: monthlyStats._count,
      },
    })
  } catch (error) {
    console.error("Admin donations error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des donations" },
      { status: 500 }
    )
  }
}
