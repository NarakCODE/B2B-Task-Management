import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import EditTaskForm from "./edit-task-form"
import { TaskType } from "@/types/api.type"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { useGetTaskCommentsQuery } from "@/hooks/api/use-get-comments"
import TaskCommentList from "./task-comment-list"
import TaskCommentBox from "./task-comment-box"
import { Separator } from "@/components/ui/separator"
import { MessageSquare } from "lucide-react"

const EditTaskDialog = ({
  task,
  isOpen,
  onClose,
}: {
  task: TaskType
  isOpen: boolean
  onClose: () => void
}) => {
  const workspaceId = useWorkspaceId()

  const { data: commentsData } = useGetTaskCommentsQuery({
    workspaceId,
    taskId: task._id,
    enabled: isOpen,
  })

  const comments = commentsData?.comments || []

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription className="sr-only">
            Edit the details of this task including title, description, status, priority, and more.
          </DialogDescription>
        </DialogHeader>

        <EditTaskForm task={task} onClose={onClose} />

        <Separator className="my-2" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Comments ({comments.length})</h3>
          </div>

          <TaskCommentList comments={comments} workspaceId={workspaceId} />

          <TaskCommentBox workspaceId={workspaceId} taskId={task._id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditTaskDialog
