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
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/reui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import PageContainer from "@/components/resuable/page-container"
import useWorkspaceId from "@/hooks/use-workspace-id"
import useGetTaskByIdQuery from "@/hooks/api/use-get-task-by-id"
import { useGetTaskCommentsQuery } from "@/hooks/api/use-get-comments"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
import RichContentViewer from "@/components/editor/rich-content-viewer"
import TaskCommentBox from "@/components/workspace/task/task-comment-box"
import TaskCommentList from "@/components/workspace/task/task-comment-list"
import TaskTypeBadge from "@/components/workspace/task/common/task-type-badge"
import TaskSubtasks from "@/components/workspace/task/task-subtasks"
import TaskTimeline from "@/components/workspace/task/task-timeline"
import TaskTimeTracking from "@/components/workspace/task/task-time-tracking"
import TaskAttachments from "@/components/workspace/task/task-attachments"
import TaskDependencies from "@/components/workspace/task/task-dependencies"

const priorityStyles: Record<string, string> = {
  HIGH: "destructive-light",
  MEDIUM: "primary-light",
  LOW: "warning-light",
}

const statusStyles: Record<string, string> = {
  BACKLOG: "outline",
  TODO: "default",
  IN_PROGRESS: "primary-light",
  IN_REVIEW: "warning-light",
  DONE: "success-light",
}

export default function TaskDetails() {
  const { taskId, projectId } = useParams()
  const workspaceId = useWorkspaceId()
  const navigate = useNavigate()

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
  const assigneeColor = getAvatarColor(assigneeName)

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
    <PageContainer className="py-4 md:py-6 space-y-6 max-w-4xl">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to {task.project?.name || "Project"}
      </button>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {task.taskCode}
          </Badge>
          <TaskTypeBadge type={task.taskType} />
          <Badge
            variant={priorityStyles[task.priority] as "outline" | "default"}
            className="capitalize"
          >
            {task.priority.toLowerCase()} Priority
          </Badge>
          <Badge
            variant={statusStyles[task.status] as "outline" | "default"}
            className="capitalize"
          >
            {task.status.replace("_", " ").toLowerCase()}
          </Badge>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-sm font-semibold mb-3">Description</h2>
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
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                Comments ({comments.length})
              </h2>
              <TaskCommentList comments={comments} workspaceId={workspaceId} />
              <TaskCommentBox workspaceId={workspaceId} taskId={task._id} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <History className="size-4" />
                Activity Log
              </h2>
              <TaskTimeline taskId={task._id} workspaceId={workspaceId} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:sticky md:top-6 md:self-start">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5" />
                  Assignee
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={task.assignedTo?.profilePicture ?? ""} />
                    <AvatarFallback className={`text-[9px] ${assigneeColor}`}>
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
            <CardContent className="p-4 pt-5">
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
