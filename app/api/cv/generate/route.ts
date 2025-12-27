import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Générer un CV complet avec l'IA
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const body = await req.json()
    const { jobTitle, yearsExperience, skills, education, targetIndustry, language = "fr" } = body

    // Validation
    if (!jobTitle) {
      return NextResponse.json(
        { message: "Le titre du poste est requis" },
        { status: 400 }
      )
    }

    // Prompt pour générer un CV professionnel complet
    const prompt = `Tu es un expert en rédaction de CV professionnels. Génère un CV optimisé et moderne pour un candidat avec les informations suivantes:

- Titre du poste visé: ${jobTitle}
- Années d'expérience: ${yearsExperience || "débutant"}
- Compétences: ${skills || "à définir"}
- Formation: ${education || "à définir"}
- Secteur cible: ${targetIndustry || "général"}

IMPORTANT:
- Utilise des verbes d'action percutants
- Quantifie les résultats (%, chiffres, métriques)
- Adapte le ton au secteur professionnel
- Optimise pour les ATS (Applicant Tracking Systems)
- Utilise des mots-clés pertinents pour le poste
- Crée 3 expériences professionnelles fictives mais réalistes et détaillées
- Crée 2-3 formations pertinentes
- Suggère 8-10 compétences techniques et soft skills
- Rédige un résumé professionnel impactant de 3-4 phrases

Réponds UNIQUEMENT avec un JSON valide dans ce format exact (sans markdown, sans backticks):
{
  "personalInfo": {
    "title": "Titre professionnel accrocheur",
    "summary": "Résumé professionnel percutant de 3-4 phrases avec mots-clés"
  },
  "experience": [
    {
      "position": "Titre du poste",
      "company": "Nom de l'entreprise",
      "startDate": "2020-01",
      "endDate": "2023-12",
      "current": false,
      "description": "• Accomplissement avec résultat quantifié\\n• Autre réalisation avec impact mesurable\\n• Responsabilité clé avec métrique"
    }
  ],
  "education": [
    {
      "degree": "Diplôme",
      "field": "Domaine d'études",
      "school": "Nom de l'établissement",
      "startDate": "2015-09",
      "endDate": "2018-06",
      "current": false
    }
  ],
  "skills": [
    {
      "name": "Compétence technique ou soft skill",
      "level": "Expert"
    }
  ]
}`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un expert en rédaction de CV qui génère des CV optimisés pour maximiser les chances d'être recruté. Tu réponds toujours avec du JSON valide, sans texte additionnel."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    })

    const content = chatCompletion.choices[0]?.message?.content

    if (!content) {
      throw new Error("Aucune réponse de l'IA")
    }

    const generatedCV = JSON.parse(content)

    // Ajouter des IDs uniques aux éléments des arrays
    if (generatedCV.experience) {
      generatedCV.experience = generatedCV.experience.map((exp: any, idx: number) => ({
        ...exp,
        id: `exp-${Date.now()}-${idx}`
      }))
    }

    if (generatedCV.education) {
      generatedCV.education = generatedCV.education.map((edu: any, idx: number) => ({
        ...edu,
        id: `edu-${Date.now()}-${idx}`
      }))
    }

    if (generatedCV.skills) {
      generatedCV.skills = generatedCV.skills.map((skill: any, idx: number) => ({
        ...skill,
        id: `skill-${Date.now()}-${idx}`
      }))
    }

    return NextResponse.json({
      success: true,
      cv: generatedCV,
    })
  } catch (error) {
    console.error("CV generation error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la génération du CV", error: String(error) },
      { status: 500 }
    )
  }
}

// Améliorer une section spécifique avec l'IA
export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const body = await req.json()
    const { section, content, context } = body

    let prompt = ""

    switch (section) {
      case "summary":
        prompt = `Améliore ce résumé professionnel pour le rendre plus percutant et optimisé ATS. Contexte: ${context || "professionnel général"}

Résumé actuel: "${content}"

Rends-le plus impactant avec:
- Verbes d'action forts
- Mots-clés du secteur
- Résultats quantifiables si possible
- 3-4 phrases maximum
- Ton professionnel et confiant

Réponds UNIQUEMENT avec le résumé amélioré, sans explication.`
        break

      case "experience":
        prompt = `Améliore cette description d'expérience professionnelle pour la rendre plus percutante:

Description actuelle: "${content}"
Contexte: ${context || ""}

Transforme-la en points d'accomplissements avec:
- Verbes d'action au début de chaque point
- Résultats quantifiés (%, nombres, métriques)
- Format: • Point 1\\n• Point 2\\n• Point 3
- 3-5 points maximum
- Focus sur l'impact et les résultats

Réponds UNIQUEMENT avec la description améliorée, sans explication.`
        break

      case "skills":
        prompt = `Génère une liste de compétences pertinentes pour: ${context}

Compétences actuelles: ${content || "aucune"}

Suggère 8-10 compétences incluant:
- Compétences techniques du domaine
- Soft skills valorisées
- Outils et technologies
- Mix de compétences demandées par les recruteurs

Réponds avec un JSON array: [{"name": "Compétence", "level": "Expert|Avancé|Intermédiaire"}]`
        break

      default:
        return NextResponse.json({ message: "Section invalide" }, { status: 400 })
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Tu es un expert en rédaction de CV qui améliore le contenu pour maximiser l'impact et l'attractivité auprès des recruteurs."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 1000,
    })

    const improvedContent = chatCompletion.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      improved: improvedContent,
    })
  } catch (error) {
    console.error("Content improvement error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'amélioration du contenu" },
      { status: 500 }
    )
  }
}
