export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/",
  SIGN_UP: "/sign-up",
  GOOGLE_OAUTH_CALLBACK: "/google/oauth/callback",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TASKS: "/workspace/:workspaceId/tasks",
  MEMBERS: "/workspace/:workspaceId/members",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROFILE: "/workspace/:workspaceId/profile",
  INTEGRATIONS: "/workspace/:workspaceId/integrations",
  ROLES: "/workspace/:workspaceId/roles",
  BILLING: "/workspace/:workspaceId/billing",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
  TASK_DETAILS: "/workspace/:workspaceId/project/:projectId/task/:taskId",
};

export const BASE_ROUTE = {
  INVITE_URL: "/invite/workspace/:inviteCode/join",
};
