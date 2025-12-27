import { Resend } from "resend"

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Sender email (use Resend sandbox for testing)
const FROM_EMAIL = "Selectif <onboarding@resend.dev>"

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    console.log("Attempting to send email to:", to)
    console.log("From:", FROM_EMAIL)
    console.log("Subject:", subject)

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    })

    if (error) {
      console.error("❌ Resend error:", error)
      return { success: false, error }
    }

    console.log("✅ Email sent successfully! ID:", data?.id)
    return { success: true, data }
  } catch (error) {
    console.error("❌ Failed to send email (exception):", error)
    return { success: false, error }
  }
}

// Email Templates

export function getNewApplicationEmailForCompany(params: {
  companyName: string
  candidateName: string
  jobTitle: string
  jobId: string
}) {
  return {
    subject: `📥 Nouvelle candidature - ${params.jobTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">📥 Nouvelle Candidature</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${params.companyName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Bonne nouvelle ! Vous avez reçu une nouvelle candidature pour votre offre :
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <p style="margin: 0; color: #667eea; font-weight: bold; font-size: 18px;">${params.jobTitle}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Candidat : <strong>${params.candidateName}</strong></p>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      L'analyse IA du CV sera disponible sous peu. Vous recevrez une notification dès qu'elle sera prête.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/applications"
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Voir la candidature
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
    `,
  }
}

export function getApplicationConfirmationEmailForCandidate(params: {
  candidateName: string
  jobTitle: string
  companyName: string
}) {
  return {
    subject: `✅ Candidature envoyée - ${params.jobTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">✅ Candidature Envoyée</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${params.candidateName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Votre candidature a bien été envoyée ! 🎉
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
      <p style="margin: 0; color: #10b981; font-weight: bold; font-size: 18px;">${params.jobTitle}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Entreprise : <strong>${params.companyName}</strong></p>
    </div>

    <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>💡 Prochaines étapes :</strong><br>
        • Votre CV sera analysé par notre IA<br>
        • L'entreprise examinera votre profil<br>
        • Vous serez notifié de tout changement de statut
      </p>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      Nous vous tiendrons informé par email de l'évolution de votre candidature.
    </p>

    <p style="font-size: 16px; margin: 20px 0;">
      Bonne chance ! 🍀
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
    `,
  }
}

