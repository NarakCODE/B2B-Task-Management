import WorkspaceBilling from "@/components/workspace/settings/workspace-billing"
import { Permissions } from "@/constant"
import withPermission from "@/hoc/with-permission"
import PageContainer from "@/components/resuable/page-container"

const Billing = () => {
  return (
    <PageContainer className="py-6 flex flex-col gap-6">
      <WorkspaceBilling />
    </PageContainer>
  )
}

const BillingWithPermission = withPermission(Billing, Permissions.MANAGE_WORKSPACE_SETTINGS)

export default BillingWithPermission
