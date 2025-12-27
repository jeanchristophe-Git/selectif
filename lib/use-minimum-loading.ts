import { useState, useEffect } from "react"

/**
 * Hook qui garantit un temps de chargement minimum pour éviter les flash de contenu
 * @param isLoading - État de chargement actuel
 * @param minDuration - Durée minimale en millisecondes (défaut: 800ms)
 * @returns État de chargement avec durée minimale garantie
 */
export function useMinimumLoading(isLoading: boolean, minDuration: number = 800): boolean {
  const [isMinimumLoading, setIsMinimumLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minDuration - elapsed)

      const timer = setTimeout(() => {
        setIsMinimumLoading(false)
      }, remaining)

      return () => clearTimeout(timer)
    }
  }, [isLoading, minDuration, startTime])

  return isLoading || isMinimumLoading
}
