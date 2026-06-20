import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import WorkspaceBilling from "@/components/workspace/settings/workspace-billing";
import { Permissions } from "@/constant";
import withPermission from "@/hoc/with-permission";
import PageContainer from "@/components/resuable/page-container";

const Billing = () => {
  return (
    <PageContainer className="h-auto py-2">
      <WorkspaceHeader />
      <Separator className="my-4 " />
      <main>
        <div className="w-full py-3">
          <WorkspaceBilling />
        </div>
      </main>
    </PageContainer>
  );
};

const BillingWithPermission = withPermission(
  Billing,
  Permissions.MANAGE_WORKSPACE_SETTINGS
);

export default BillingWithPermission;
