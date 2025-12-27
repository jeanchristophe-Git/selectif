import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { JobOfferStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { companyName: { contains: search, mode: "insensitive" } } },
      ]
    }

    const skip = (page - 1) * limit

    const [jobs, total] = await Promise.all([
      db.jobOffer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: {
            select: {
              companyName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      db.jobOffer.count({ where }),
    ])

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin jobs error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des offres" },
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
    const { action, jobId, reason } = body

    const logAction = async (actionName: string, entityId: string, metadata?: any) => {
      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: actionName,
          entity: "JOB",
          entityId,
          metadata: metadata || {},
        },
      })
    }

    if (action === "publish") {
      await db.jobOffer.update({
        where: { id: jobId },
        data: {
          status: "PUBLISHED" as JobOfferStatus,
          publishedAt: new Date(),
        },
      })
      await logAction("PUBLISH_JOB", jobId, { adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Offre publiée",
      })
    }

    if (action === "archive") {
      await db.jobOffer.update({
        where: { id: jobId },
        data: { status: "ARCHIVED" as JobOfferStatus },
      })
      await logAction("ARCHIVE_JOB", jobId, { reason, adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Offre archivée",
      })
    }

    if (action === "close") {
      await db.jobOffer.update({
        where: { id: jobId },
        data: { status: "CLOSED" as JobOfferStatus },
      })
      await logAction("CLOSE_JOB", jobId, { reason, adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Offre fermée",
      })
    }

    if (action === "delete") {
      await db.jobOffer.delete({
        where: { id: jobId },
      })
      await logAction("DELETE_JOB", jobId, { reason, adminId: sessionUser.id })

      return NextResponse.json({
        success: true,
        message: "Offre supprimée",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin job action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
