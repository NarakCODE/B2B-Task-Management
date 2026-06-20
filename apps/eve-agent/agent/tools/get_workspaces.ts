import { defineTool } from "eve/tools";
import { z } from "zod";
import { connectDb } from "../lib/db.js";
import { WorkspaceModel } from "../lib/models.js";

export default defineTool({
  description: "Get all active workspaces in the B2B Scrum system.",
  inputSchema: z.object({}),
  async execute() {
    await connectDb();
    const workspaces = await WorkspaceModel.find().lean();
    return {
      workspaces: workspaces.map((w: any) => ({
        id: w._id.toString(),
        name: w.name,
        description: w.description || "",
        inviteCode: w.inviteCode,
      })),
    };
  },
});
