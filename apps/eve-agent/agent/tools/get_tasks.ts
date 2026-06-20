import { defineTool } from "eve/tools";
import { z } from "zod";
import { connectDb } from "../lib/db.js";
import { TaskModel } from "../lib/models.js";

export default defineTool({
  description: "Get tasks in a specific workspace and optionally filter by project and status.",
  inputSchema: z.object({
    workspaceId: z.string().describe("The ID of the workspace."),
    projectId: z.string().optional().describe("Optional ID of the project to filter by."),
    status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional().describe("Optional task status to filter by."),
  }),
  async execute({ workspaceId, projectId, status }) {
    await connectDb();
    const query: any = { workspace: workspaceId };
    if (projectId) {
      query.project = projectId;
    }
    if (status) {
      query.status = status;
    }
    const tasks = await TaskModel.find(query).lean();
    return {
      tasks: tasks.map((t: any) => ({
        id: t._id.toString(),
        taskCode: t.taskCode,
        title: t.title,
        description: t.description || "",
        status: t.status,
        priority: t.priority,
        taskType: t.taskType,
        storyPoints: t.storyPoints,
        assignedTo: t.assignedTo ? t.assignedTo.toString() : null,
      })),
    };
  },
});
