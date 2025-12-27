import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { CampaignRecipients, CampaignStatus } from "@prisma/client"
import { sendEmail } from "@/lib/email"

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const campaigns = await db.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Admin campaigns error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des campagnes" },
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
    const { action, campaignId, title, subject, bodyContent, recipients, filterPlan, filterUserType } = body

    if (action === "create") {
      const campaign = await db.emailCampaign.create({
        data: {
          title,
          subject,
          body: bodyContent,
          recipients: recipients as CampaignRecipients,
          filterPlan,
          filterUserType,
          status: "DRAFT" as CampaignStatus,
          createdBy: sessionUser.id,
        },
      })

      // Log l'action
      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "CREATE_CAMPAIGN",
          entity: "CAMPAIGN",
          entityId: campaign.id,
          metadata: { title, recipients },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Campagne créée avec succès",
        campaign,
      })
    }

    if (action === "delete") {
      await db.emailCampaign.delete({
        where: { id: campaignId },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "DELETE_CAMPAIGN",
          entity: "CAMPAIGN",
          entityId: campaignId,
          metadata: { adminId: sessionUser.id },
        },
      })

      return NextResponse.json({
        success: true,
        message: "Campagne supprimée",
      })
    }

    if (action === "send") {
      // Récupérer la campagne
      const campaign = await db.emailCampaign.findUnique({
        where: { id: campaignId },
      })

      if (!campaign) {
        return NextResponse.json({ message: "Campagne introuvable" }, { status: 404 })
      }

      // Récupérer les destinataires selon les critères
      let users: { id: string; email: string; name: string | null }[] = []

      console.log(`🔍 Type de destinataires: ${campaign.recipients}`)

      if (campaign.recipients === "ALL") {
        users = await db.user.findMany({
          select: { id: true, email: true, name: true },
        })
        console.log(`✅ Trouvé ${users.length} utilisateurs dans la base`)
      } else if (campaign.recipients === "ALL_CANDIDATES") {
        users = await db.user.findMany({
          where: { userType: "CANDIDATE" },
          select: { id: true, email: true, name: true },
        })
        console.log(`✅ Trouvé ${users.length} candidats dans la base`)
      } else if (campaign.recipients === "ALL_COMPANIES") {
        users = await db.user.findMany({
          where: { userType: "COMPANY" },
          select: { id: true, email: true, name: true },
        })
        console.log(`✅ Trouvé ${users.length} entreprises dans la base`)
      } else if (campaign.recipients === "FREE_COMPANIES") {
        users = await db.user.findMany({
          where: {
            userType: "COMPANY",
            subscription: { plan: "FREE" }
          },
          select: { id: true, email: true, name: true },
        })
        console.log(`✅ Trouvé ${users.length} entreprises gratuites`)
      } else if (campaign.recipients === "PAID_COMPANIES") {
        users = await db.user.findMany({
          where: {
            userType: "COMPANY",
            subscription: {
              plan: { in: ["BUSINESS", "ENTERPRISE"] }
            }
          },
          select: { id: true, email: true, name: true },
        })
        console.log(`✅ Trouvé ${users.length} entreprises payantes`)
      } else if (campaign.recipients === "PREMIUM_CANDIDATES") {
        users = await db.user.findMany({
          where: {
            userType: "CANDIDATE",
            subscription: { plan: "CANDIDATE_PREMIUM" }
          },
          select: { id: true, email: true, name: true },
        })
        console.log(`✅ Trouvé ${users.length} candidats premium`)
      } else if (campaign.recipients === "CUSTOM") {
        // Pour CUSTOM, on pourrait ajouter une logique spéciale
        console.log("⚠️  Type CUSTOM non implémenté")
      }

      console.log(`📧 Envoi de la campagne "${campaign.title}" à ${users.length} destinataire(s)...`)

      // Envoyer l'email à tous les destinataires
      let sentCount = 0
      let failedCount = 0

      for (const user of users) {
        const result = await sendEmail({
          to: user.email,
          subject: campaign.subject,
          html: campaign.body,
        })

        if (result.success) {
          sentCount++
        } else {
          failedCount++
          console.error(`❌ Échec d'envoi à ${user.email}:`, result.error)
        }

        // Pause de 600ms entre chaque email pour respecter la limite de 2 req/sec
        if (users.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 600))
        }
      }

      console.log(`✅ Campagne envoyée: ${sentCount} réussis, ${failedCount} échecs`)

      // Mise à jour du statut
      await db.emailCampaign.update({
        where: { id: campaignId },
        data: {
          status: "SENT" as CampaignStatus,
          sentAt: new Date(),
          totalSent: sentCount,
        },
      })

      await db.auditLog.create({
        data: {
          userId: sessionUser.id,
          action: "SEND_CAMPAIGN",
          entity: "CAMPAIGN",
          entityId: campaignId,
          metadata: {
            adminId: sessionUser.id,
            sentCount,
            failedCount,
            totalRecipients: users.length
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: `Campagne envoyée avec succès à ${sentCount} destinataire(s)`,
        sentCount,
        failedCount,
      })
    }

    return NextResponse.json({ message: "Action invalide" }, { status: 400 })
  } catch (error) {
    console.error("Admin campaign action error:", error)
    return NextResponse.json({ message: "Erreur lors de l'action" }, { status: 500 })
  }
}
