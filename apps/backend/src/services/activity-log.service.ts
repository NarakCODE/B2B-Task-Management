import ActivityLogModel from "../models/activity-log.model";
import UserModel from "../models/user.model";

export const logActivity = async (params: {
  workspaceId: string;
  projectId?: string | null;
  sprintId?: string | null;
  taskId?: string | null;
  userId: string;
  actionType: string;
  description?: string;
  metadata?: any;
}) => {
  try {
    const { workspaceId, projectId, sprintId, taskId, userId, actionType, description, metadata } = params;

    let finalDescription = description || "";

    if (!description) {
      const user = await UserModel.findById(userId);
      const userName = user?.name || "Someone";
      
      switch (actionType) {
        case "CREATE_TASK":
          finalDescription = `${userName} created a new task`;
          break;
        case "UPDATE_TASK_STATUS":
          finalDescription = `${userName} changed task status to ${metadata?.newStatus || "unknown"}`;
          break;
        case "UPDATE_TASK_PRIORITY":
          finalDescription = `${userName} changed task priority to ${metadata?.newPriority || "unknown"}`;
          break;
        case "ADD_COMMENT":
          finalDescription = `${userName} added a comment`;
          break;
        case "CREATE_SPRINT":
          finalDescription = `${userName} created a new sprint`;
          break;
        case "START_SPRINT":
          finalDescription = `${userName} started sprint`;
          break;
        case "COMPLETE_SPRINT":
          finalDescription = `${userName} completed sprint`;
          break;
        default:
          finalDescription = `${userName} performed action ${actionType}`;
      }
    }

    const log = new ActivityLogModel({
      workspace: workspaceId,
      project: projectId || null,
      sprint: sprintId || null,
      task: taskId || null,
      user: userId,
      actionType,
      description: finalDescription,
      metadata: metadata || null,
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getWorkspaceTimelineService = async (workspaceId: string) => {
  const logs = await ActivityLogModel.find({ workspace: workspaceId })
    .sort({ createdAt: -1 })
    .populate("user", "_id name profilePicture")
    .populate("project", "_id name emoji")
    .populate("sprint", "_id name status")
    .populate("task", "_id title taskCode")
    .limit(100);

  return { logs };
};

export const getProjectTimelineService = async (workspaceId: string, projectId: string) => {
  const logs = await ActivityLogModel.find({ workspace: workspaceId, project: projectId })
    .sort({ createdAt: -1 })
    .populate("user", "_id name profilePicture")
    .populate("sprint", "_id name status")
    .populate("task", "_id title taskCode")
    .limit(100);

  return { logs };
};

export const getSprintTimelineService = async (workspaceId: string, sprintId: string) => {
  const logs = await ActivityLogModel.find({ workspace: workspaceId, sprint: sprintId })
    .sort({ createdAt: -1 })
    .populate("user", "_id name profilePicture")
    .populate("task", "_id title taskCode")
    .limit(100);

  return { logs };
};

export const getTaskTimelineService = async (workspaceId: string, taskId: string) => {
  const logs = await ActivityLogModel.find({ workspace: workspaceId, task: taskId })
    .sort({ createdAt: -1 })
    .populate("user", "_id name profilePicture")
    .limit(100);

  return { logs };
};
