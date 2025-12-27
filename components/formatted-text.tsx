"use client"

import React from "react"

interface FormattedTextProps {
  text: string
  className?: string
}

/**
 * Composant qui formate automatiquement du texte brut en HTML structuré
 * Détecte les titres, listes à puces, paragraphes, etc.
 */
export function FormattedText({ text, className = "" }: FormattedTextProps) {
  const formatText = (rawText: string): React.ReactNode[] => {
    const lines = rawText.split("\n")
    const elements: React.ReactNode[] = []
    let currentList: string[] = []
    let listKey = 0
    let elementKey = 0

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-2 mb-4 ml-4">
            {currentList.map((item, idx) => (
              <li key={idx} className="text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        )
        currentList = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Ligne vide
      if (!line) {
        flushList()
        continue
      }

      // Détection des titres principaux (##, === ou ligne courte en majuscules)
      if (
        line.startsWith("##") ||
        line.startsWith("===") ||
        (line === line.toUpperCase() &&
          line.length < 60 &&
          line.length > 3 &&
          !line.startsWith("-") &&
          !line.startsWith("•") &&
          !line.match(/^\d+\./))
      ) {
        flushList()
        const title = line.replace(/^##\s*/, "").replace(/^===\s*/, "")
        elements.push(
          <h2
            key={`h2-${elementKey++}`}
            className="text-xl font-bold mt-6 mb-3 text-foreground"
          >
            {title}
          </h2>
        )
        continue
      }

      // Détection des sous-titres (### ou ligne se terminant par :)
      if (line.startsWith("###") || (line.endsWith(":") && line.length < 80)) {
        flushList()
        const subtitle = line.replace(/^###\s*/, "")
        elements.push(
          <h3
            key={`h3-${elementKey++}`}
            className="text-lg font-semibold mt-4 mb-2 text-foreground"
          >
            {subtitle}
          </h3>
        )
        continue
      }

      // Détection des listes à puces (-, •, *, ou numérotées)
      const bulletMatch = line.match(/^[-•*]\s+(.+)/)
      const numberedMatch = line.match(/^\d+\.\s+(.+)/)

      if (bulletMatch || numberedMatch) {
        const content = bulletMatch ? bulletMatch[1] : numberedMatch![1]
        currentList.push(content)
        continue
      }

      // Paragraphe normal
      flushList()

      // Détection du texte en gras (**texte** ou __texte__)
      const formattedLine = line
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
        .replace(/_(.+?)_/g, '<em class="italic">$1</em>')

      elements.push(
        <p
          key={`p-${elementKey++}`}
          className="text-sm leading-relaxed mb-3 text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      )
    }

    flushList()
    return elements
  }

  return <div className={className}>{formatText(text)}</div>
}
