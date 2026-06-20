import { defineTool } from "eve/tools";
import { z } from "zod";
import { connectDb } from "../lib/db.js";
import { TaskModel } from "../lib/models.js";

export default defineTool({
  description: "Update task properties (status, priority, type, assignee) in the database.",
  inputSchema: z.object({
    taskId: z.string().describe("The ID of the task to update."),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional().describe("New status of the task."),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().describe("New priority level."),
    taskType: z.enum(["FEATURE", "BUG", "CHORE", "REFACTOR"]).optional().describe("New type."),
    storyPoints: z.number().optional().describe("New story points value."),
    assignedTo: z.string().optional().describe("New assignee user ID (pass null or empty string to unassign)."),
  }),
  async execute({ taskId, status, priority, taskType, storyPoints, assignedTo }) {
    await connectDb();
    
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (taskType !== undefined) updateData.taskType = taskType;
    if (storyPoints !== undefined) updateData.storyPoints = storyPoints;
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo === "" || assignedTo === null ? null : assignedTo;
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedTask) {
      return { error: `Task not found with ID ${taskId}` };
    }

    return {
      success: true,
      task: {
        id: updatedTask._id.toString(),
        taskCode: updatedTask.taskCode,
        title: updatedTask.title,
        status: updatedTask.status,
        priority: updatedTask.priority,
        assignedTo: updatedTask.assignedTo ? updatedTask.assignedTo.toString() : null,
      },
    };
  },
});
