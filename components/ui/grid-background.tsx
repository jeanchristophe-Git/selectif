import { cn } from "@/lib/utils"
import React from "react"

export function GridBackground({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-full bg-background", className)}>
      {/* Grid pattern */}
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:60px_60px]",
          "[background-image:linear-gradient(to_right,rgb(228_228_231_/_0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgb(228_228_231_/_0.3)_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,rgb(39_39_42_/_0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgb(39_39_42_/_0.3)_1px,transparent_1px)]",
        )}
      />
      {/* Radial fade overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
