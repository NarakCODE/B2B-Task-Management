import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { workspaceIdSchema } from "../validation/workspace.validation"
import { Permissions } from "../enums/role.enum"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import { exportWorkspaceAuditService } from "../services/audit.service"
import { HTTPSTATUS } from "../config/http.config"

export const exportAuditController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS])

  const filters = {
    userId: req.query.userId as string | undefined,
    projectId: req.query.projectId as string | undefined,
    taskId: req.query.taskId as string | undefined,
    actionType: req.query.actionType as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  }

  const format = (req.query.format as string) === "csv" ? "csv" : "json"
  const { data, format: outputFormat } = await exportWorkspaceAuditService(
    workspaceId,
    filters,
    format,
  )

  if (outputFormat === "csv") {
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="audit-${workspaceId}.csv"`)
    return res.send(data)
  }

  return res.status(HTTPSTATUS.OK).json({
    message: "Audit log exported successfully",
    logs: data,
  })
})
