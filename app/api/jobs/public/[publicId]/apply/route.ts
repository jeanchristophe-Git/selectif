import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import { sendEmail, getNewApplicationEmailForCompany, getApplicationConfirmationEmailForCandidate } from "@/lib/email"
import { canReceiveApplication } from "@/lib/subscription"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params

    // Get job offer
    const jobOffer = await db.jobOffer.findFirst({
      where: {
        publicId,
        status: "PUBLISHED",
      },
    })

    if (!jobOffer) {
      return NextResponse.json(
        { message: "Offre non trouvée ou non publiée" },
        { status: 404 }
      )
    }

    // Check if job offer can receive more applications
    const limitCheck = await canReceiveApplication(jobOffer.id)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { message: limitCheck.reason },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await req.formData()
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const linkedinUrl = (formData.get("linkedinUrl") as string) || null
    const motivationLetter = (formData.get("motivationLetter") as string) || null
    const consentGiven = formData.get("consentGiven") === "true"
    const cvFile = formData.get("cv") as File

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !cvFile || !consentGiven) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      )
    }

    // Validate CV file
    if (cvFile.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Le CV doit être au format PDF" },
        { status: 400 }
      )
    }

    if (cvFile.size > 5 * 1024 * 1024) {
      // 5MB max
      return NextResponse.json(
        { message: "Le CV ne doit pas dépasser 5MB" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await cvFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Calculate data retention (6 months from now - GDPR compliance)
    const dataRetentionUntil = new Date()
    dataRetentionUntil.setMonth(dataRetentionUntil.getMonth() + 6)

    // Create application (guest user)
    const application = await db.application.create({
      data: {
        jobOfferId: jobOffer.id,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestEmail: email,
        guestPhone: phone,
        linkedinUrl,
        motivationLetter,
        cvData: buffer,
        cvFileName: cvFile.name,
        cvFileSize: cvFile.size,
        cvMimeType: cvFile.type,
        consentGiven: true,
        dataRetentionUntil,
        status: "PENDING",
      },
    })

    // Get company info for notification
    const company = await db.company.findUnique({
      where: { id: jobOffer.companyId },
      include: { user: true },
    })

    // Create notification for company
    if (company) {
      await createNotification({
        userId: company.userId,
        type: "NEW_APPLICATION",
        title: "Nouvelle candidature reçue",
        message: `${firstName} ${lastName} a postulé pour ${jobOffer.title}`,
        metadata: {
          applicationId: application.id,
          jobOfferId: jobOffer.id,
        },
      })

      // Send email to company
      const companyEmail = getNewApplicationEmailForCompany({
        companyName: company.companyName,
        candidateName: `${firstName} ${lastName}`,
        jobTitle: jobOffer.title,
        jobId: jobOffer.id,
      })
      await sendEmail({
        to: company.user.email,
        subject: companyEmail.subject,
        html: companyEmail.html,
      })
    }

    // Send confirmation email to candidate
    const candidateEmail = getApplicationConfirmationEmailForCandidate({
      candidateName: `${firstName} ${lastName}`,
      jobTitle: jobOffer.title,
      companyName: company?.companyName || "l'entreprise",
    })
    await sendEmail({
      to: email,
      subject: candidateEmail.subject,
      html: candidateEmail.html,
    })

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
      },
    })
  } catch (error) {
    console.error("Application submission error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'envoi de la candidature" },
      { status: 500 }
    )
  }
}
