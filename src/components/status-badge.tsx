import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getColorConfig, type StatusColorConfig } from "@/lib/status-colors"

interface StatusInfo {
  key: string
  label: string
  color: string
}

// Fallback config for statuses not found in DB (legacy support)
const fallbackConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "slate" },
  IN_PROGRESS: { label: "In Progress", color: "amber" },
  COMPLETED: { label: "Completed", color: "emerald" },
  CANCELLED: { label: "Cancelled", color: "rose" },
}

export function StatusBadge({ status, statuses }: { status: string; statuses?: StatusInfo[] }) {
  let label = status.replace(/_/g, " ")
  let colorConfig: StatusColorConfig

  // Try to find in provided statuses list
  const found = statuses?.find((s) => s.key === status)
  if (found) {
    label = found.label
    colorConfig = getColorConfig(found.color)
  } else {
    // Fallback to hardcoded
    const fb = fallbackConfig[status]
    if (fb) {
      label = fb.label
      colorConfig = getColorConfig(fb.color)
    } else {
      colorConfig = getColorConfig("slate")
    }
  }

  return (
    <Badge variant="outline" className={cn("gap-1.5 font-semibold", colorConfig.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", colorConfig.dot)} />
      {label}
    </Badge>
  )
}
