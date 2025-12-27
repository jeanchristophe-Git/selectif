import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

// GET - Récupérer le CV du candidat
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Vérifier que le candidat a un profil
    const candidate = await db.candidate.findUnique({
      where: { userId: sessionUser.id },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Profil candidat introuvable" }, { status: 404 })
    }

    // Récupérer le CV par défaut ou le premier CV
    const cv = await db.cV.findFirst({
      where: { candidateId: candidate.id },
      orderBy: [
        { isDefault: "desc" },
        { updatedAt: "desc" }
      ]
    })

    // Retourner null si pas de CV au lieu d'une erreur 404
    return NextResponse.json({ cv: cv || null })
  } catch (error) {
    console.error("Get CV error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la récupération du CV" },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour le CV
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Vérifier l'accès premium pour le CV Builder
    const subscription = await db.subscription.findUnique({
      where: { userId: sessionUser.id },
    })

    if (subscription?.plan !== "CANDIDATE_PREMIUM") {
      return NextResponse.json(
        { message: "Le CV Builder est réservé aux membres Premium" },
        { status: 403 }
      )
    }

    // Vérifier que le candidat a un profil
    const candidate = await db.candidate.findUnique({
      where: { userId: sessionUser.id },
    })

    if (!candidate) {
      return NextResponse.json({ message: "Profil candidat introuvable" }, { status: 404 })
    }

    const body = await req.json()
    const { personalInfo, experience, education, skills, languages } = body

    // Validation basique
    if (!personalInfo?.fullName || !personalInfo?.email) {
      return NextResponse.json(
        { message: "Nom complet et email sont requis" },
        { status: 400 }
      )
    }

    // Chercher un CV existant
    const existingCV = await db.cV.findFirst({
      where: { candidateId: candidate.id },
      orderBy: { updatedAt: "desc" }
    })

    let cv

    if (existingCV) {
      // Mettre à jour le CV existant
      cv = await db.cV.update({
        where: { id: existingCV.id },
        data: {
          fullName: personalInfo.fullName,
          email: personalInfo.email,
          phone: personalInfo.phone || null,
          location: personalInfo.location || null,
          title: personalInfo.title || null,
          summary: personalInfo.summary || null,
          experience: experience || [],
          education: education || [],
          skills: skills || [],
          languages: languages || [],
        },
      })
    } else {
      // Créer un nouveau CV (premier CV = défaut)
      cv = await db.cV.create({
        data: {
          candidateId: candidate.id,
          fullName: personalInfo.fullName,
          email: personalInfo.email,
          phone: personalInfo.phone || null,
          location: personalInfo.location || null,
          title: personalInfo.title || null,
          summary: personalInfo.summary || null,
          experience: experience || [],
          education: education || [],
          skills: skills || [],
          languages: languages || [],
          isDefault: true, // Premier CV = défaut
        },
      })
    }

    // Log dans l'audit
    await db.auditLog.create({
      data: {
        userId: sessionUser.id,
        action: existingCV ? "UPDATE_CV" : "CREATE_CV",
        entity: "CV",
        entityId: cv.id,
        metadata: { candidateId: candidate.id },
      },
    })

    return NextResponse.json({
      success: true,
      message: existingCV ? "CV mis à jour avec succès" : "CV créé avec succès",
      cv,
    })
  } catch (error) {
    console.error("Save CV error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la sauvegarde du CV" },
      { status: 500 }
    )
  }
}
