import WorkspaceIntegrations from "@/components/workspace/settings/workspace-integrations"
import { Permissions } from "@/constant"
import withPermission from "@/hoc/with-permission"
import PageContainer from "@/components/resuable/page-container"

const Integrations = () => {
  return (
    <PageContainer className="py-6 flex flex-col gap-6">
      <WorkspaceIntegrations />
    </PageContainer>
  )
}

const IntegrationsWithPermission = withPermission(
  Integrations,
  Permissions.MANAGE_WORKSPACE_SETTINGS,
)

export default IntegrationsWithPermission
