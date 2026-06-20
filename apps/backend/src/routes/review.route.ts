import { Router } from "express"
import {
  createReviewController,
  approveReviewController,
  rejectReviewController,
  getTaskReviewController,
  listWorkspaceReviewsController,
} from "../controllers/review.controller"

const reviewRoutes = Router()

reviewRoutes.post("/task/:id/workspace/:workspaceId/create", createReviewController)
reviewRoutes.post("/:id/workspace/:workspaceId/approve", approveReviewController)
reviewRoutes.post("/:id/workspace/:workspaceId/reject", rejectReviewController)
reviewRoutes.get("/task/:id/workspace/:workspaceId", getTaskReviewController)
reviewRoutes.get("/workspace/:workspaceId/all", listWorkspaceReviewsController)

export default reviewRoutes
