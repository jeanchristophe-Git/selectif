import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Get current date ranges
    const now = new Date()
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total users
    const totalUsers = await db.user.count()
    const totalCompanies = await db.user.count({ where: { userType: "COMPANY" } })
    const totalCandidates = await db.user.count({ where: { userType: "CANDIDATE" } })

    // New users (7 days, 30 days)
    const newUsers7d = await db.user.count({
      where: { createdAt: { gte: last7Days } },
    })
    const newUsers30d = await db.user.count({
      where: { createdAt: { gte: last30Days } },
    })

    // Job offers
    const totalJobs = await db.jobOffer.count()
    const publishedJobs = await db.jobOffer.count({ where: { status: "PUBLISHED" } })
    const newJobs30d = await db.jobOffer.count({
      where: { createdAt: { gte: last30Days } },
    })

    // Applications
    const totalApplications = await db.application.count()
    const newApplications30d = await db.application.count({
      where: { createdAt: { gte: last30Days } },
    })

    // Subscriptions by plan
    const subscriptionsByPlan = await db.subscription.groupBy({
      by: ["plan"],
      _count: {
        plan: true,
      },
    })

    const planDistribution = subscriptionsByPlan.reduce((acc, item) => {
      acc[item.plan] = item._count.plan
      return acc
    }, {} as Record<string, number>)

    // Monthly Recurring Revenue (MRR)
    const subscriptions = await db.subscription.findMany({
      where: {
        status: "ACTIVE",
        plan: {
          in: ["COMPANY_BUSINESS", "COMPANY_ENTERPRISE", "CANDIDATE_PREMIUM"],
        },
      },
    })

    const planPrices: Record<string, number> = {
      COMPANY_BUSINESS: 39,
      COMPANY_ENTERPRISE: 199,
      CANDIDATE_PREMIUM: 10,
    }

    let mrr = 0
    subscriptions.forEach((sub) => {
      const basePrice = planPrices[sub.plan] || 0
      const discount = sub.discountPercent > 0 ? (basePrice * sub.discountPercent) / 100 : 0
      const fixedDiscount = sub.discountFixed || 0
      mrr += Math.max(0, basePrice - discount - fixedDiscount)
    })

    // Activity rate (users active in last 30 days)
    const activeUsers = await db.user.count({
      where: {
        updatedAt: { gte: last30Days },
      },
    })
    const activityRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

    // AI analyses this month
    const aiAnalysesMonth = await db.application.count({
      where: {
        aiProcessedAt: { gte: startOfMonth },
      },
    })

    return NextResponse.json({
      users: {
        total: totalUsers,
        companies: totalCompanies,
        candidates: totalCandidates,
        new7d: newUsers7d,
        new30d: newUsers30d,
        activeRate: activityRate,
      },
      jobs: {
        total: totalJobs,
        published: publishedJobs,
        new30d: newJobs30d,
      },
      applications: {
        total: totalApplications,
        new30d: newApplications30d,
        avgPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0,
      },
      subscriptions: {
        distribution: planDistribution,
        mrr,
        aiAnalysesMonth,
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Error fetching stats" },
      { status: 500 }
    )
  }
}
