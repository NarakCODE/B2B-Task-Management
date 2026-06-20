"use client"

import { ComponentProps, useState, useEffect, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/reui/badge"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanColumnHandle,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { GripVertical as GripVerticalIcon } from "lucide-react"
import { toast } from "sonner"

import useWorkspaceId from "@/hooks/use-workspace-id"
import useTaskTableFilter from "@/hooks/use-task-table-filter"
import { getAllTasksQueryFn, editTaskMutationFn } from "@/lib/api"
import { TaskType, EditTaskPayloadType } from "@/types/api.type"
import { TaskStatusEnumType } from "@/constant"
import { UniqueIdentifier } from "@dnd-kit/core"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"

import { DataTableFilterToolbar } from "./task-table"
import EditTaskDialog from "./edit-task-dialog"

// Task interface for ReUI Kanban structure
interface Task {
  id: string
  title: string
  priority: "low" | "medium" | "high"
  description?: string
  assignee?: string
  assigneeAvatar?: string
  dueDate?: string
  // Store full original task object to easily access fields on update
  rawTask: TaskType
}

const COLUMN_TITLES: Record<string, string> = {
  BACKLOG: "Backlog",
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
}

interface TaskCardProps extends Omit<
  ComponentProps<typeof KanbanItem>,
  "value" | "children"
> {
  task: Task
  asHandle?: boolean
  isOverlay?: boolean
  onClick?: () => void
}

function TaskCard({ task, asHandle, isOverlay, onClick, ...props }: TaskCardProps) {
  const assigneeName = task.assignee || "Unassigned"
  const initials = getAvatarFallbackText(assigneeName)
  const avatarColor = getAvatarColor(assigneeName)

  const cardContent = (
    <Card onClick={onClick} className="cursor-pointer hover:border-primary/40 dark:hover:border-primary/25 transition-all select-none">
      <CardContent className="space-y-2.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="line-clamp-2 text-sm font-medium text-foreground leading-snug">
            {task.title}
          </span>
          <Badge
            variant={
              task.priority === "high"
                ? "destructive-light"
                : task.priority === "medium"
                  ? "primary-light"
                  : "warning-light"
            }
            className="pointer-events-none h-5 shrink-0 rounded-sm px-1.5 text-[10px] font-semibold capitalize"
          >
            {task.priority}
          </Badge>
        </div>
        <div className="text-muted-foreground flex items-center justify-between text-xs mt-3">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar className="size-4.5">
                <AvatarImage src={task.assigneeAvatar} />
                <AvatarFallback className={`text-[8px] font-bold ${avatarColor}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="line-clamp-1 text-[11px]">{task.assignee}</span>
            </div>
          )}
          {task.dueDate && (
            <time className="text-[10px] whitespace-nowrap text-muted-foreground tabular-nums bg-muted/50 dark:bg-zinc-800/40 px-1 rounded">
              {task.dueDate}
            </time>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <KanbanItem value={task.id} {...props}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  )
}

interface TaskColumnProps extends Omit<
  ComponentProps<typeof KanbanColumn>,
  "children"
> {
  tasks: Task[]
  isOverlay?: boolean
  onTaskClick?: (task: Task) => void
}

function TaskColumn({ value, tasks, isOverlay, onTaskClick, ...props }: TaskColumnProps) {
  return (
    <KanbanColumn value={value} {...props} className="w-[300px] shrink-0 h-full max-h-[calc(100vh-280px)]">
      <Card className="flex flex-col h-full bg-muted/20 dark:bg-zinc-950/10 border-dashed border-2">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-foreground">
              {COLUMN_TITLES[value]}
            </span>
            <Badge variant="outline" className="h-5 px-1.5 py-0 text-xs">
              {tasks.length}
            </Badge>
          </div>
          <KanbanColumnHandle asChild>
            <Button size="icon-xs" variant="ghost" className="h-6 w-6">
              <GripVerticalIcon className="size-3.5 text-muted-foreground" />
            </Button>
          </KanbanColumnHandle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          <KanbanColumnContent value={value} className="flex flex-col gap-2.5 min-h-[150px] pb-10">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                asHandle={!isOverlay}
                isOverlay={isOverlay}
                onClick={() => onTaskClick?.(task)}
              />
            ))}
          </KanbanColumnContent>
        </CardContent>
      </Card>
    </KanbanColumn>
  )
}

export default function KanbanBoardView() {
  const param = useParams()
  const projectId = param.projectId as string
  const workspaceId = useWorkspaceId()
  const [filters, setFilters] = useTaskTableFilter()
  const queryClient = useQueryClient()

  const [activeTask, setActiveTask] = useState<TaskType | null>(null)

  // Fetch tasks
  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId, 100, 1, filters, projectId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        priority: filters.priority,
        status: filters.status,
        projectId: projectId || filters.projectId,
        assignedTo: filters.assigneeId,
        sprint: filters.sprint,
        taskType: filters.taskType,
        pageNumber: 1,
        pageSize: 100,
      }),
    staleTime: 0,
  })

  const tasks: TaskType[] = useMemo(() => data?.tasks || [], [data?.tasks])

  // Map server TaskType to ReUI Task model
  const mapServerTaskToClientTask = (task: TaskType): Task => ({
    id: task._id,
    title: task.title,
    priority: task.priority.toLowerCase() as "low" | "medium" | "high",
    description: task.description || undefined,
    assignee: task.assignedTo?.name || undefined,
    assigneeAvatar: task.assignedTo?.profilePicture || undefined,
    dueDate: task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : undefined,
    rawTask: task,
  })

  // Group tasks by column
  const columnsData = useMemo(() => {
    const cols: Record<string, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    }

    tasks.forEach((t) => {
      const statusKey = t.status
      if (cols[statusKey]) {
        cols[statusKey].push(mapServerTaskToClientTask(t))
      }
    })

    return cols
  }, [tasks])

  // Local state for dnd-kit column representation
  const [localColumns, setLocalColumns] = useState<Record<string, Task[]>>({
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
  })

  // Synchronize local columns with server query updates
  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalColumns(columnsData)
    }
  }, [columnsData, data])

  // Mutation to update task status in the database
  const { mutate } = useMutation<
    { message: string },
    Error,
    EditTaskPayloadType,
    { previousColumns: Record<string, Task[]> }
  >({
    mutationFn: editTaskMutationFn,
    onMutate: async () => {
      return { previousColumns: localColumns }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] })
      toast.success("Task status updated")
    },
    onError: (_err, _variables, context) => {
      // Revert local state on error
      if (context?.previousColumns) {
        setLocalColumns(context.previousColumns)
      }
      toast.error("Failed to move task. Please try again.")
    },
  })

  // Handle local state updates from dnd-kit dragging
  const handleColumnsChange = (newColumns: Record<string, Task[]>) => {
    setLocalColumns(newColumns)

    // Check which task changed status (moved columns)
    let movedTaskId = ""
    let targetStatus = ""

    for (const [colId, newTasks] of Object.entries(newColumns)) {
      const prevTasks = localColumns[colId] || []
      const moved = newTasks.find((nt) => !prevTasks.some((pt) => pt.id === nt.id))
      if (moved) {
        movedTaskId = moved.id
        targetStatus = colId
        break
      }
    }

    if (movedTaskId && targetStatus) {
      const task = tasks.find((t) => t._id === movedTaskId)
      if (task) {
        mutate({
          taskId: task._id,
          projectId: task.project?._id || projectId,
          workspaceId,
          data: {
            title: task.title,
            description: task.description || "",
            status: targetStatus as TaskStatusEnumType,
            priority: task.priority,
            assignedTo: task.assignedTo?._id || null,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
            taskType: task.taskType,
            storyPoints: task.storyPoints || null,
            sprint: task.sprint?._id || null,
          },
        })
      }
    }
  }

  const renderOverlay = (params: { value: UniqueIdentifier; variant: "column" | "item" }) => {
    const { value, variant } = params
    if (variant === "column") {
      const colValue = value as string
      const colTasks = localColumns[colValue] || []
      return <TaskColumn value={colValue} tasks={colTasks} isOverlay />
    } else {
      const itemId = value as string
      // Find the task across all columns
      let task: Task | undefined
      for (const colTasks of Object.values(localColumns)) {
        task = colTasks.find((t) => t.id === itemId)
        if (task) break
      }
      if (!task) return null
      return <TaskCard task={task} isOverlay />
    }
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Filter toolbar */}
      <DataTableFilterToolbar
        isLoading={isLoading}
        projectId={projectId}
        filters={filters}
        setFilters={setFilters}
      />

      {/* ReUI Kanban Drag-and-Drop context */}
      <Kanban
        value={localColumns}
        onValueChange={handleColumnsChange}
        getItemValue={(item) => item.id}
      >
        <KanbanBoard className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-270px)] h-full">
          {Object.entries(localColumns).map(([columnValue, tasks]) => (
            <TaskColumn
              key={columnValue}
              value={columnValue}
              tasks={tasks}
              onTaskClick={(task) => setActiveTask(task.rawTask)}
            />
          ))}
        </KanbanBoard>
        <KanbanOverlay className="bg-muted/10 rounded-md border-2 border-dashed">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {renderOverlay as any}
        </KanbanOverlay>
      </Kanban>

      {/* Edit Task Dialog */}
      {activeTask && (
        <EditTaskDialog
          task={activeTask}
          isOpen={!!activeTask}
          onClose={() => setActiveTask(null)}
        />
      )}
    </div>
  )
}
