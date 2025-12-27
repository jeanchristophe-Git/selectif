import pdfParse from "pdf-parse/lib/pdf-parse.js"

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as Buffer (from database Bytes field)
 * @returns Extracted text content
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Erreur lors de l'extraction du texte du PDF")
  }
}
