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
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const entity = searchParams.get("entity")
    const action = searchParams.get("action")

    const where: any = {}
    if (entity) where.entity = entity
    if (action) where.action = action

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Admin logs error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des logs" },
      { status: 500 }
    )
  }
}
