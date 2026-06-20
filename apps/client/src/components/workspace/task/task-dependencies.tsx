import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Link2,
  X,
  Plus,
  Loader,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Layers,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  addTaskDependencyMutationFn,
  deleteTaskDependencyMutationFn,
  getAllTasksQueryFn,
  DependencyType,
} from "@/lib/api"
import { TaskType, TaskDependencyType } from "@/types/api.type"
import { useNavigate } from "react-router-dom"
import useWorkspaceId from "@/hooks/use-workspace-id"

const DEPENDENCY_LABELS: Record<DependencyType, string> = {
  BLOCKED_BY: "Blocked By",
  BLOCKS: "Blocks",
  RELATED: "Related To",
  PARENT: "Parent Of",
  CHILD: "Child Of",
}

// Note: text-orange-500, text-blue-500, text-violet-500 are intentional design choices
// for dependency type distinction; no direct semantic token equivalents exist in radix-nova.
const DEPENDENCY_ICONS: Record<DependencyType, React.ReactNode> = {
  BLOCKED_BY: <ShieldAlert className="size-3.5 text-destructive" />,
  BLOCKS: <AlertCircle className="size-3.5 text-orange-500" />,
  RELATED: <Link2 className="size-3.5 text-blue-500" />,
  PARENT: <ArrowUp className="size-3.5 text-violet-500" />,
  CHILD: <ArrowDown className="size-3.5 text-violet-500" />,
}

const DEPENDENCY_BADGE_VARIANTS: Record<DependencyType, string> = {
  BLOCKED_BY: "destructive",
  BLOCKS: "secondary",
  RELATED: "default",
  PARENT: "outline",
  CHILD: "outline",
}

const STATUS_BADGE: Record<string, string> = {
  BACKLOG: "outline",
  TODO: "default",
  IN_PROGRESS: "default",
  IN_REVIEW: "secondary",
  DONE: "outline",
}

interface Props {
  task: TaskType
  workspaceId: string
}

export default function TaskDependencies({ task, workspaceId }: Props) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const currentWorkspaceId = useWorkspaceId()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedType, setSelectedType] = useState<DependencyType>("BLOCKED_BY")
  const [searchQuery, setSearchQuery] = useState("")
  const [removingKey, setRemovingKey] = useState<string | null>(null)

  const dependencies: TaskDependencyType[] = (task.dependencies || []) as TaskDependencyType[]

  // Search tasks for the dependency picker
  const { data: tasksData, isLoading: isSearching } = useQuery({
    queryKey: ["all-tasks", workspaceId, "dep-search", searchQuery],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: searchQuery || undefined,
        pageSize: 20,
      }),
    enabled: showAddDialog,
    staleTime: 10_000,
  })

  const availableTasks = (tasksData?.tasks || []).filter(
    (t) => t._id !== task._id && !dependencies.some((d) => d.task._id === t._id),
  )

  const addMutation = useMutation({
    mutationFn: addTaskDependencyMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", task._id] })
      queryClient.invalidateQueries({ queryKey: ["task-detail"] })
      toast.success("Dependency added")
      setShowAddDialog(false)
      setSearchQuery("")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add dependency")
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteTaskDependencyMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-detail", task._id] })
      setRemovingKey(null)
      toast.success("Dependency removed")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove dependency")
      setRemovingKey(null)
    },
  })

  const handleAddDependency = (depTaskId: string) => {
    addMutation.mutate({
      workspaceId,
      taskId: task._id,
      dependencyTaskId: depTaskId,
      type: selectedType,
    })
  }

  const handleRemoveDependency = (dep: TaskDependencyType) => {
    const key = `${dep.type}-${dep.task._id}`
    setRemovingKey(key)
    removeMutation.mutate({
      workspaceId,
      taskId: task._id,
      dependencyTaskId: dep.task._id,
      type: dep.type,
    })
  }

  // Group dependencies by type
  const grouped = dependencies.reduce<Record<DependencyType, TaskDependencyType[]>>(
    (acc, dep) => {
      const type = dep.type as DependencyType
      if (!acc[type]) acc[type] = []
      acc[type].push(dep)
      return acc
    },
    {} as Record<DependencyType, TaskDependencyType[]>,
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Link2 className="size-4" />
          Dependencies ({dependencies.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus data-icon="inline-start" />
          Link Task
        </Button>
      </div>

      {dependencies.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers />
            </EmptyMedia>
            <EmptyTitle>No dependencies linked</EmptyTitle>
            <EmptyDescription>
              Link tasks to establish Blocker, Parent/Child, or Related relationships
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Grouped dependency list */}
      {(Object.keys(grouped) as DependencyType[]).map((type) => (
        <div key={type} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {DEPENDENCY_ICONS[type]}
            {DEPENDENCY_LABELS[type]}
          </div>
          {grouped[type].map((dep) => {
            const key = `${dep.type}-${dep.task._id}`
            const isRemoving = removingKey === key

            return (
              <div
                key={key}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:bg-accent/20 transition-colors group"
              >
                <Badge
                  variant={
                    DEPENDENCY_BADGE_VARIANTS[type] as
                      | "outline"
                      | "default"
                      | "destructive"
                      | "secondary"
                  }
                  className="shrink-0"
                >
                  {type.replace("_", " ")}
                </Badge>

                <Button
                  variant="ghost"
                  className="flex-1 justify-start min-w-0 h-auto p-0"
                  onClick={() => {
                    navigate(
                      `/workspace/${currentWorkspaceId}/project/${task.project?._id || ""}/task/${dep.task._id}`,
                    )
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {dep.task.taskCode}
                    </span>
                    <span className="text-sm truncate hover:underline">{dep.task.title}</span>
                    <ChevronRight className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Button>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={STATUS_BADGE[dep.task.status] as "outline" | "default" | "secondary"}
                    className="capitalize"
                  >
                    {dep.task.status.replace("_", " ").toLowerCase()}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    disabled={isRemoving}
                    onClick={() => handleRemoveDependency(dep)}
                  >
                    {isRemoving ? <Loader className="animate-spin" /> : <X />}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Add Dependency Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Task</DialogTitle>
            <DialogDescription>
              Choose a relationship type and search for a task to link. Blocked By prevents this
              task from starting, Parent/Child creates a hierarchy, and Related is a loose
              association.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dep-type" className="text-xs font-medium text-muted-foreground">
              Relationship Type
            </Label>
            <Select
              value={selectedType}
              onValueChange={(v) => setSelectedType(v as DependencyType)}
            >
              <SelectTrigger id="dep-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(DEPENDENCY_LABELS) as [DependencyType, string][]).map(
                  ([type, label]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        {DEPENDENCY_ICONS[type]}
                        {label}
                      </div>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dep-search" className="text-xs font-medium text-muted-foreground">
              Search Tasks
            </Label>
            <Input
              id="dep-search"
              placeholder="Search by title or code…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5 border rounded-md p-1">
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader className="size-4 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isSearching && availableTasks.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No tasks found</p>
              )}

              {availableTasks.map((t) => (
                <Button
                  key={t._id}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  disabled={addMutation.isPending}
                  onClick={() => handleAddDependency(t._id)}
                >
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {t.taskCode}
                  </span>
                  <span className="text-sm flex-1 truncate text-left">{t.title}</span>
                  <Badge
                    variant={STATUS_BADGE[t.status] as "outline" | "default" | "secondary"}
                    className="capitalize shrink-0"
                  >
                    {t.status.replace("_", " ").toLowerCase()}
                  </Badge>
                  {addMutation.isPending && <Loader className="animate-spin" />}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
