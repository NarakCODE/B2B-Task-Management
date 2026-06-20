import { useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Upload,
  Trash2,
  Download,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Loader,
  Paperclip,
  Eye,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  getTaskAttachmentsQueryFn,
  uploadTaskAttachmentMutationFn,
  deleteTaskAttachmentMutationFn,
} from "@/lib/api"
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper"
import { TaskAttachmentType } from "@/types/api.type"
import { format } from "date-fns"

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage className="size-5 text-blue-500" />
  if (mimeType.includes("pdf")) return <FileText className="size-5 text-red-500" />
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <FileSpreadsheet className="size-5 text-green-500" />
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return <FileArchive className="size-5 text-yellow-500" />
  return <FileText className="size-5 text-muted-foreground" />
}

function isImage(mimeType: string) {
  return mimeType.startsWith("image/")
}

interface Props {
  taskId: string
  workspaceId: string
}

export default function TaskAttachments({ taskId, workspaceId }: Props) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachmentType | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["task-attachments", taskId],
    queryFn: () => getTaskAttachmentsQueryFn({ workspaceId, taskId }),
    enabled: !!taskId && !!workspaceId,
  })

  const attachments = data?.attachments || []

  const uploadMutation = useMutation({
    mutationFn: uploadTaskAttachmentMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] })
      toast.success("File uploaded successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Upload failed")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTaskAttachmentMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-attachments", taskId] })
      toast.success("Attachment deleted")
      setDeletingId(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Delete failed")
      setDeletingId(null)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 25 MB limit")
      return
    }

    uploadMutation.mutate({ workspaceId, taskId, file })
    // Reset input so same file can be re-uploaded
    e.target.value = ""
  }

  const handleDelete = (attachmentId: string) => {
    setDeletingId(attachmentId)
    deleteMutation.mutate({ workspaceId, taskId, attachmentId })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Paperclip className="size-4" />
          Attachments ({attachments.length})
        </h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadMutation.isPending ? (
            <Loader className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {uploadMutation.isPending ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && attachments.length === 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Images, PDFs, documents, and archives up to 25 MB
          </p>
        </div>
      )}

      {/* Attachment gallery */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {/* Image previews in grid */}
          {attachments.some((a) => isImage(a.mimeType)) && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {attachments
                .filter((a) => isImage(a.mimeType))
                .map((attachment) => (
                  <div
                    key={attachment._id}
                    className="relative group rounded-lg overflow-hidden border aspect-square bg-muted cursor-pointer"
                    onClick={() => setPreviewAttachment(attachment)}
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Eye className="size-4 text-white" />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* All files list */}
          {attachments.map((attachment) => {
            const uploaderName = attachment.uploadedBy?.name || "Unknown"
            const uploaderInitials = getAvatarFallbackText(uploaderName)
            const uploaderColor = getAvatarColor(uploaderName)
            const isDeleting = deletingId === attachment._id

            return (
              <div
                key={attachment._id}
                className="flex items-center gap-3 p-2.5 rounded-lg border bg-card hover:bg-accent/30 transition-colors group"
              >
                <div className="shrink-0">{getFileIcon(attachment.mimeType)}</div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{attachment.filename}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(attachment.size)}
                    </span>
                    <span className="text-xs text-muted-foreground/50">•</span>
                    <span className="text-xs text-muted-foreground">
                      {attachment.createdAt
                        ? format(new Date(attachment.createdAt), "MMM d, yyyy")
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Avatar className="size-5">
                    <AvatarImage src={attachment.uploadedBy?.profilePicture ?? ""} />
                    <AvatarFallback className={`text-[8px] ${uploaderColor}`}>
                      {uploaderInitials}
                    </AvatarFallback>
                  </Avatar>

                  {isImage(attachment.mimeType) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setPreviewAttachment(attachment)}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <a
                      href={attachment.url}
                      download={attachment.filename}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="size-3.5" />
                    </a>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    disabled={isDeleting}
                    onClick={() => handleDelete(attachment._id)}
                  >
                    {isDeleting ? (
                      <Loader className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Image preview dialog */}
      <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
        <DialogContent className="max-w-3xl p-2">
          <DialogHeader className="px-4 pt-2 pb-1">
            <DialogTitle className="text-sm font-medium truncate">
              {previewAttachment?.filename}
            </DialogTitle>
          </DialogHeader>
          {previewAttachment && (
            <div className="flex items-center justify-center max-h-[70vh] overflow-hidden rounded-md">
              <img
                src={previewAttachment.url}
                alt={previewAttachment.filename}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
          <div className="flex justify-end px-4 pb-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={previewAttachment?.url}
                download={previewAttachment?.filename}
                target="_blank"
                rel="noreferrer"
              >
                <Download className="size-3.5 mr-1.5" />
                Download
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
