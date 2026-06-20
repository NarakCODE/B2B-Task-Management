import { FormEvent, useMemo, useRef, useState } from "react"
import PageContainer from "@/components/resuable/page-container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuthContext } from "@/context/auth-provider"
import { useDocumentMutations, useGetWorkspaceDocumentsQuery } from "@/hooks/api/use-documents"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { Permissions } from "@/constant"
import { DocumentCategoryType } from "@/types/api.type"
import { cn } from "@/lib/utils"
import {
  Download,
  FileArchive,
  FileImage,
  FileText,
  FileUp,
  Files,
  Search,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

const documentCategories: Array<{ value: DocumentCategoryType | "ALL"; label: string }> = [
  { value: "ALL", label: "All categories" },
  { value: "SPEC", label: "Specs" },
  { value: "CONTRACT", label: "Contracts" },
  { value: "DESIGN", label: "Design" },
  { value: "REPORT", label: "Reports" },
  { value: "OTHER", label: "Other" },
]

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value))

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return FileImage
  if (mimeType.includes("zip") || mimeType.includes("archive")) return FileArchive
  return FileText
}

export default function Documents() {
  const workspaceId = useWorkspaceId()
  const { hasPermission } = useAuthContext()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState<DocumentCategoryType | "ALL">("ALL")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadCategory, setUploadCategory] = useState<DocumentCategoryType>("OTHER")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const canManageDocuments = hasPermission(Permissions.EDIT_TASK)

  const { data, isLoading, isFetching } = useGetWorkspaceDocumentsQuery({
    workspaceId,
    keyword,
    category,
  })
  const { createDocument, deleteDocument } = useDocumentMutations(workspaceId)

  const documents = useMemo(() => data?.documents || [], [data?.documents])

  const documentsByCategory = useMemo(() => {
    return documents.reduce<Record<string, number>>((acc, document) => {
      acc[document.category] = (acc[document.category] || 0) + 1
      return acc
    }, {})
  }, [documents])

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      toast.error("Choose a document before uploading.")
      return
    }

    createDocument.mutate(
      {
        workspaceId,
        file: selectedFile,
        data: {
          title: title || selectedFile.name,
          description,
          category: uploadCategory,
        },
      },
      {
        onSuccess: (response) => {
          toast.success(response.message)
          setTitle("")
          setDescription("")
          setUploadCategory("OTHER")
          setSelectedFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to upload document.")
        },
      },
    )
  }

  const handleDelete = (documentId: string) => {
    if (!window.confirm("Delete this document?")) return

    deleteDocument.mutate(
      { workspaceId, documentId },
      {
        onSuccess: (response) => toast.success(response.message),
        onError: (error) => toast.error(error.message || "Failed to delete document."),
      },
    )
  }

  return (
    <PageContainer className="space-y-6 pt-3">
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">
            Keep workspace specs, reports, contracts, and design files in one place.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
          {documentCategories.slice(1, 4).map((item) => (
            <div key={item.value} className="rounded-lg border bg-card px-3 py-2">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold">{documentsByCategory[item.value] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search documents"
                className="pl-9"
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as DocumentCategoryType | "ALL")}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentCategories.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-[154px] rounded-lg" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <Empty className="min-h-[360px] border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Files />
                </EmptyMedia>
                <EmptyTitle>No documents found</EmptyTitle>
                <EmptyDescription>
                  Upload the first workspace document or adjust the current filters.
                </EmptyDescription>
              </EmptyHeader>
              {canManageDocuments && (
                <EmptyContent>
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    <FileUp />
                    Choose file
                  </Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <div
              className={cn("grid grid-cols-1 gap-3 xl:grid-cols-2", isFetching && "opacity-70")}
            >
              {documents.map((document) => {
                const Icon = getFileIcon(document.mimeType)

                return (
                  <Card key={document._id} className="overflow-hidden">
                    <CardContent className="flex h-full flex-col gap-4 p-4">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold">{document.title}</h3>
                              <p className="truncate text-xs text-muted-foreground">
                                {document.filename}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0 capitalize">
                              {document.category.toLowerCase()}
                            </Badge>
                          </div>
                          {document.description && (
                            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                              {document.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage src={document.uploadedBy?.profilePicture || undefined} />
                            <AvatarFallback className="text-[10px]">
                              {document.uploadedBy?.name?.slice(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {document.uploadedBy?.name || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {formatFileSize(document.size)} · {formatDate(document.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button size="icon" variant="ghost" asChild>
                            <a
                              href={document.url}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Download document"
                            >
                              <Download className="size-4" />
                            </a>
                          </Button>
                          {canManageDocuments && (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label="Delete document"
                              disabled={deleteDocument.isPending}
                              onClick={() => handleDelete(document._id)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardContent className="p-4">
            <form className="space-y-4" onSubmit={handleUpload}>
              <div>
                <h3 className="text-base font-semibold">Upload document</h3>
                <p className="text-sm text-muted-foreground">
                  Files are stored for the current workspace.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-file">File</Label>
                <Input
                  ref={fileInputRef}
                  id="document-file"
                  type="file"
                  disabled={!canManageDocuments || createDocument.isPending}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedFile.name} · {formatFileSize(selectedFile.size)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-title">Title</Label>
                <Input
                  id="document-title"
                  value={title}
                  disabled={!canManageDocuments || createDocument.isPending}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={selectedFile?.name || "Document title"}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={uploadCategory}
                  disabled={!canManageDocuments || createDocument.isPending}
                  onValueChange={(value) => setUploadCategory(value as DocumentCategoryType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentCategories.slice(1).map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document-description">Description</Label>
                <Textarea
                  id="document-description"
                  value={description}
                  disabled={!canManageDocuments || createDocument.isPending}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add context for teammates"
                  className="min-h-24 resize-none"
                />
              </div>

              {!canManageDocuments && (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  You can view documents, but need edit permission to upload or delete them.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={!canManageDocuments || !selectedFile || createDocument.isPending}
              >
                {createDocument.isPending ? (
                  "Uploading..."
                ) : (
                  <>
                    <Upload />
                    Upload document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
