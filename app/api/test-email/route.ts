import { NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"
import { getSessionUser } from "@/lib/auth-utils"

// POST - Test email sending
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 })
    }

    const body = await req.json()
    const { testEmail } = body

    const emailTo = testEmail || sessionUser.email

    const result = await sendEmail({
      to: emailTo,
      subject: "Test Selectif - Email de test",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Test Email Selectif</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${sessionUser.name}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Cet email est un test pour vérifier que l'intégration Resend fonctionne correctement.
    </p>

    <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold; font-size: 18px;">✅ L'envoi d'emails fonctionne !</p>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      <strong>Informations de test:</strong><br>
      Email: ${emailTo}<br>
      Date: ${new Date().toLocaleString('fr-FR')}<br>
      Environment: ${process.env.NODE_ENV}
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
      `
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email de test envoyé avec succès à ${emailTo}`,
        data: result.data
      })
    } else {
      return NextResponse.json({
        success: false,
        message: "Erreur lors de l'envoi de l'email de test",
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Test email error:", error)
    return NextResponse.json(
      { message: "Erreur lors du test d'envoi d'email", error: String(error) },
      { status: 500 }
    )
  }
}
