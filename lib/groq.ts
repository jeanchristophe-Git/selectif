import Groq from "groq-sdk"

// Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface CVAnalysisResult {
  score: number
  analysis: string
}

/**
 * Analyze a CV using Groq AI (LLaMA 3.1 8B Instant)
 * @param cvText - Extracted text from the CV PDF
 * @param jobDescription - The job description
 * @param jobRequirements - The job requirements
 * @returns AI score (0-100) and detailed analysis
 */
export async function analyzeCVWithAI(
  cvText: string,
  jobDescription: string,
  jobRequirements: string
): Promise<CVAnalysisResult> {
  try {
    const prompt = `Tu es un expert en recrutement. Analyse ce CV par rapport à l'offre d'emploi et fournis un score de 0 à 100 ainsi qu'une analyse détaillée.

**Offre d'emploi:**
Description: ${jobDescription}

Exigences: ${jobRequirements}

**CV du candidat:**
${cvText}

**Instructions:**
1. Analyse les compétences, l'expérience et la formation du candidat
2. Compare-les aux exigences du poste
3. Donne un score de 0 à 100 (0 = pas du tout qualifié, 100 = parfaitement qualifié)
4. Fournis une analyse détaillée en français (200-300 mots) qui explique:
   - Les points forts du candidat pour ce poste
   - Les points faibles ou manques
   - Les compétences transférables
   - Une recommandation finale

**Format de réponse (STRICT):**
SCORE: [nombre entre 0 et 100]
ANALYSE: [ton analyse détaillée ici]`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Low temperature for consistent scoring
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || ""

    // Parse the response
    const scoreMatch = response.match(/SCORE:\s*(\d+)/)
    const analysisMatch = response.match(/ANALYSE:\s*([\s\S]+)/)

    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0
    const analysis = analysisMatch ? analysisMatch[1].trim() : response

    // Ensure score is between 0 and 100
    const normalizedScore = Math.max(0, Math.min(100, score))

    return {
      score: normalizedScore,
      analysis: analysis || "Analyse non disponible",
    }
  } catch (error) {
    console.error("Groq AI analysis error:", error)
    throw new Error("Erreur lors de l'analyse du CV par l'IA")
  }
}
