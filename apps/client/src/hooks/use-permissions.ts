import { PermissionType } from "@/constant"
import { UserType, WorkspaceWithMembersType } from "@/types/api.type"
import { useMemo } from "react"

const usePermissions = (
  user: UserType | undefined,
  workspace: WorkspaceWithMembersType | undefined,
) => {
  return useMemo<PermissionType[]>(() => {
    if (user && workspace) {
      const member = workspace.members.find((member) => member.userId === user._id)
      if (member) {
        return member.role.permissions || []
      }
    }
    return []
  }, [user, workspace])
}

export default usePermissions
