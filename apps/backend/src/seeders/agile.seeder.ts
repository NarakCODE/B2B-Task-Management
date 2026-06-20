import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import ProjectModel from "../models/project.model";
import SprintModel from "../models/sprint.model";
import TaskModel from "../models/task.model";
import CommentModel from "../models/comment.model";
import TimeLogModel from "../models/time-log.model";
import ActivityLogModel from "../models/activity-log.model";
import { Roles } from "../enums/role.enum";
import { TaskPriorityEnum, TaskStatusEnum, TaskTypeEnum } from "../enums/task.enum";
import { logActivity } from "../services/activity-log.service";
import AccountModel from "../models/account.model";
import { ProviderEnum } from "../enums/account-provider.enum";

const seedAgileData = async () => {
  console.log("Starting Agile SDLC Seeding...");

  try {
    await connectDatabase();

    // 1. Create a Test User
    let user = await UserModel.findOne({ email: "dev@example.com" });
    if (!user) {
      user = new UserModel({
        name: "Emma Software Dev",
        email: "dev@example.com",
        password: "Password123",
        isActive: true,
      });
      await user.save();
      console.log("Created test user: dev@example.com (Password: Password123)");
    } else {
      user.password = "Password123";
      await user.save();
      console.log("Updated test user password to: Password123");
    }

    // Ensure Account exists
    let account = await AccountModel.findOne({ provider: ProviderEnum.EMAIL, providerId: "dev@example.com" });
    if (!account) {
      account = new AccountModel({
        userId: user._id,
        provider: ProviderEnum.EMAIL,
        providerId: "dev@example.com",
      });
      await account.save();
      console.log("Created Account record for test user");
    }

    // 2. Create a Workspace
    let workspace = await WorkspaceModel.findOne({ name: "Agile Development Workspace" });
    if (!workspace) {
      workspace = new WorkspaceModel({
        name: "Agile Development Workspace",
        description: "A sandbox workspace for testing Agile scrum sprints and timeline histories.",
        owner: user._id,
      });
      await workspace.save();
      console.log("Created workspace: Agile Development Workspace");
    } else {
      console.log("Using existing workspace");
    }

    // Update user's current workspace
    user.currentWorkspace = workspace._id;
    await user.save();

    // 3. Ensure User is Workspace Owner member
    const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });
    if (!ownerRole) {
      throw new Error("Roles not seeded yet. Please run 'npm run seed' first to seed baseline roles.");
    }

    let member = await MemberModel.findOne({ userId: user._id, workspaceId: workspace._id });
    if (!member) {
      member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
      });
      await member.save();
      console.log("Assigned user as workspace Owner.");
    } else {
      member.role = ownerRole._id as any;
      await member.save();
      console.log("Updated user's workspace role reference.");
    }

    // Repair any existing members with broken roles
    const memberList = await MemberModel.find({});
    const defaultMemberRole = await RoleModel.findOne({ name: Roles.MEMBER });
    for (const m of memberList) {
      const r = await RoleModel.findById(m.role);
      if (!r) {
        if (m.userId.toString() === user._id.toString() && m.workspaceId.toString() === workspace._id.toString()) {
          m.role = ownerRole._id as any;
        } else if (defaultMemberRole) {
          m.role = defaultMemberRole._id as any;
        }
        await m.save();
        console.log(`Repaired broken role for member ${m.userId} in workspace ${m.workspaceId}`);
      }
    }

    // 4. Create a Project
    let project = await ProjectModel.findOne({ name: "Core Commerce API", workspace: workspace._id });
    if (!project) {
      project = new ProjectModel({
        name: "Core Commerce API",
        description: "Payment service and shopping cart back-end microservice development.",
        emoji: "🛒",
        workspace: workspace._id,
        createdBy: user._id,
      });
      await project.save();
      console.log("Created project: Core Commerce API");
    } else {
      console.log("Using existing project");
    }

    // Clear old Sprints and Tasks in this project to prevent collisions during tests
    await SprintModel.deleteMany({ project: project._id });
    await TaskModel.deleteMany({ project: project._id });
    await CommentModel.deleteMany({ workspace: workspace._id });
    await TimeLogModel.deleteMany({ workspace: workspace._id });
    await ActivityLogModel.deleteMany({ workspace: workspace._id });
    console.log("Cleared old project sprints, tasks, comments, time logs and timeline logs.");

    // 5. Create Sprints
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 10);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 3);

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 2);
    const thisWeekEnd = new Date();
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 5);

    const nextWeekStart = new Date();
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const nextWeekEnd = new Date();
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);

    const sprint1 = new SprintModel({
      name: "Sprint 1: Bootstrap & MVP Setup",
      description: "Initialize backend database schemas, routes, and Docker config.",
      startDate: lastWeekStart,
      endDate: lastWeekEnd,
      status: "COMPLETED",
      project: project._id,
      workspace: workspace._id,
      createdBy: user._id,
    });
    await sprint1.save();

    const sprint2 = new SprintModel({
      name: "Sprint 2: Authentication & Payment Integration",
      description: "Implement JWT, Google OAuth, and Stripe webhooks.",
      startDate: thisWeekStart,
      endDate: thisWeekEnd,
      status: "ACTIVE",
      project: project._id,
      workspace: workspace._id,
      createdBy: user._id,
    });
    await sprint2.save();

    const sprint3 = new SprintModel({
      name: "Sprint 3: Recommendations Engine",
      description: "Integrate vector search database for AI recommendations.",
      startDate: nextWeekStart,
      endDate: nextWeekEnd,
      status: "PLANNED",
      project: project._id,
      workspace: workspace._id,
      createdBy: user._id,
    });
    await sprint3.save();

    console.log("Created 3 Sprints (Completed, Active, Planned).");

    // 6. Create Tasks
    // Task 1: Complete Sprint 1 feature
    const task1 = new TaskModel({
      title: "Design Database Schemas",
      description: "Create mongoose schemas for User, Account and Workspace.",
      status: TaskStatusEnum.DONE,
      priority: TaskPriorityEnum.HIGH,
      taskType: TaskTypeEnum.FEATURE,
      storyPoints: 5,
      sprint: sprint1._id,
      assignedTo: user._id,
      createdBy: user._id,
      workspace: workspace._id,
      project: project._id,
    });
    await task1.save();

    // Task 2: Active Sprint 2 feature
    const task2 = new TaskModel({
      title: "Implement Passport Authentication",
      description: "Setup passport local and google strategies with cookie session.",
      status: TaskStatusEnum.IN_PROGRESS,
      priority: TaskPriorityEnum.HIGH,
      taskType: TaskTypeEnum.FEATURE,
      storyPoints: 8,
      sprint: sprint2._id,
      assignedTo: user._id,
      createdBy: user._id,
      workspace: workspace._id,
      project: project._id,
    });
    await task2.save();

    // Task 3: Active Sprint 2 bug
    const task3 = new TaskModel({
      title: "Fix Token Expiry Bug",
      description: "Cookies expire immediately on Chrome. Align maxAge value.",
      status: TaskStatusEnum.IN_REVIEW,
      priority: TaskPriorityEnum.HIGH,
      taskType: TaskTypeEnum.BUG,
      storyPoints: 2,
      sprint: sprint2._id,
      assignedTo: user._id,
      createdBy: user._id,
      workspace: workspace._id,
      project: project._id,
    });
    await task3.save();

    // Task 4: Active Sprint 2 chore
    const task4 = new TaskModel({
      title: "Setup CI/CD GitHub Actions",
      description: "Automate build and linting checks on every push to main.",
      status: TaskStatusEnum.TODO,
      priority: TaskPriorityEnum.LOW,
      taskType: TaskTypeEnum.CHORE,
      storyPoints: 3,
      sprint: sprint2._id,
      assignedTo: null,
      createdBy: user._id,
      workspace: workspace._id,
      project: project._id,
    });
    await task4.save();

    // Task 5: Backlog task
    const task5 = new TaskModel({
      title: "Integrate vector recommendation models",
      description: "Embed product catalogs and fetch nearest neighbors.",
      status: TaskStatusEnum.BACKLOG,
      priority: TaskPriorityEnum.MEDIUM,
      taskType: TaskTypeEnum.REFACTOR,
      storyPoints: 13,
      sprint: null,
      assignedTo: null,
      createdBy: user._id,
      workspace: workspace._id,
      project: project._id,
    });
    await task5.save();

    console.log("Created 5 Tasks with Agile attributes (Story Points, Types, Sprints).");

    // 7. Seed Comments
    const comment1 = new CommentModel({
      content: "Passport setup is completed. Running tests locally now.",
      task: task2._id,
      user: user._id,
      workspace: workspace._id,
    });
    await comment1.save();

    const comment2 = new CommentModel({
      content: "Found Chrome cookies issue. It was sameSite configuration value.",
      task: task3._id,
      user: user._id,
      workspace: workspace._id,
    });
    await comment2.save();

    console.log("Created task comments.");

    // 8. Seed Time Logs
    const log1 = new TimeLogModel({
      task: task2._id,
      user: user._id,
      workspace: workspace._id,
      durationMinutes: 180,
      description: "Initial passport local strategy coding.",
      loggedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    });
    await log1.save();

    const log2 = new TimeLogModel({
      task: task3._id,
      user: user._id,
      workspace: workspace._id,
      durationMinutes: 45,
      description: "Debugging Chrome developer console cookies.",
      loggedAt: new Date(),
    });
    await log2.save();

    console.log("Created Time Log entries.");

    // 9. Seed Activity Log Timeline
    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint1._id.toString(),
      userId: user._id.toString(),
      actionType: "CREATE_SPRINT",
      description: `created sprint "${sprint1.name}"`,
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint1._id.toString(),
      taskId: task1._id.toString(),
      userId: user._id.toString(),
      actionType: "CREATE_TASK",
      description: `created task "${task1.title}"`,
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint1._id.toString(),
      userId: user._id.toString(),
      actionType: "COMPLETE_SPRINT",
      description: `completed sprint "${sprint1.name}"`,
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint2._id.toString(),
      userId: user._id.toString(),
      actionType: "CREATE_SPRINT",
      description: `created sprint "${sprint2.name}"`,
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint2._id.toString(),
      userId: user._id.toString(),
      actionType: "START_SPRINT",
      description: `started sprint "${sprint2.name}"`,
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint2._id.toString(),
      taskId: task2._id.toString(),
      userId: user._id.toString(),
      actionType: "CREATE_TASK",
      description: `created task "${task2.title}"`,
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint2._id.toString(),
      taskId: task2._id.toString(),
      userId: user._id.toString(),
      actionType: "ADD_COMMENT",
      description: `commented on task "${task2.title}"`,
      metadata: { content: comment1.content },
    });

    await logActivity({
      workspaceId: workspace._id.toString(),
      projectId: project._id.toString(),
      sprintId: sprint2._id.toString(),
      taskId: task3._id.toString(),
      userId: user._id.toString(),
      actionType: "UPDATE_TASK_STATUS",
      description: `changed status of task "${task3.title}" to IN_REVIEW`,
      metadata: { oldStatus: TaskStatusEnum.TODO, newStatus: TaskStatusEnum.IN_REVIEW },
    });

    console.log("Activity logs created successfully.");
    console.log("=========================================");
    console.log("Seeding completed successfully.");
    console.log(`Log in email: dev@example.com`);
    console.log(`Log in password: Password123`);
    console.log("=========================================");

  } catch (error) {
    console.error("Error during Agile seeding:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedAgileData();
