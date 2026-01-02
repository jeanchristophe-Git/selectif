/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as Buffer (from database Bytes field)
 * @returns Extracted text content
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid loading pdf-parse during build time
    // @ts-ignore - pdf-parse doesn't have proper types
    const pdfParse = (await import("pdf-parse")).default
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    console.error("PDF extraction error:", error)
    throw new Error("Erreur lors de l'extraction du texte du PDF")
  }
}
