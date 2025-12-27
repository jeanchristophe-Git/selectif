import { db } from "./db"

interface CreateNotificationInput {
  userId: string
  type: "NEW_APPLICATION" | "AI_ANALYSIS_COMPLETE" | "SHORTLIST_UPDATED" | "JOB_PUBLISHED" | "APPLICATION_STATUS_CHANGED"
  title: string
  message: string
  metadata?: Record<string, any>
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata: input.metadata || null,
        read: false,
      },
    })

    return notification
  } catch (error) {
    console.error("Failed to create notification:", error)
    return null
  }
}
