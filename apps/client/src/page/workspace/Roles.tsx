import WorkspacePermissions from "@/components/workspace/settings/workspace-permissions"
import { Permissions } from "@/constant"
import withPermission from "@/hoc/with-permission"
import PageContainer from "@/components/resuable/page-container"

const Roles = () => {
  return (
    <PageContainer className="py-6 flex flex-col gap-6">
      <WorkspacePermissions />
    </PageContainer>
  )
}

const RolesWithPermission = withPermission(Roles, Permissions.MANAGE_WORKSPACE_SETTINGS)

export default RolesWithPermission
