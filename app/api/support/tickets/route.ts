import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { z } from "zod"

const createTicketSchema = z.object({
  category: z.enum(["BUG", "HELP", "FEATURE", "CONTACT"]),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  userAgent: z.string().optional(),
  currentUrl: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Vous devez être connecté pour contacter le support" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = createTicketSchema.parse(body)

    // Déterminer la priorité en fonction de la catégorie
    let priority = "NORMAL"
    if (validatedData.category === "BUG") {
      priority = "HIGH"
    }

    // Créer le ticket
    const ticket = await db.supportTicket.create({
      data: {
        userId: sessionUser.id,
        category: validatedData.category,
        subject: validatedData.subject,
        description: validatedData.description,
        priority,
        userAgent: validatedData.userAgent,
        currentUrl: validatedData.currentUrl,
        metadata: {
          userType: sessionUser.userType,
          userEmail: sessionUser.email,
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            userType: true,
          },
        },
      },
    })

    // Créer une notification admin
    await db.adminNotification.create({
      data: {
        type: "SUPPORT_TICKET",
        title: `Nouveau ticket: ${validatedData.category}`,
        message: `${sessionUser.email} a créé un ticket de support: ${validatedData.subject}`,
        severity: priority === "HIGH" ? "WARNING" : "INFO",
        metadata: {
          ticketId: ticket.id,
          category: validatedData.category,
          userId: sessionUser.id,
        },
      },
    })

    // TODO: Envoyer un email à l'admin (optionnel)
    // await sendEmail({
    //   to: "admin@selectif.com",
    //   subject: `Nouveau ticket de support: ${validatedData.subject}`,
    //   html: `...`
    // })

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        category: ticket.category,
        subject: ticket.subject,
        status: ticket.status,
      },
    })
  } catch (error) {
    console.error("Support ticket creation error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la création du ticket" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    // Les utilisateurs normaux voient leurs propres tickets
    // Les admins voient tous les tickets
    const where = sessionUser.role === "ADMIN" ? {} : { userId: sessionUser.id }

    const tickets = await db.supportTicket.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            userType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error("Support tickets fetch error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération des tickets" },
      { status: 500 }
    )
  }
}
