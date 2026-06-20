import { defineTool } from "eve/tools";
import { z } from "zod";
import { connectDb } from "../lib/db.js";
import { TaskModel, WorkspaceModel } from "../lib/models.js";

export default defineTool({
  description: "Create a new task in a project and workspace.",
  inputSchema: z.object({
    workspaceId: z.string().describe("The ID of the workspace."),
    projectId: z.string().describe("The ID of the project."),
    title: z.string().min(1).describe("The title of the task."),
    description: z.string().optional().describe("Optional description of the task."),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional().default("TODO").describe("Task status."),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM").describe("Task priority."),
    taskType: z.enum(["FEATURE", "BUG", "CHORE", "REFACTOR"]).optional().default("FEATURE").describe("Task type."),
    storyPoints: z.number().optional().describe("Optional story points."),
    assignedTo: z.string().optional().describe("Optional ID of the user to assign the task to."),
  }),
  async execute({ workspaceId, projectId, title, description, status, priority, taskType, storyPoints, assignedTo }) {
    await connectDb();
    
    // Find the workspace owner to use as creator
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      return { error: `Workspace not found with ID ${workspaceId}` };
    }

    const newTask = new TaskModel({
      title,
      description: description || null,
      project: projectId,
      workspace: workspaceId,
      status,
      priority,
      taskType,
      storyPoints: storyPoints || null,
      assignedTo: assignedTo || null,
      createdBy: workspace.owner,
    });

    await newTask.save();
    return {
      success: true,
      task: {
        id: newTask._id.toString(),
        taskCode: newTask.taskCode,
        title: newTask.title,
        status: newTask.status,
      },
    };
  },
});
