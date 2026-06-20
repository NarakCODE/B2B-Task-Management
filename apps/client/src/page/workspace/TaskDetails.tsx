import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  User,
  Code,
  Layers,
  Clock,
  ArrowRight,
  Loader,
  History,
  Pencil,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PageContainer from "@/components/resuable/page-container"
import useWorkspaceId from "@/hooks/use-workspace-id"
import useGetTaskByIdQuery from "@/hooks/api/use-get-task-by-id"
import { useGetTaskCommentsQuery } from "@/hooks/api/use-get-comments"
import { getAvatarFallbackText } from "@/lib/helper"
import RichContentViewer from "@/components/editor/rich-content-viewer"
import TaskCommentBox from "@/components/workspace/task/task-comment-box"
import TaskCommentList from "@/components/workspace/task/task-comment-list"
import TaskTypeBadge from "@/components/workspace/task/common/task-type-badge"
import TaskSubtasks from "@/components/workspace/task/task-subtasks"
import TaskTimeline from "@/components/workspace/task/task-timeline"
import TaskTimeTracking from "@/components/workspace/task/task-time-tracking"
import TaskAttachments from "@/components/workspace/task/task-attachments"
import TaskDependencies from "@/components/workspace/task/task-dependencies"
import EditTaskDialog from "@/components/workspace/task/edit-task-dialog"

const priorityStyles: Record<string, string> = {
  HIGH: "destructive",
  MEDIUM: "default",
  LOW: "secondary",
}

const statusStyles: Record<string, string> = {
  BACKLOG: "outline",
  TODO: "default",
  IN_PROGRESS: "default",
  IN_REVIEW: "secondary",
  DONE: "outline",
}

export default function TaskDetails() {
  const { taskId, projectId } = useParams()
  const workspaceId = useWorkspaceId()
  const navigate = useNavigate()
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { data: taskData, isLoading } = useGetTaskByIdQuery({
    taskId: taskId || "",
    projectId: projectId || "",
    workspaceId,
    enabled: !!taskId && !!projectId,
  })

  const { data: commentsData } = useGetTaskCommentsQuery({
    workspaceId,
    taskId: taskId || "",
    enabled: !!taskId,
  })

  const task = taskData?.task
  const comments = commentsData?.comments || []

  const assigneeName = task?.assignedTo?.name || "Unassigned"
  const assigneeInitials = getAvatarFallbackText(assigneeName)

  const handleBack = () => {
    navigate(`/workspace/${workspaceId}/project/${projectId}`)
  }

  if (isLoading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[60vh]">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </PageContainer>
    )
  }

  if (!task) {
    return (
      <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Task not found</p>
        <Button variant="outline" onClick={handleBack}>
          Back to Project
        </Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer className="py-4 md:py-6 flex flex-col gap-6 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="w-fit -ml-2 text-muted-foreground"
      >
        <ArrowLeft data-icon="inline-start" className="size-4" />
        Back to {task.project?.name || "Project"}
      </Button>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {task.taskCode}
          </Badge>
          <TaskTypeBadge type={task.taskType} />
          <Badge
            variant={priorityStyles[task.priority] as "destructive" | "default" | "secondary"}
            className="capitalize"
          >
            {task.priority.toLowerCase()} Priority
          </Badge>
          <Badge
            variant={statusStyles[task.status] as "outline" | "default" | "secondary"}
            className="capitalize"
          >
            {task.status.replace("_", " ").toLowerCase()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setIsEditOpen(true)}
          >
            <Pencil data-icon="inline-start" className="size-3.5" />
            Edit
          </Button>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
      </div>

      <EditTaskDialog task={task} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <RichContentViewer content={task.description} className="text-sm" />
              ) : (
                <p className="text-sm text-muted-foreground italic">No description provided.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TaskSubtasks task={task} workspaceId={workspaceId} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TaskDependencies task={task} workspaceId={workspaceId} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <TaskAttachments taskId={task._id} workspaceId={workspaceId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Comments ({comments.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <TaskCommentList comments={comments} workspaceId={workspaceId} />
              <TaskCommentBox workspaceId={workspaceId} taskId={task._id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="size-4" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TaskTimeline taskId={task._id} workspaceId={workspaceId} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:sticky md:top-6 md:self-start">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5" />
                  Assignee
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={task.assignedTo?.profilePicture ?? ""} />
                    <AvatarFallback className="text-[0.6rem] font-medium">
                      {assigneeInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{assigneeName}</span>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Layers className="size-3.5" />
                  Project
                </span>
                <span className="text-sm font-medium">
                  {task.project?.emoji} {task.project?.name || "—"}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Code className="size-3.5" />
                  Sprint
                </span>
                <span className="text-sm font-medium">{task.sprint?.name || "Backlog"}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Due Date
                </span>
                <span className="text-sm font-medium">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "—"}
                </span>
              </div>

              {task.storyPoints !== null && task.storyPoints !== undefined && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Story Points</span>
                    <span className="text-sm font-medium">{task.storyPoints}</span>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Created
                </span>
                <span className="text-sm">
                  {task.createdAt ? format(new Date(task.createdAt), "MMM d, yyyy") : "—"}
                </span>
              </div>

              {task.updatedAt && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <ArrowRight className="size-3.5" />
                      Updated
                    </span>
                    <span className="text-sm">
                      {format(new Date(task.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TaskTimeTracking
                taskId={task._id}
                workspaceId={workspaceId}
                storyPoints={task.storyPoints}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
