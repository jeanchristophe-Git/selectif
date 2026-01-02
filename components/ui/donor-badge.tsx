import { DONOR_BADGES, DonorBadgeType } from "@/lib/donations"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DonorBadgeProps {
  badge: DonorBadgeType
  className?: string
  showLabel?: boolean
}

export function DonorBadge({ badge, className, showLabel = true }: DonorBadgeProps) {
  const badgeInfo = DONOR_BADGES[badge]

  if (!badgeInfo) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
              badgeInfo.color,
              badgeInfo.bgColor,
              badgeInfo.borderColor,
              className
            )}
          >
            <span className="text-base">{badgeInfo.icon}</span>
            {showLabel && <span>{badgeInfo.label}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{badgeInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface DonorBadgeListProps {
  badges: DonorBadgeType[]
  className?: string
}

export function DonorBadgeList({ badges, className }: DonorBadgeListProps) {
  if (!badges || badges.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {badges.map((badge) => (
        <DonorBadge key={badge} badge={badge} />
      ))}
    </div>
  )
}
