import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { extractTextFromPDF } from "@/lib/pdf"
import { analyzeCVWithAI } from "@/lib/groq"
import { createNotification } from "@/lib/notifications"
import { sendEmail, getAIAnalysisCompleteEmailForCompany } from "@/lib/email"
import { canUseAIAnalysis, incrementAIUsage } from "@/lib/subscription"

export async function POST(
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

    // Get application with CV and job details
    const application = await db.application.findUnique({
      where: { id },
      include: {
        jobOffer: {
          select: {
            companyId: true,
            title: true,
            description: true,
            requirements: true,
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

    // Check subscription limits for AI analysis
    const limitCheck = await canUseAIAnalysis(sessionUser.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { message: limitCheck.reason },
        { status: 403 }
      )
    }

    // Check if CV exists
    if (!application.cvData) {
      return NextResponse.json(
        { message: "CV non trouvé pour cette candidature" },
        { status: 400 }
      )
    }

    // Update status to ANALYZING
    await db.application.update({
      where: { id },
      data: { status: "ANALYZING" },
    })

    try {
      // Extract text from PDF
      const cvText = await extractTextFromPDF(Buffer.from(application.cvData))

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("Impossible d'extraire le texte du CV")
      }

      // Analyze with AI
      const { score, analysis } = await analyzeCVWithAI(
        cvText,
        application.jobOffer.description,
        application.jobOffer.requirements
      )

      // Update application with AI results
      const updatedApplication = await db.application.update({
        where: { id },
        data: {
          aiScore: score,
          aiAnalysis: analysis,
          aiProcessedAt: new Date(),
          status: "ANALYZED",
        },
        include: {
          candidate: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          jobOffer: {
            select: {
              title: true,
            },
          },
        },
      })

      // Send notification to company
      await createNotification({
        userId: sessionUser.id,
        type: "AI_ANALYSIS_COMPLETE",
        title: "Analyse IA terminée",
        message: `L'analyse de ${updatedApplication.candidate?.firstName} ${updatedApplication.candidate?.lastName} est terminée (Score: ${score}/100)`,
        metadata: { applicationId: id, aiScore: score },
      })

      // Send email to company
      const candidateName = `${updatedApplication.candidate?.firstName || ""} ${updatedApplication.candidate?.lastName || ""}`.trim()
      const companyEmail = getAIAnalysisCompleteEmailForCompany({
        companyName: user.company.companyName,
        candidateName: candidateName || "Candidat",
        jobTitle: updatedApplication.jobOffer.title,
        aiScore: score,
        applicationId: id,
      })

      await sendEmail({
        to: user.email,
        subject: companyEmail.subject,
        html: companyEmail.html,
      })

      // Increment AI usage counter
      await incrementAIUsage(sessionUser.id)

      return NextResponse.json({
        success: true,
        application: updatedApplication,
      })
    } catch (aiError) {
      // If AI analysis fails, update with error
      await db.application.update({
        where: { id },
        data: {
          aiError: aiError instanceof Error ? aiError.message : "Erreur inconnue",
          status: "PENDING", // Back to PENDING if analysis fails
        },
      })

      throw aiError
    }
  } catch (error) {
    console.error("Application analysis error:", error)
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'analyse de la candidature",
      },
      { status: 500 }
    )
  }
}
