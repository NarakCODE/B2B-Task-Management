import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createOrUpdateIntegrationService,
  getWorkspaceIntegrationsService,
  handleGithubWebhookService,
} from "../services/integration.service";
import { HTTPSTATUS } from "../config/http.config";
import { z } from "zod";

// Zod schemas for integration endpoints
const updateIntegrationSchema = z.object({
  webhookUrl: z.string().url("Must be a valid URL").optional(),
  secret: z.string().min(1, "Secret cannot be empty").optional(),
  isActive: z.boolean().optional(),
});

const providerSchema = z.enum(["GITHUB", "SLACK"]);

export const createOrUpdateIntegrationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const provider = providerSchema.parse(req.body.provider);
    const body = updateIntegrationSchema.parse(req.body);

    // Only OWNER and ADMIN can manage workspace settings and integrations
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS]);

    const { integration } = await createOrUpdateIntegrationService(workspaceId, provider, body);

    return res.status(HTTPSTATUS.OK).json({
      message: `${provider} integration updated successfully`,
      integration,
    });
  }
);

export const getWorkspaceIntegrationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Any workspace member can view integrations
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { integrations } = await getWorkspaceIntegrationsService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace integrations fetched successfully",
      integrations,
    });
  }
);

export const handleGithubWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const signature = req.headers["x-hub-signature-256"] as string | undefined;
    const rawBody = (req as any).rawBody || "";

    const result = await handleGithubWebhookService(
      workspaceId,
      signature,
      rawBody,
      req.body
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Webhook processed successfully",
      result,
    });
  }
);
