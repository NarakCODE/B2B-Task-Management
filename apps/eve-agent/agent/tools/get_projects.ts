import { defineTool } from "eve/tools";
import { z } from "zod";
import { connectDb } from "../lib/db";
import { ProjectModel } from "../lib/models";

export default defineTool({
  description: "Get all projects in a specific workspace.",
  inputSchema: z.object({
    workspaceId: z.string().describe("The ID of the workspace to fetch projects from."),
  }),
  async execute({ workspaceId }) {
    await connectDb();
    const projects = await ProjectModel.find({ workspace: workspaceId }).lean();
    return {
      projects: projects.map((p: any) => ({
        id: p._id.toString(),
        name: p.name,
        emoji: p.emoji,
        description: p.description || "",
      })),
    };
  },
});