export function getAIAnalysisCompleteEmailForCompany(params: {
  companyName: string
  candidateName: string
  jobTitle: string
  aiScore: number
  applicationId: string
}) {
  const scoreColor = params.aiScore >= 75 ? "#10b981" : params.aiScore >= 50 ? "#f59e0b" : "#ef4444"
  const scoreLabel = params.aiScore >= 75 ? "Excellent" : params.aiScore >= 50 ? "Bon" : "Moyen"

  return {
    subject: `🤖 Analyse IA terminée - ${params.candidateName} (${params.aiScore}/100)`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🤖 Analyse IA Terminée</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${params.companyName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      L'analyse IA du CV de <strong>${params.candidateName}</strong> est terminée :
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${scoreColor}; margin: 20px 0;">
      <p style="margin: 0; color: #666; font-size: 14px;">Offre : <strong>${params.jobTitle}</strong></p>
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 48px; font-weight: bold; color: ${scoreColor}; margin-bottom: 5px;">${params.aiScore}</div>
        <div style="font-size: 18px; color: ${scoreColor}; font-weight: bold;">${scoreLabel}</div>
        <div style="font-size: 14px; color: #666; margin-top: 5px;">/100</div>
      </div>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      Consultez l'analyse détaillée pour voir les compétences, l'expérience et les recommandations de l'IA.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/applications"
         style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Voir l'analyse complète
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
    `,
  }
}

export function getShortlistedEmailForCandidate(params: {
  candidateName: string
  jobTitle: string
  companyName: string
}) {
  return {
    subject: `🎉 Bonne nouvelle - ${params.jobTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Vous êtes présélectionné !</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Félicitations <strong>${params.candidateName}</strong> ! 🎊</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Votre profil a retenu l'attention de <strong>${params.companyName}</strong> !
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
      <p style="margin: 0; color: #f59e0b; font-weight: bold; font-size: 18px;">${params.jobTitle}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Entreprise : <strong>${params.companyName}</strong></p>
    </div>

    <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>⭐ Statut : Présélectionné</strong><br>
        Votre candidature fait partie des meilleures ! L'entreprise pourrait vous contacter prochainement pour la suite du processus de recrutement.
      </p>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      Nous vous conseillons de :
    </p>

    <ul style="font-size: 14px; color: #666;">
      <li>Préparer un entretien</li>
      <li>Vérifier votre disponibilité</li>
      <li>Vous renseigner davantage sur l'entreprise</li>
    </ul>

    <p style="font-size: 16px; margin: 20px 0;">
      Bonne chance pour la suite ! 🍀
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
    `,
  }
}

export function getRejectedEmailForCandidate(params: {
  candidateName: string
  jobTitle: string
  companyName: string
}) {
  return {
    subject: `Mise à jour de votre candidature - ${params.jobTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Mise à jour de votre candidature</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>${params.candidateName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Nous vous remercions de l'intérêt que vous avez porté à l'offre suivante :
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #6b7280; margin: 20px 0;">
      <p style="margin: 0; color: #6b7280; font-weight: bold; font-size: 18px;">${params.jobTitle}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Entreprise : <strong>${params.companyName}</strong></p>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      Après étude attentive de votre candidature, nous avons le regret de vous informer que votre profil n'a pas été retenu pour cette opportunité.
    </p>

    <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #374151;">
        <strong>💡 Nos encouragements :</strong><br>
        • Votre profil pourrait correspondre à d'autres opportunités<br>
        • Nous vous encourageons à postuler à de nouvelles offres<br>
        • Chaque candidature est une expérience enrichissante
      </p>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      Nous vous souhaitons plein succès dans vos recherches et espérons avoir l'occasion de collaborer avec vous à l'avenir.
    </p>

    <p style="font-size: 16px; margin: 20px 0;">
      Cordialement,<br>
      L'équipe <strong>${params.companyName}</strong>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
    `,
  }
}

export function getContactedEmailForCandidate(params: {
  candidateName: string
  jobTitle: string
  companyName: string
}) {
  return {
    subject: `🎯 Excellente nouvelle - ${params.jobTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Vous avez été contacté !</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Excellente nouvelle <strong>${params.candidateName}</strong> ! 🎉</p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>${params.companyName}</strong> souhaite échanger avec vous concernant votre candidature :
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
      <p style="margin: 0; color: #3b82f6; font-weight: bold; font-size: 18px;">${params.jobTitle}</p>
      <p style="margin: 10px 0 0 0; color: #666;">Entreprise : <strong>${params.companyName}</strong></p>
    </div>

    <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1e3a8a;">
        <strong>📞 Statut : Contacté</strong><br>
        L'entreprise va prendre contact avec vous prochainement pour discuter de la suite du processus de recrutement. Vérifiez régulièrement vos emails et votre téléphone !
      </p>
    </div>

    <p style="font-size: 16px; margin: 20px 0;">
      <strong>Conseils pour la suite :</strong>
    </p>

    <ul style="font-size: 14px; color: #666;">
      <li>Assurez-vous que vos coordonnées sont à jour</li>
      <li>Préparez-vous pour un éventuel entretien téléphonique</li>
      <li>Relisez l'offre et vos motivations pour le poste</li>
      <li>Renseignez-vous sur l'entreprise et son secteur</li>
    </ul>

    <p style="font-size: 16px; margin: 20px 0;">
      Félicitations pour ce progrès dans votre candidature ! 🍀
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 14px; color: #666; text-align: center; margin: 0;">
      Propulsé par <strong>Selectif</strong> - Recrutement assisté par IA
    </p>
  </div>
</body>
</html>
    `,
  }
}
