"use client"

import { useEffect } from "react"
import { useUIStore } from "@/stores/use-ui-store"

/**
 * Hook pour gérer les notifications depuis l'API
 * Se synchronise automatiquement avec le store UI
 */
export function useNotifications() {
  const { setNotificationCount } = useUIStore()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (response.ok) {
          const data = await response.json()
          setNotificationCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [setNotificationCount])

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
      })
      if (response.ok) {
        setNotificationCount(0)
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error)
    }
  }

  return {
    markAllAsRead,
  }
}
