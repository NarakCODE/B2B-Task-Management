import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "../ui/textarea"
import { useAuthContext } from "@/context/auth-provider"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { editWorkspaceMutationFn, uploadWorkspaceLogoMutationFn } from "@/lib/api"
import useWorkspaceId from "@/hooks/use-workspace-id"
import { toast } from "sonner"
import { Camera, Loader } from "lucide-react"
import { Permissions } from "@/constant"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

export default function EditWorkspaceForm() {
  const { workspace, hasPermission } = useAuthContext()
  const canEditWorkspace = hasPermission(Permissions.EDIT_WORKSPACE)
  const logoInputRef = useRef<HTMLInputElement | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState("")

  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()

  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useMutation({
    mutationFn: editWorkspaceMutationFn,
  })

  const { mutate: uploadLogo, isPending: isUploadingLogo } = useMutation({
    mutationFn: uploadWorkspaceLogoMutationFn,
  })

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "Workspace name is required",
    }),
    description: z.string().trim(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (workspace) {
      form.setValue("name", workspace.name)
      form.setValue("description", workspace?.description || "")
    }
  }, [form, workspace])

  const previewUrl = useMemo(() => {
    if (!logoFile) return uploadedLogoUrl || workspace?.logo || ""
    return URL.createObjectURL(logoFile)
  }, [logoFile, uploadedLogoUrl, workspace?.logo])

  useEffect(() => {
    if (!logoFile || !previewUrl.startsWith("blob:")) return

    return () => URL.revokeObjectURL(previewUrl)
  }, [logoFile, previewUrl])

  const invalidateWorkspaceQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["workspace"],
    })
    queryClient.invalidateQueries({
      queryKey: ["userWorkspaces"],
    })
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isUpdatingWorkspace) return
    const payload = {
      workspaceId: workspaceId,
      data: { ...values },
    }
    updateWorkspace(payload, {
      onSuccess: () => {
        invalidateWorkspaceQueries()
        toast.success("Workspace updated successfully")
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  const uploadLogoFile = (file: File) => {
    if (isUploadingLogo) return

    uploadLogo(
      {
        workspaceId,
        logoFile: file,
      },
      {
        onSuccess: (response) => {
          setUploadedLogoUrl(response.workspace?.logo || "")
          setLogoFile(null)
          if (logoInputRef.current) {
            logoInputRef.current.value = ""
          }
          invalidateWorkspaceQueries()
          toast.success("Workspace logo uploaded successfully")
        },
        onError: (error) => {
          toast.error(error.message)
        },
      },
    )
  }

  const onLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLogoFile(file)
    uploadLogoFile(file)
  }

  return (
    <div className="max-w-5xl">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Workspace profile</CardTitle>
          <CardDescription>
            These details are visible in navigation, member screens, and workspace menus.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 border-t px-4 py-5 md:grid-cols-[240px_minmax(0,1fr)] md:px-6">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-medium">Workspace logo</h3>
                  <p className="text-sm text-muted-foreground">
                    Click the logo to upload a new workspace image.
                  </p>
                </div>
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      disabled={!canEditWorkspace || isUploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="group relative size-24 shrink-0 overflow-hidden rounded-xl border bg-muted outline-none ring-offset-background transition hover:border-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60"
                      aria-label="Upload workspace logo"
                    >
                      <Avatar className="size-full rounded-xl">
                        {previewUrl ? (
                          <AvatarImage
                            src={previewUrl}
                            alt={workspace?.name || "Workspace logo"}
                            className="rounded-xl"
                          />
                        ) : (
                          <AvatarFallback className="rounded-xl text-3xl font-semibold">
                            {workspace?.name?.split(" ")?.[0]?.charAt(0)?.toUpperCase() || "W"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="absolute inset-x-0 bottom-0 flex h-8 items-center justify-center gap-1 bg-background/90 text-xs font-medium opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                        {isUploadingLogo ? (
                          <Loader className="size-3.5 animate-spin" />
                        ) : (
                          <Camera className="size-3.5" />
                        )}
                        {isUploadingLogo ? "Uploading" : "Change"}
                      </span>
                    </button>

                    <div className="min-w-0 text-sm">
                      <p className="font-medium">
                        {logoFile ? logoFile.name : "Use a square logo for best results."}
                      </p>
                      <p className="text-muted-foreground">
                        Accepted formats are images supported by the browser. The upload starts
                        immediately after selection.
                      </p>
                      {isUploadingLogo && (
                        <p className="mt-2 inline-flex items-center gap-2 text-primary">
                          <Loader className="size-3.5 animate-spin" />
                          Saving logo
                        </p>
                      )}
                    </div>
                  </div>

                  <Input
                    ref={logoInputRef}
                    id="workspace-logo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={!canEditWorkspace || isUploadingLogo}
                    onChange={onLogoChange}
                  />
                </div>
              </div>

              <FieldGroup className="border-t">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={!!fieldState.error}
                      data-disabled={!canEditWorkspace}
                      className="grid gap-4 px-4 py-5 md:grid-cols-[240px_minmax(0,1fr)] md:px-6"
                    >
                      <div className="min-w-0 space-y-1">
                        <FieldLabel htmlFor="name">Workspace name</FieldLabel>
                        <FieldDescription>
                          This is the name of your company, team, or organization.
                        </FieldDescription>
                      </div>
                      <FieldContent className="min-w-0">
                        <Input
                          id="name"
                          placeholder="Taco's Co."
                          disabled={!canEditWorkspace}
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                      </FieldContent>
                    </Field>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={!!fieldState.error}
                      data-disabled={!canEditWorkspace}
                      className="grid gap-4 border-t px-4 py-5 md:grid-cols-[240px_minmax(0,1fr)] md:px-6"
                    >
                      <div className="min-w-0 space-y-1">
                        <FieldLabel htmlFor="description">
                          Workspace description
                          <span className="ml-2 text-xs font-extralight text-muted-foreground">
                            Optional
                          </span>
                        </FieldLabel>
                        <FieldDescription>
                          Give your members some context about your workspace.
                        </FieldDescription>
                      </div>
                      <FieldContent className="min-w-0">
                        <Textarea
                          id="description"
                          rows={5}
                          disabled={!canEditWorkspace}
                          className="resize-none disabled:pointer-events-none disabled:opacity-90"
                          placeholder="Our team organizes marketing projects and tasks here."
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                        <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                      </FieldContent>
                    </Field>
                  )}
                />
              </FieldGroup>

              {canEditWorkspace && (
                <div className="flex justify-end border-t bg-muted/30 px-4 py-4 md:px-6">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={isUpdatingWorkspace}
                    type="submit"
                  >
                    {isUpdatingWorkspace && <Loader className="animate-spin" />}
                    Update workspace
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
