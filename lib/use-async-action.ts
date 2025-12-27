import { useState, useCallback } from "react"
import { toast } from "sonner"

interface AsyncActionOptions {
  onSuccess?: (data?: any) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  loadingMessage?: string
}

interface AsyncActionReturn<T> {
  execute: (action: () => Promise<T>) => Promise<T | undefined>
  isLoading: boolean
  error: Error | null
  data: T | null
}

/**
 * Hook pour gérer les actions asynchrones avec états de chargement et gestion d'erreur
 *
 * @example
 * const { execute, isLoading } = useAsyncAction({
 *   successMessage: "Sauvegardé avec succès",
 *   errorMessage: "Erreur lors de la sauvegarde"
 * })
 *
 * const handleSave = async () => {
 *   await execute(async () => {
 *     return await saveData()
 *   })
 * }
 */
export function useAsyncAction<T = any>(options: AsyncActionOptions = {}): AsyncActionReturn<T> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(
    async (action: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true)
      setError(null)

      let toastId: string | number | undefined

      if (options.loadingMessage) {
        toastId = toast.loading(options.loadingMessage)
      }

      try {
        const result = await action()
        setData(result)

        if (options.successMessage) {
          if (toastId) {
            toast.success(options.successMessage, { id: toastId })
          } else {
            toast.success(options.successMessage)
          }
        } else if (toastId) {
          toast.dismiss(toastId)
        }

        options.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Une erreur est survenue")
        setError(error)

        if (options.errorMessage) {
          if (toastId) {
            toast.error(options.errorMessage, { id: toastId })
          } else {
            toast.error(options.errorMessage)
          }
        } else if (toastId) {
          toast.error(error.message, { id: toastId })
        }

        options.onError?.(error)
        return undefined
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  return {
    execute,
    isLoading,
    error,
    data,
  }
}

/**
 * Hook simplifié pour les actions asynchrones avec messages par défaut
 */
export function useAsyncMutation<T = any>(actionName: string = "Action") {
  return useAsyncAction<T>({
    loadingMessage: `${actionName} en cours...`,
    successMessage: `${actionName} réussie`,
    errorMessage: `Erreur lors de ${actionName.toLowerCase()}`,
  })
}
