import { Router } from "express"
import {
  createDocumentController,
  deleteDocumentController,
  getDocumentsController,
} from "../controllers/document.controller"
import { upload } from "../middlewares/upload.middleware"

const documentRoutes = Router()

documentRoutes.get("/workspace/:workspaceId", getDocumentsController)
documentRoutes.post("/workspace/:workspaceId", upload.single("file"), createDocumentController)
documentRoutes.delete("/:documentId/workspace/:workspaceId", deleteDocumentController)

export default documentRoutes
