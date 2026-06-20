import { Router } from "express"
import {
  getUserNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notification.controller"

const notificationRoutes = Router()

notificationRoutes.get("/", getUserNotificationsController)
notificationRoutes.put("/read-all", markAllNotificationsAsReadController)
notificationRoutes.put("/:id/read", markNotificationAsReadController)

export default notificationRoutes
