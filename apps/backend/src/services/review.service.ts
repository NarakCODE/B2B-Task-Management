import TaskReviewModel from "../models/task-review.model"
import TaskModel from "../models/task.model"
import { NotFoundException, BadRequestException } from "../utils/appError"
import { TaskStatusEnum } from "../enums/task.enum"

export const createReviewService = async (
  workspaceId: string,
  taskId: string,
  userId: string,
  body: {
    reviewers: string[]
    requiredApprovals?: number
    comments?: string
  },
) => {
  const task = await TaskModel.findOne({ _id: taskId, workspace: workspaceId })
  if (!task) {
    throw new NotFoundException("Task not found")
  }

  const existingReview = await TaskReviewModel.findOne({ task: taskId })
  if (existingReview) {
    throw new BadRequestException("A review already exists for this task")
  }

  const review = new TaskReviewModel({
    task: taskId,
    workspace: workspaceId,
    reviewers: body.reviewers,
    requiredApprovals: body.requiredApprovals || 1,
    approvedBy: [],
    rejectedBy: [],
    comments: body.comments || null,
  })
  await review.save()

  return { review }
}

export const approveReviewService = async (
  workspaceId: string,
  reviewId: string,
  userId: string,
) => {
  const review = await TaskReviewModel.findOne({ _id: reviewId, workspace: workspaceId })
  if (!review) {
    throw new NotFoundException("Review not found")
  }

  if (review.approvedBy.some((id) => id.toString() === userId.toString())) {
    throw new BadRequestException("You have already approved this review")
  }

  if (review.rejectedBy.some((id) => id.toString() === userId.toString())) {
    review.rejectedBy = review.rejectedBy.filter((id) => id.toString() !== userId.toString())
  }

  review.approvedBy.push(userId as any)

  if (review.approvedBy.length >= review.requiredApprovals) {
    review.status = "APPROVED"
  }

  await review.save()
  return { review }
}

export const rejectReviewService = async (
  workspaceId: string,
  reviewId: string,
  userId: string,
  comments?: string,
) => {
  const review = await TaskReviewModel.findOne({ _id: reviewId, workspace: workspaceId })
  if (!review) {
    throw new NotFoundException("Review not found")
  }

  if (review.rejectedBy.some((id) => id.toString() === userId.toString())) {
    throw new BadRequestException("You have already rejected this review")
  }

  if (review.approvedBy.some((id) => id.toString() === userId.toString())) {
    review.approvedBy = review.approvedBy.filter((id) => id.toString() !== userId.toString())
  }

  review.rejectedBy.push(userId as any)
  review.status = "CHANGES_REQUESTED"
  if (comments) review.comments = comments

  await review.save()
  return { review }
}

export const getTaskReviewService = async (workspaceId: string, taskId: string) => {
  const review = await TaskReviewModel.findOne({ task: taskId, workspace: workspaceId })
    .populate("reviewers", "_id name profilePicture -password")
    .populate("approvedBy", "_id name profilePicture -password")
    .populate("rejectedBy", "_id name profilePicture -password")

  if (!review) {
    throw new NotFoundException("Review not found for this task")
  }

  return { review }
}

export const listWorkspaceReviewsService = async (
  workspaceId: string,
  status?: string,
  pageSize: number = 10,
  pageNumber: number = 1,
) => {
  const query: Record<string, any> = { workspace: workspaceId }
  if (status) query.status = status

  const totalCount = await TaskReviewModel.countDocuments(query)
  const skip = (pageNumber - 1) * pageSize

  const reviews = await TaskReviewModel.find(query)
    .skip(skip)
    .limit(pageSize)
    .populate("reviewers", "_id name profilePicture -password")
    .populate("approvedBy", "_id name profilePicture -password")
    .populate("rejectedBy", "_id name profilePicture -password")
    .populate("task", "_id title taskCode")
    .sort({ createdAt: -1 })

  const totalPages = Math.ceil(totalCount / pageSize)

  return { reviews, totalCount, totalPages, skip }
}
