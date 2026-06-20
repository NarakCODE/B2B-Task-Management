import NotificationModel from "../models/notification.model"
import UserModel from "../models/user.model"

export const createNotificationService = async (params: {
  recipient: string
  sender: string
  workspace: string
  project?: string | null
  task?: string | null
  type: "ASSIGNED" | "UNASSIGNED" | "COMMENT" | "STATUS_CHANGE"
  title: string
  message: string
}) => {
  // Prevent sending notification to oneself
  if (params.recipient.toString() === params.sender.toString()) {
    return null
  }

  const notification = new NotificationModel({
    recipient: params.recipient,
    sender: params.sender,
    workspace: params.workspace,
    project: params.project || null,
    task: params.task || null,
    type: params.type,
    title: params.title,
    message: params.message,
  })

  await notification.save()
  return notification
}

export const getUserNotificationsService = async (userId: string) => {
  const notifications = await NotificationModel.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .populate("sender", "_id name profilePicture")
    .populate("task", "_id title taskCode")
    .populate("project", "_id name")
    .limit(50)

  const unreadCount = await NotificationModel.countDocuments({
    recipient: userId,
    isRead: false,
  })

  return { notifications, unreadCount }
}

export const markNotificationAsReadService = async (userId: string, notificationId: string) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true },
  )

  return { notification }
}

export const markAllNotificationsAsReadService = async (userId: string) => {
  await NotificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true })

  return { success: true }
}
