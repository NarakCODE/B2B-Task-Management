import InviteMember from "@/components/workspace/member/invite-member"
import AllMembers from "@/components/workspace/member/all-members"
import PageContainer from "@/components/resuable/page-container"

export default function Members() {
  return (
    <PageContainer className="py-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 pb-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight">Workspace Members</h1>
        <p className="text-sm text-muted-foreground">
          Workspace members can view and join all projects, tasks, and create new tasks in the
          workspace.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <InviteMember />
        <AllMembers />
      </div>
    </PageContainer>
  )
}
