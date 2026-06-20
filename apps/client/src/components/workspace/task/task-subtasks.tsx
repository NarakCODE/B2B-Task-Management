import { useState, useMemo } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

import { TaskType } from "@/types/api.type"
import {
  createSubtaskMutationFn,
  toggleSubtaskMutationFn,
  deleteSubtaskMutationFn,
} from "@/lib/api"

type TaskSubtasksProps = {
  task: TaskType
  workspaceId: string
}

export default function TaskSubtasks({ task, workspaceId }: TaskSubtasksProps) {
  const [newTitle, setNewTitle] = useState("")
  const [isToggling, setIsToggling] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const taskId = task._id
  const subtasks = task.subtasks || []
  const totalCount = subtasks.length
  const completedCount = useMemo(() => subtasks.filter((s) => s.isCompleted).length, [subtasks])
  const progressPercentage = useMemo(() => {
    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  }, [completedCount, totalCount])

  // Create Subtask Mutation
  const { mutate: createSubtask, isPending: isCreating } = useMutation({
    mutationFn: createSubtaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      setNewTitle("")
      toast.success("Subtask added successfully")
    },
    onError: () => {
      toast.error("Failed to add subtask")
    },
  })

  // Toggle Subtask Mutation
  const { mutate: toggleSubtask } = useMutation({
    mutationFn: toggleSubtaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    },
    onError: () => {
      toast.error("Failed to update subtask")
    },
    onSettled: () => {
      setIsToggling(null)
    },
  })

  // Delete Subtask Mutation
  const { mutate: deleteSubtask } = useMutation({
    mutationFn: deleteSubtaskMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success("Subtask deleted")
    },
    onError: () => {
      toast.error("Failed to delete subtask")
    },
    onSettled: () => {
      setIsDeleting(null)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    createSubtask({
      workspaceId,
      taskId,
      data: { title: newTitle.trim() },
    })
  }

  const handleToggle = (subtaskId: string) => {
    setIsToggling(subtaskId)
    toggleSubtask({
      workspaceId,
      taskId,
      subtaskId,
    })
  }

  const handleDelete = (subtaskId: string) => {
    setIsDeleting(subtaskId)
    deleteSubtask({
      workspaceId,
      taskId,
      subtaskId,
    })
  }

  return (
    <div className="space-y-4">
      {/* Header & Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span>Subtasks</span>
          <span className="text-xs text-muted-foreground">
            {completedCount} / {totalCount} ({progressPercentage}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      {/* Subtask list */}
      {totalCount > 0 && (
        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
          {subtasks.map((sub) => (
            <div
              key={sub._id}
              className="group flex items-center justify-between py-1.5 px-2 hover:bg-muted/40 dark:hover:bg-zinc-900/40 rounded-md transition-colors"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Checkbox
                  id={`subtask-${sub._id}`}
                  checked={sub.isCompleted}
                  onCheckedChange={() => handleToggle(sub._id)}
                  disabled={isToggling === sub._id}
                  className="size-4"
                />
                <label
                  htmlFor={`subtask-${sub._id}`}
                  className={`text-xs truncate cursor-pointer select-none font-medium ${
                    sub.isCompleted
                      ? "line-through text-muted-foreground font-normal"
                      : "text-foreground"
                  }`}
                >
                  {sub.title}
                </label>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(sub._id)}
                disabled={isDeleting === sub._id}
              >
                {isDeleting === sub._id ? (
                  <Loader className="size-3 animate-spin text-muted-foreground" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add subtask Form */}
      <form onSubmit={handleCreate} className="flex gap-2 items-center">
        <Input
          type="text"
          placeholder="Add a subtask..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={isCreating}
          className="h-9 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!newTitle.trim() || isCreating}
          className="h-9 px-3 shrink-0"
        >
          {isCreating ? (
            <Loader className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5 mr-1" />
          )}
          Add
        </Button>
      </form>
    </div>
  )
}
