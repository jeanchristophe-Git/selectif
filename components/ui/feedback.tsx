"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type FeedbackType = "success" | "error" | "warning" | "info" | "loading"

interface FeedbackProps {
  type: FeedbackType
  message: string
  description?: string
  show?: boolean
  onClose?: () => void
  className?: string
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
}

const colors = {
  success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
  loading: "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100",
}

const iconColors = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  info: "text-blue-600 dark:text-blue-400",
  loading: "text-gray-600 dark:text-gray-400",
}

export function Feedback({
  type,
  message,
  description,
  show = true,
  onClose,
  className
}: FeedbackProps) {
  const Icon = icons[type]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-lg border p-4",
            colors[type],
            className
          )}
        >
          <div className="flex gap-3">
            <Icon
              className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5",
                iconColors[type],
                type === "loading" && "animate-spin"
              )}
            />
            <div className="flex-1">
              <p className="font-medium text-sm">{message}</p>
              {description && (
                <p className="mt-1 text-sm opacity-90">{description}</p>
              )}
            </div>
            {onClose && type !== "loading" && (
              <button
                onClick={onClose}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Composants pré-configurés pour un usage rapide
export function SuccessFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="success" />
}

export function ErrorFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="error" />
}

export function WarningFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="warning" />
}

export function InfoFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="info" />
}

export function LoadingFeedback(props: Omit<FeedbackProps, "type">) {
  return <Feedback {...props} type="loading" />
}
