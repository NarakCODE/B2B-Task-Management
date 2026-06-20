import { Request, Response } from "express"
import { asyncHandler } from "../middlewares/asyncHandler.middleware"
import { HTTPSTATUS } from "../config/http.config"
import {
  getUserNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
} from "../services/notification.service"
import { isValidObjectId } from "mongoose"
import { BadRequestException } from "../utils/appError"

export const getUserNotificationsController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id

  const result = await getUserNotificationsService(userId)

  return res.status(HTTPSTATUS.OK).json({
    message: "User notifications fetched successfully",
    ...result,
  })
})

export const markNotificationAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id
    const { id } = req.params

    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid notification ID")
    }

    const result = await markNotificationAsReadService(userId, id as string)

    return res.status(HTTPSTATUS.OK).json({
      message: "Notification marked as read successfully",
      ...result,
    })
  },
)

export const markAllNotificationsAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id

    const result = await markAllNotificationsAsReadService(userId)

    return res.status(HTTPSTATUS.OK).json({
      message: "All notifications marked as read successfully",
      ...result,
    })
  },
)
