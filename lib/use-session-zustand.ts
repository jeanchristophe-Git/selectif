"use client"

import { useEffect } from "react"
import { useUserStore } from "@/stores/use-user-store"
import type { SessionUser } from "@/lib/auth-utils"

interface UseSessionReturn {
  user: SessionUser | null
  loading: boolean
  refetch: () => Promise<void>
  logout: () => void

  // Helper methods
  isCompany: boolean
  isCandidate: boolean
  isAdmin: boolean
}

/**
 * Hook personnalisé pour gérer la session utilisateur avec Zustand
 * Remplace le hook useSession existant avec une gestion d'état global
 */
export function useSessionZustand(): UseSessionReturn {
  const {
    user,
    isLoading,
    setUser,
    setLoading,
    logout: logoutStore,
    isCompany: checkIsCompany,
    isCandidate: checkIsCandidate,
    isAdmin: checkIsAdmin,
  } = useUserStore()

  const fetchSession = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/session")
      const data = await response.json()
      setUser(data.user || null)
    } catch (error) {
      console.error("Session fetch error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    logoutStore()
    // Optionally call logout API
    fetch("/api/auth/logout", { method: "POST" }).catch(console.error)
  }

  useEffect(() => {
    // Fetch session on mount if not already loaded
    if (!user && isLoading) {
      fetchSession()
    }
  }, [])

  return {
    user,
    loading: isLoading,
    refetch: fetchSession,
    logout,
    isCompany: checkIsCompany(),
    isCandidate: checkIsCandidate(),
    isAdmin: checkIsAdmin(),
  }
}

/**
 * Hook pour vérifier si l'utilisateur a accès à une fonctionnalité premium
 */
export function usePremiumAccess() {
  const { user } = useUserStore()

  const hasInternetSearch =
    user?.subscription?.plan === 'CANDIDATE_PREMIUM' ||
    user?.subscription?.plan === 'COMPANY_BUSINESS' ||
    user?.subscription?.plan === 'COMPANY_ENTERPRISE'

  const hasAIAnalysis =
    user?.subscription?.plan === 'COMPANY_BUSINESS' ||
    user?.subscription?.plan === 'COMPANY_ENTERPRISE'

  const hasAdvancedFeatures =
    user?.subscription?.plan === 'COMPANY_ENTERPRISE'

  return {
    hasInternetSearch,
    hasAIAnalysis,
    hasAdvancedFeatures,
    subscriptionPlan: user?.subscription?.plan || null,
  }
}
