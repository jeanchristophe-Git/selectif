import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer tous les paramètres
    const settings = await db.systemSettings.findMany()

    // Transformer en objet simple
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    // Valeurs par défaut si aucun paramètre n'existe
    const defaultSettings = {
      maintenanceMode: false,
      registrationsOpen: true,
      emailNotifications: true,
      systemAlerts: true,
      ...settingsObj,
    }

    return NextResponse.json({ settings: defaultSettings })
  } catch (error) {
    console.error("Admin settings fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des paramètres" },
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
    const { action, key, value, message, schedule, enabled } = body

    if (action === "update") {
      // Mettre à jour un paramètre simple
      await db.systemSettings.upsert({
        where: { key },
        update: {
          value,
          updatedBy: sessionUser.id,
        },
        create: {
          key,
          value,
          updatedBy: sessionUser.id,
        },
      })

      // Créer un log d'audit
      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "UPDATE_SETTING",
          entity: "SYSTEM",
          entityId: key,
          metadata: {
            key,
            value,
            adminId: sessionUser.id,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Paramètre mis à jour",
      })
    }

    if (action === "maintenance") {
      // Activer/désactiver le mode maintenance
      await db.systemSettings.upsert({
        where: { key: "maintenanceMode" },
        update: {
          value: enabled,
          updatedBy: sessionUser.id,
        },
        create: {
          key: "maintenanceMode",
          value: enabled,
          updatedBy: sessionUser.id,
        },
      })

      // Sauvegarder les détails de la maintenance
      if (enabled && message) {
        await db.systemSettings.upsert({
          where: { key: "maintenanceMessage" },
          update: {
            value: { message, schedule },
            updatedBy: sessionUser.id,
          },
          create: {
            key: "maintenanceMessage",
            value: { message, schedule },
            updatedBy: sessionUser.id,
          },
        })
      }

      // Créer un log d'audit
      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: enabled ? "ENABLE_MAINTENANCE" : "DISABLE_MAINTENANCE",
          entity: "SYSTEM",
          entityId: "maintenance",
          metadata: {
            message,
            schedule,
            adminId: sessionUser.id,
          },
        },
      })

      // Créer une notification admin
      await db.adminNotification.create({
        data: {
          type: "SYSTEM",
          title: enabled ? "Mode maintenance activé" : "Mode maintenance désactivé",
          message: enabled
            ? `Maintenance activée: ${message}`
            : "Le site est de nouveau accessible",
          severity: enabled ? "WARNING" : "INFO",
          metadata: { message, schedule },
        },
      })

      // TODO: Envoyer un email à tous les utilisateurs pour les avertir
      // if (enabled) {
      //   const users = await db.user.findMany({ select: { email: true } })
      //   for (const user of users) {
      //     await sendEmail({
      //       to: user.email,
      //       subject: "Maintenance programmée - Selectif",
      //       html: `...`
      //     })
      //   }
      // }

      return NextResponse.json({
        success: true,
        message: enabled ? "Mode maintenance activé" : "Mode maintenance désactivé",
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin settings action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
