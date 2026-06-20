import { Router } from "express";
import {
  createCommentController,
  getTaskCommentsController,
  updateCommentController,
  deleteCommentController,
} from "../controllers/comment.controller";

const commentRoutes = Router();

commentRoutes.post(
  "/task/:taskId/workspace/:workspaceId/create",
  createCommentController
);

commentRoutes.get(
  "/task/:taskId/workspace/:workspaceId/all",
  getTaskCommentsController
);

commentRoutes.put(
  "/:id/workspace/:workspaceId/update",
  updateCommentController
);

commentRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  deleteCommentController
);

export default commentRoutes;
