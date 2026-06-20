import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import WorkspaceIntegrations from "@/components/workspace/settings/workspace-integrations";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";
import PageContainer from "@/components/resuable/page-container";

const Integrations = () => {
  return (
    <PageContainer className="h-auto py-2">
      <WorkspaceHeader />
      <Separator className="my-4 " />
      <main>
        <div className="w-full py-3">
          <WorkspaceIntegrations />
        </div>
      </main>
    </PageContainer>
  );
};

const IntegrationsWithPermission = withPermission(
  Integrations,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default IntegrationsWithPermission;
