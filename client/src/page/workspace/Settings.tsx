import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import EditWorkspaceForm from "@/components/workspace/edit-workspace-form";
import DeleteWorkspaceCard from "@/components/workspace/settings/delete-workspace-card";
import WorkspacePermissions from "@/components/workspace/settings/workspace-permissions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";
import PageContainer from "@/components/resuable/page-container";

const Settings = () => {
  return (
    <PageContainer className="py-6 space-y-6">
      <WorkspaceHeader />
      <Tabs defaultValue="workspace">
        <TabsList className="mb-6">
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="workspace" className="space-y-6">
          <EditWorkspaceForm />
          <DeleteWorkspaceCard />
        </TabsContent>
        <TabsContent value="roles">
          <WorkspacePermissions />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

const SettingsWithPermission = withPermission(
  Settings,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default SettingsWithPermission;
