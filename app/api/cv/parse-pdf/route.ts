import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"

// @ts-ignore - pdf-parse doesn't have proper types
const pdfParse = require("pdf-parse")

// POST - Parser un CV PDF et extraire le texte
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser || sessionUser.userType !== "CANDIDATE") {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { message: "Fichier PDF requis" },
        { status: 400 }
      )
    }

    // Vérifier que c'est bien un PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { message: "Le fichier doit être un PDF" },
        { status: 400 }
      )
    }

    // Limiter la taille du fichier à 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "Le fichier ne doit pas dépasser 5MB" },
        { status: 400 }
      )
    }

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parser le PDF
    const data = await pdfParse(buffer)

    // Extraire le texte
    const cvText = data.text

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { message: "Impossible d'extraire le texte du PDF. Assurez-vous que le PDF contient du texte." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      cvText: cvText.trim(),
      fileName: file.name,
      pages: data.numpages
    })
  } catch (error) {
    console.error("Parse PDF error:", error)
    return NextResponse.json(
      { message: "Erreur lors de l'analyse du PDF" },
      { status: 500 }
    )
  }
}
