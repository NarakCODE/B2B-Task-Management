import SubscriptionModel from "../models/subscription.model";
import ProjectModel from "../models/project.model";
import MemberModel from "../models/member.model";
import { BadRequestException } from "./appError";

export const PLAN_LIMITS = {
  FREE: {
    maxMembers: 5,
    maxProjects: 2,
  },
  PRO: {
    maxMembers: 50,
    maxProjects: 15,
  },
  ENTERPRISE: {
    maxMembers: Infinity,
    maxProjects: Infinity,
  },
};

export const checkProjectLimit = async (workspaceId: string) => {
  const subscription = await SubscriptionModel.findOne({ workspace: workspaceId });
  const plan = subscription?.plan || "FREE";
  
  // If subscription status is not active/trialing, fallback to FREE plan limits
  const isActive = subscription ? ["active", "trialing"].includes(subscription.status) : true; // Default true if no subscription doc exists yet
  const currentPlan = (subscription && !isActive) ? "FREE" : plan;

  const projectCount = await ProjectModel.countDocuments({ workspace: workspaceId });
  const limit = PLAN_LIMITS[currentPlan].maxProjects;

  if (projectCount >= limit) {
    throw new BadRequestException(
      `Project limit reached. The ${currentPlan} plan allows a maximum of ${limit} projects. Please upgrade your plan.`
    );
  }
};

export const checkMemberLimit = async (workspaceId: string) => {
  const subscription = await SubscriptionModel.findOne({ workspace: workspaceId });
  const plan = subscription?.plan || "FREE";

  const isActive = subscription ? ["active", "trialing"].includes(subscription.status) : true;
  const currentPlan = (subscription && !isActive) ? "FREE" : plan;

  const memberCount = await MemberModel.countDocuments({ workspaceId });
  const limit = PLAN_LIMITS[currentPlan].maxMembers;

  if (memberCount >= limit) {
    throw new BadRequestException(
      `Member limit reached. The ${currentPlan} plan allows a maximum of ${limit} members. Please upgrade your plan.`
    );
  }
};
