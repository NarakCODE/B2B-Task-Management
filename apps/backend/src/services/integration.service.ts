import IntegrationModel from "../models/integration.model";
import WorkspaceModel from "../models/workspace.model";
import TaskModel from "../models/task.model";
import CommentModel from "../models/comment.model";
import UserModel from "../models/user.model";
import { logActivity } from "./activity-log.service";
import { NotFoundException, BadRequestException } from "../utils/appError";
import { TaskStatusEnum } from "../enums/task.enum";
import crypto from "crypto";

// 1. Create or Update an Integration
export const createOrUpdateIntegrationService = async (
  workspaceId: string,
  provider: "GITHUB" | "SLACK",
  data: { webhookUrl?: string; secret?: string; isActive?: boolean }
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  let integration = await IntegrationModel.findOne({ workspace: workspaceId, provider });

  if (integration) {
    if (data.webhookUrl !== undefined) integration.webhookUrl = data.webhookUrl;
    if (data.secret !== undefined) integration.secret = data.secret;
    if (data.isActive !== undefined) integration.isActive = data.isActive;
    await integration.save();
  } else {
    integration = new IntegrationModel({
      workspace: workspaceId,
      provider,
      webhookUrl: data.webhookUrl || null,
      secret: data.secret || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    await integration.save();
  }

  return { integration };
};

// 2. Get Workspace Integrations
export const getWorkspaceIntegrationsService = async (workspaceId: string) => {
  const integrations = await IntegrationModel.find({ workspace: workspaceId });
  return { integrations };
};

// 3. Trigger Slack Webhook Notification
export const triggerSlackNotification = async (workspaceId: string, text: string) => {
  try {
    const slackIntegration = await IntegrationModel.findOne({
      workspace: workspaceId,
      provider: "SLACK",
      isActive: true,
    });

    if (slackIntegration && slackIntegration.webhookUrl) {
      const response = await fetch(slackIntegration.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        console.error(`Slack webhook responded with status ${response.status}`);
      } else {
        console.log(`Slack notification sent for workspace ${workspaceId}`);
      }
    }
  } catch (error) {
    console.error("Error triggering Slack notification:", error);
  }
};

// 4. Verify GitHub Webhook Signature
const verifyGithubSignature = (signature: string, payload: string, secret: string): boolean => {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
};

// 5. Handle GitHub Webhook (Push Event)
export const handleGithubWebhookService = async (
  workspaceId: string,
  signature: string | undefined,
  rawBody: string,
  payload: any
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const githubIntegration = await IntegrationModel.findOne({
    workspace: workspaceId,
    provider: "GITHUB",
    isActive: true,
  });

  if (!githubIntegration) {
    console.log(`No active GitHub integration for workspace ${workspaceId}`);
    return { success: false, message: "No active GitHub integration" };
  }

  // Verify signature if a secret is configured
  if (githubIntegration.secret) {
    if (!signature) {
      throw new BadRequestException("Missing X-Hub-Signature-256 header");
    }
    const isValid = verifyGithubSignature(signature, rawBody, githubIntegration.secret);
    if (!isValid) {
      throw new BadRequestException("Invalid GitHub webhook signature");
    }
  }

  const commits = payload.commits || [];
  let updatedTasksCount = 0;

  for (const commit of commits) {
    const message = commit.message || "";
    // Regex matches patterns like 'task-abc' (case-insensitive)
    const taskCodeMatches = message.match(/task-[a-f0-9]{3}/gi);

    if (!taskCodeMatches) continue;

    // Remove duplicates from matches in the same commit
    const uniqueMatches = Array.from(new Set(taskCodeMatches.map((m: string) => m.toLowerCase()))) as string[];

    for (const taskCode of uniqueMatches) {
      const task = await TaskModel.findOne({ workspace: workspaceId, taskCode });

      if (!task) {
        console.log(`Task ${taskCode} not found in workspace ${workspaceId}`);
        continue;
      }

      // 1. Determine action and update status if necessary
      const isFixMessage = /(fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved)\s+task-[a-f0-9]{3}/i.test(message);
      let statusChanged = false;
      const oldStatus = task.status;

      if (isFixMessage) {
        if (task.status !== TaskStatusEnum.DONE) {
          task.status = TaskStatusEnum.DONE;
          statusChanged = true;
        }
      } else {
        // If it's a mention and task is currently in TODO or BACKLOG, transition to IN_PROGRESS
        if (task.status === TaskStatusEnum.TODO || task.status === TaskStatusEnum.BACKLOG) {
          task.status = TaskStatusEnum.IN_PROGRESS;
          statusChanged = true;
        }
      }

      await task.save();
      updatedTasksCount++;

      // 2. Identify committer or fallback to workspace owner
      let user = await UserModel.findOne({ email: commit.author.email });
      const userId = user ? user._id : workspace.owner;

      // 3. Post a comment on the task detailing the commit
      const commentContent = `🔧 **GitHub Commit** by *${commit.author.name}*:\n> ${commit.message.replace(/\n/g, "\n> ")}\n\n[View Commit Details](${commit.url})`;
      const comment = new CommentModel({
        content: commentContent,
        task: task._id,
        user: userId,
        workspace: workspaceId,
      });
      await comment.save();

      // 4. Log Activity for comment and status change
      await logActivity({
        workspaceId: workspaceId.toString(),
        projectId: task.project?.toString() || null,
        sprintId: task.sprint?.toString() || null,
        taskId: task._id.toString(),
        userId: userId.toString(),
        actionType: "ADD_COMMENT",
        description: `added a GitHub commit comment to task "${task.title}"`,
        metadata: { commentId: comment._id, commitHash: commit.id },
      });

      if (statusChanged) {
        await logActivity({
          workspaceId: workspaceId.toString(),
          projectId: task.project?.toString() || null,
          sprintId: task.sprint?.toString() || null,
          taskId: task._id.toString(),
          userId: userId.toString(),
          actionType: "UPDATE_TASK_STATUS",
          description: `changed status of task "${task.title}" to ${task.status} via GitHub commit`,
          metadata: { oldStatus, newStatus: task.status, commitHash: commit.id },
        });

        // 5. Trigger Slack notification
        const slackMessage = `🔧 *Task Updated via GitHub Commit*:\n*Task*: <http://localhost:5173/workspace/${workspaceId}/project/${task.project}/task/${task._id}|${task.title}> (${task.taskCode})\n*Committer*: ${commit.author.name}\n*Commit Message*: "${commit.message.trim()}"\n*Status*: ${oldStatus} ➡️ *${task.status}*\n*URL*: ${commit.url}`;
        await triggerSlackNotification(workspaceId.toString(), slackMessage);
      } else {
        // Trigger Slack notification for comment only
        const slackMessage = `💬 *New GitHub Commit Comment*:\n*Task*: <http://localhost:5173/workspace/${workspaceId}/project/${task.project}/task/${task._id}|${task.title}> (${task.taskCode})\n*Committer*: ${commit.author.name}\n*Message*: "${commit.message.trim()}"\n*URL*: ${commit.url}`;
        await triggerSlackNotification(workspaceId.toString(), slackMessage);
      }
    }
  }

  return { success: true, updatedTasks: updatedTasksCount };
};
