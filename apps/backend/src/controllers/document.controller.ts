import { Request, Response } from "express"
import { HTTPSTATUS } from "../config/http.config"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { BadRequestException } from "../utils/appError"
import { getMemberRoleInWorkspace } from "../services/member.service"
import { roleGuard } from "../utils/roleGuard"
import { Permissions } from "../enums/role.enum"
import { workspaceIdSchema } from "../validation/workspace.validation"
import {
  createDocumentSchema,
  documentIdSchema,
  getDocumentsQuerySchema,
} from "../validation/document.validation"
import {
  createDocumentService,
  deleteDocumentService,
  getDocumentsService,
} from "../services/document.service"

export const createDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const body = createDocumentSchema.parse(req.body)

  if (!req.file) {
    throw new BadRequestException("No file provided")
  }

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  const { document } = await createDocumentService({
    workspaceId,
    userId,
    file: req.file,
    ...body,
  })

  return res.status(HTTPSTATUS.CREATED).json({
    message: "Document uploaded successfully",
    document,
  })
})

export const getDocumentsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const query = getDocumentsQuerySchema.parse(req.query)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.VIEW_ONLY])

  const { documents } = await getDocumentsService({
    workspaceId,
    ...query,
  })

  return res.status(HTTPSTATUS.OK).json({
    message: "Documents fetched successfully",
    documents,
  })
})

export const deleteDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  const workspaceId = workspaceIdSchema.parse(req.params.workspaceId)
  const documentId = documentIdSchema.parse(req.params.documentId)

  const { role } = await getMemberRoleInWorkspace(userId, workspaceId)
  roleGuard(role, [Permissions.EDIT_TASK])

  await deleteDocumentService(workspaceId, documentId)

  return res.status(HTTPSTATUS.OK).json({
    message: "Document deleted successfully",
  })
})
