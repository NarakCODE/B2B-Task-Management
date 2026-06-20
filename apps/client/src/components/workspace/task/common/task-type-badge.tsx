import { Badge } from "@/components/reui/badge"
import { Bug, Lightbulb, RefreshCw, Wrench } from "lucide-react"

const taskTypeConfig: Record<string, { label: string; icon: typeof Bug; variant: "info-light" | "warning-light" | "primary-light" | "invert-light" | "destructive-light" }> = {
  FEATURE: { label: "Feature", icon: Lightbulb, variant: "info-light" },
  BUG: { label: "Bug", icon: Bug, variant: "destructive-light" },
  CHORE: { label: "Chore", icon: Wrench, variant: "warning-light" },
  REFACTOR: { label: "Refactor", icon: RefreshCw, variant: "primary-light" },
}

export default function TaskTypeBadge({ type }: { type: string }) {
  const config = taskTypeConfig[type] || taskTypeConfig.FEATURE
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1 capitalize">
      <Icon className="size-3" />
      {config.label}
    </Badge>
  )
}
