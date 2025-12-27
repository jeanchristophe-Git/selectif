"use client"

import { useEffect, useState } from "react"
import type { SessionUser } from "./auth-utils"

interface UseSessionReturn {
  user: SessionUser | null
  loading: boolean
  refetch: () => Promise<void>
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = async () => {
    try {
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

  useEffect(() => {
    fetchSession()
  }, [])

  return { user, loading, refetch: fetchSession }
}
