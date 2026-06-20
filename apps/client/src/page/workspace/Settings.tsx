import EditWorkspaceForm from "@/components/workspace/edit-workspace-form"
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card"
import WorkspacePermissions from "@/components/workspace/settings/workspace-permissions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Permissions } from "@/constant"
import withPermission from "@/hoc/with-permission"
import PageContainer from "@/components/resuable/page-container"

const Settings = () => {
  return (
    <PageContainer className="flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-1.5 border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace preferences, configurations, and permissions.
        </p>
      </div>

      <Tabs defaultValue="workspace" className="flex flex-col gap-6">
        <TabsList className="self-start">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="workspace" className="flex flex-col gap-6 m-0 outline-none">
          <EditWorkspaceForm />
          <DeleteWorkspaceCard />
        </TabsContent>
        <TabsContent value="roles" className="m-0 outline-none">
          <WorkspacePermissions />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

const SettingsWithPermission = withPermission(Settings, Permissions.MANAGE_WORKSPACE_SETTINGS)

export default SettingsWithPermission
