import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import {  updateApplicationStatusSchema } from "@/lib/validations/application"
import { z } from "zod"
import { createNotification } from "@/lib/notifications"
import { sendEmail, getShortlistedEmailForCandidate, getRejectedEmailForCandidate, getContactedEmailForCandidate } from "@/lib/email"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json(
        { message: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = updateApplicationStatusSchema.parse(body)

    // Get user's company
    const user = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: { company: true },
    })

    if (!user?.company) {
      return NextResponse.json(
        { message: "Profil entreprise requis" },
        { status: 403 }
      )
    }

    // Get application to verify ownership
    const application = await db.application.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        jobOffer: {
          select: {
            companyId: true,
            title: true,
          },
          include: {
            company: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { message: "Candidature non trouvée" },
        { status: 404 }
      )
    }

    // Verify ownership
    if (application.jobOffer.companyId !== user.company.id) {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Update application status
    const updatedApplication = await db.application.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
      include: {
        candidate: {
          select: {
            firstName: true,
            lastName: true,
            userId: true,
          },
        },
        jobOffer: {
          select: {
            title: true,
          },
        },
      },
    })

    // Send notifications and emails based on status change
    const candidateName = `${application.candidate?.firstName || ""} ${application.candidate?.lastName || ""}`.trim()
    const candidateEmail = application.candidate?.user?.email
    const companyName = application.jobOffer.company?.companyName || "l'entreprise"
    const jobTitle = application.jobOffer.title

    if (validatedData.status === "SHORTLISTED" && candidateEmail) {
      // Notify candidate they've been shortlisted
      if (application.candidate?.userId) {
        await createNotification({
          userId: application.candidate.userId,
          type: "SHORTLIST_UPDATED",
          title: "Vous avez été présélectionné !",
          message: `Bonne nouvelle ! Vous avez été présélectionné pour le poste ${jobTitle}`,
          metadata: { applicationId: id, jobOfferId: application.jobOffer.companyId },
        })
      }

      const email = getShortlistedEmailForCandidate({
        candidateName: candidateName || "Candidat",
        jobTitle,
        companyName,
      })

      await sendEmail({
        to: candidateEmail,
        subject: email.subject,
        html: email.html,
      })
    }

    if (validatedData.status === "REJECTED" && candidateEmail) {
      // Notify candidate of rejection
      if (application.candidate?.userId) {
        await createNotification({
          userId: application.candidate.userId,
          type: "APPLICATION_STATUS_CHANGED",
          title: "Mise à jour de votre candidature",
          message: `Votre candidature pour ${jobTitle} n'a pas été retenue cette fois-ci`,
          metadata: { applicationId: id, status: "REJECTED" },
        })
      }

      const email = getRejectedEmailForCandidate({
        candidateName: candidateName || "Candidat",
        jobTitle,
        companyName,
      })

      await sendEmail({
        to: candidateEmail,
        subject: email.subject,
        html: email.html,
      })
    }

    if (validatedData.status === "CONTACTED" && candidateEmail) {
      // Notify candidate they've been contacted
      if (application.candidate?.userId) {
        await createNotification({
          userId: application.candidate.userId,
          type: "APPLICATION_STATUS_CHANGED",
          title: "Vous avez été contacté !",
          message: `${companyName} vous a contacté concernant le poste ${jobTitle}`,
          metadata: { applicationId: id, status: "CONTACTED" },
        })
      }

      const email = getContactedEmailForCandidate({
        candidateName: candidateName || "Candidat",
        jobTitle,
        companyName,
      })

      await sendEmail({
        to: candidateEmail,
        subject: email.subject,
        html: email.html,
      })
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Application status update error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Données invalides", errors: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    )
  }
}
