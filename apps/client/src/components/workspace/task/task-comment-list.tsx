import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useCommentMutations } from "@/hooks/api/use-comment-mutations"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
import type { CommentType } from "@/types/api.type"
import { formatDistanceToNow } from "date-fns"
import { useAuthContext } from "@/context/auth-provider"
import { Trash2, PencilLine, Loader } from "lucide-react"
import { useState } from "react"
import RichTextEditor from "@/components/editor/rich-text-editor"
import RichContentViewer from "@/components/editor/rich-content-viewer"
type TaskCommentListProps = {
  comments: CommentType[]
  workspaceId: string
}

export default function TaskCommentList({ comments, workspaceId }: TaskCommentListProps) {
  const { user } = useAuthContext()
  const currentUserId = user?._id
  const { updateComment, deleteComment } = useCommentMutations()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")

  if (comments.length === 0) {
    return (
      <p className="text-muted-foreground text-sm text-center py-6">
        No comments yet. Be the first to comment!
      </p>
    )
  }

  const sorted = [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-4">
      {sorted.map((comment) => {
        const name = comment.user?.name || "Unknown"
        const initials = getAvatarFallbackText(name)
        const avatarColor = getAvatarColor(name)
        const isOwn = comment.user?._id === currentUserId
        const isEditing = editingId === comment._id

        return (
          <div key={comment._id} className="flex gap-3">
            <Avatar className="size-8 shrink-0 mt-0.5">
              <AvatarImage src={comment.user?.profilePicture ?? ""} alt={name} />
              <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <RichTextEditor
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Edit your comment..."
                    minHeight={80}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        if (!editContent.trim()) return
                        updateComment.mutate(
                          { workspaceId, commentId: comment._id, data: { content: editContent } },
                          { onSuccess: () => setEditingId(null) }
                        )
                      }}
                      disabled={updateComment.isPending || !editContent.trim()}
                    >
                      {updateComment.isPending && <Loader className="size-3 animate-spin mr-1" />}
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <RichContentViewer content={comment.content} className="text-sm" />
              )}
              {isOwn && !isEditing && (
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditContent(comment.content)
                      setEditingId(comment._id)
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <PencilLine className="size-3" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteComment.mutate({ workspaceId, commentId: comment._id })}
                    className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                  >
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
