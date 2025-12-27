import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// POST - Adapter le CV à une offre d'emploi spécifique
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Vérifier l'accès premium
    const subscription = await db.subscription.findUnique({
      where: { userId: sessionUser.id },
    })

    if (subscription?.plan !== "CANDIDATE_PREMIUM") {
      return NextResponse.json(
        { message: "Le CV Builder est réservé aux membres Premium" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { jobOffer, currentCV, cvText } = body

    if (!jobOffer) {
      return NextResponse.json(
        { message: "Offre d'emploi requise" },
        { status: 400 }
      )
    }

    if (!currentCV && !cvText) {
      return NextResponse.json(
        { message: "CV actuel (structuré ou texte) requis" },
        { status: 400 }
      )
    }

    // Construire le prompt pour adapter le CV
    let cvContent = ""

    if (cvText) {
      // Si le CV est un texte extrait d'un PDF
      cvContent = `CV ACTUEL DU CANDIDAT (extrait du PDF):\n${cvText}`
    } else {
      // Si le CV est structuré
      cvContent = `CV ACTUEL DU CANDIDAT:
Titre: ${currentCV.personalInfo.title || "Non spécifié"}
Résumé: ${currentCV.personalInfo.summary || "Non spécifié"}
Expériences: ${JSON.stringify(currentCV.experience || [], null, 2)}
Formation: ${JSON.stringify(currentCV.education || [], null, 2)}
Compétences: ${JSON.stringify(currentCV.skills || [], null, 2)}`
    }

    const prompt = `Tu es un expert en optimisation de CV. Un candidat souhaite adapter son CV à une offre d'emploi spécifique.

OFFRE D'EMPLOI:
${jobOffer}

${cvContent}

INSTRUCTIONS CRITIQUES:
1. **NE PAS INVENTER** de fausses informations - utilise UNIQUEMENT les vraies expériences et compétences du candidat
2. **RÉORGANISE et REFORMULE** le contenu existant pour correspondre au poste
3. **ADAPTE le résumé professionnel** pour qu'il mette en avant les compétences pertinentes pour l'offre
4. **PRIORISE les expériences** les plus pertinentes en premier
5. **REFORMULE les descriptions d'expérience** pour utiliser le vocabulaire de l'offre (mots-clés ATS)
6. **AJUSTE les compétences** pour mettre en avant celles requises par l'offre (parmi celles que le candidat possède déjà)
7. Si le candidat n'a pas certaines compétences requises, ne les ajoute PAS
8. **OPTIMISE pour les ATS** en incluant les mots-clés exacts de l'offre quand c'est pertinent

IMPORTANT - Réponds avec un JSON valide contenant la structure suivante:
{
  "personalInfo": {
    "title": "Titre professionnel adapté à l'offre",
    "summary": "Résumé professionnel de 3-4 phrases optimisé pour l'offre avec mots-clés pertinents"
  },
  "experience": [
    {
      "id": "unique-id",
      "company": "Nom entreprise",
      "position": "Titre du poste",
      "startDate": "MM/AAAA",
      "endDate": "MM/AAAA",
      "current": false,
      "description": "Description reformulée avec verbes d'action et vocabulaire de l'offre. Focalise sur les réalisations pertinentes pour le poste visé. Quantifie quand possible."
    }
  ],
  "education": [
    {
      "id": "unique-id",
      "school": "Établissement",
      "degree": "Diplôme",
      "field": "Domaine d'études",
      "startDate": "MM/AAAA",
      "endDate": "MM/AAAA",
      "current": false
    }
  ],
  "skills": [
    {
      "id": "unique-id",
      "name": "Compétence (parmi celles du candidat)",
      "level": "Expert|Avancé|Intermédiaire|Débutant"
    }
  ]
}

GARDE le même nombre d'expériences, formations et compétences. Ne supprime rien, réorganise et reformule pour matcher l'offre.`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un expert en optimisation de CV qui génère uniquement du JSON valide. Tu ne dois JAMAIS inventer de fausses informations, seulement reformuler et réorganiser le contenu existant du candidat."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Plus bas pour rester fidèle aux informations existantes
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    const content = chatCompletion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { message: "Erreur lors de la génération par l'IA" },
        { status: 500 }
      )
    }

    const adaptedCV = JSON.parse(content)

    // Ajouter des IDs uniques si nécessaire
    if (adaptedCV.experience) {
      adaptedCV.experience = adaptedCV.experience.map((exp: any, idx: number) => ({
        ...exp,
        id: exp.id || `exp-${Date.now()}-${idx}`
      }))
    }

    if (adaptedCV.education) {
      adaptedCV.education = adaptedCV.education.map((edu: any, idx: number) => ({
        ...edu,
        id: edu.id || `edu-${Date.now()}-${idx}`
      }))
    }

    if (adaptedCV.skills) {
      adaptedCV.skills = adaptedCV.skills.map((skill: any, idx: number) => ({
        ...skill,
        id: skill.id || `skill-${Date.now()}-${idx}`
      }))
    }

    // Log dans l'audit
    await db.auditLog.create({
      data: {
        userId: sessionUser.id,
        action: "ADAPT_CV_TO_JOB",
        entity: "CV",
        entityId: sessionUser.id,
        metadata: {
          jobOfferLength: jobOffer.length,
          adapted: true
        },
      },
    })

    return NextResponse.json({
      success: true,
      cv: adaptedCV,
      message: "CV adapté avec succès à l'offre d'emploi"
    })
  } catch (error) {
    console.error("Adapt CV error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'adaptation du CV" },
      { status: 500 }
    )
  }
}
