import { useState } from "react"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/components/editor/rich-text-editor"
import { useCommentMutations } from "@/hooks/api/use-comment-mutations"
import { Loader, Send } from "lucide-react"

type TaskCommentBoxProps = {
  workspaceId: string
  taskId: string
}

export default function TaskCommentBox({ workspaceId, taskId }: TaskCommentBoxProps) {
  const [content, setContent] = useState("")
  const { createComment } = useCommentMutations()

  const handleSubmit = () => {
    if (!content.trim()) return
    createComment.mutate(
      {
        workspaceId,
        taskId,
        data: { content },
      },
      {
        onSuccess: () => {
          setContent("")
        },
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-2" onKeyDown={handleKeyDown}>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Write a comment... (Ctrl+Enter to submit)"
        minHeight={80}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || createComment.isPending}
        >
          {createComment.isPending ? (
            <Loader className="size-3.5 animate-spin mr-1.5" />
          ) : (
            <Send className="size-3.5 mr-1.5" />
          )}
          Send
        </Button>
      </div>
    </div>
  )
}
