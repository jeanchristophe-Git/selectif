import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer tous les utilisateurs
    const users = await db.user.findMany({
      include: {
        subscription: true,
        company: {
          select: {
            companyName: true,
          },
        },
        candidate: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Générer le CSV
    const headers = [
      "ID",
      "Email",
      "Nom",
      "Type",
      "Role",
      "Plan",
      "Statut Subscription",
      "Email Vérifié",
      "Date Inscription",
      "Dernière MAJ",
    ]

    const rows = users.map((user) => [
      user.id,
      user.email,
      user.company?.companyName ||
        (user.candidate ? `${user.candidate.firstName} ${user.candidate.lastName}` : user.name || ""),
      user.userType,
      user.role,
      user.subscription?.plan || "AUCUN",
      user.subscription?.status || "AUCUN",
      user.emailVerified ? "OUI" : "NON",
      new Date(user.createdAt).toLocaleString("fr-FR"),
      new Date(user.updatedAt).toLocaleString("fr-FR"),
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n")

    // Log l'action
    await db.auditLog.create({
      data: {
        userId: sessionUser.id,
        action: "EXPORT_USERS",
        entity: "USER",
        entityId: "BULK_EXPORT",
        metadata: { count: users.length, adminId: sessionUser.id },
      },
    })

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="selectif_users_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export users error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'export" },
      { status: 500 }
    )
  }
}
