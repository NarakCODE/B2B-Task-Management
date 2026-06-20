import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createCheckoutSessionService,
  createPortalSessionService,
  handleStripeWebhookService,
  getWorkspaceSubscriptionService,
} from "../services/billing.service";
import { HTTPSTATUS } from "../config/http.config";
import { BadRequestException } from "../utils/appError";

export const createCheckoutSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Only OWNER/ADMIN can initiate checkouts
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS]);

    const { url } = await createCheckoutSessionService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Checkout session created",
      url,
    });
  }
);

export const createPortalSessionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Only OWNER/ADMIN can initiate portal sessions
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS]);

    const { url } = await createPortalSessionService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Portal session created",
      url,
    });
  }
);

export const getWorkspaceSubscriptionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Any workspace member can view subscription status
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const subscription = await getWorkspaceSubscriptionService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription details fetched successfully",
      subscription,
    });
  }
);

export const handleStripeWebhookController = asyncHandler(
  async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string | undefined;
    const rawBody = (req as any).rawBody || "";

    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }

    const result = await handleStripeWebhookService(rawBody, signature);

    return res.status(HTTPSTATUS.OK).json(result);
  }
);
