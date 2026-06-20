import API from "./axios-client"
import {
  AllMembersInWorkspaceResponseType,
  AllProjectPayloadType,
  AllProjectResponseType,
  AllTaskPayloadType,
  AllTaskResponseType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType,
  CreateProjectPayloadType,
  CreateTaskPayloadType,
  EditTaskPayloadType,
  CreateSubtaskPayloadType,
  SubtaskPayloadType,
  SubTaskType,
  CreateWorkspaceResponseType,
  EditProjectPayloadType,
  ProjectByIdPayloadType,
  ProjectResponseType,
  SprintType,
  CreateSprintPayloadType,
  UpdateSprintPayloadType,
  CommentType,
  CreateCommentPayloadType,
  UpdateCommentPayloadType,
  TimeLogType,
  LogTimePayloadType,
  TaskType,
  ActivityLogType,
  NotificationType,
} from "../types/api.type"
import {
  AllWorkspaceResponseType,
  CreateWorkspaceType,
  CurrentUserResponseType,
  LoginResponseType,
  loginType,
  registerType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
  WorkspaceRolesResponseType,
  UpdateRolePermissionsPayloadType,
  UpdateRolePermissionsResponseType,
  UserType,
} from "@/types/api.type"

export const loginMutationFn = async (data: loginType): Promise<LoginResponseType> => {
  const response = await API.post("/auth/login", data)
  return response.data
}

export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data)

export const logoutMutationFn = async () => await API.post("/auth/logout")

export const getCurrentUserQueryFn = async (): Promise<CurrentUserResponseType> => {
  const response = await API.get(`/user/current`)
  return response.data
}

export const updateProfileMutationFn = async (data: {
  name?: string
  profilePicture?: string | null
}): Promise<{ message: string; user: UserType }> => {
  const response = await API.put(`/user/update`, data)
  return response.data
}

//********* WORKSPACE ****************
//************* */

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType,
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data)
  return response.data
}

export const editWorkspaceMutationFn = async ({ workspaceId, data }: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data)
  return response.data
}

export const getAllWorkspacesUserIsMemberQueryFn = async (): Promise<AllWorkspaceResponseType> => {
  const response = await API.get(`/workspace/all`)
  return response.data
}

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string,
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`)
  return response.data
}

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string,
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`)
  return response.data
}

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string,
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`)
  return response.data
}

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(`/workspace/change/member/role/${workspaceId}`, data)
  return response.data
}

export const deleteWorkspaceMutationFn = async (
  workspaceId: string,
): Promise<{
  message: string
  currentWorkspace: string
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`)
  return response.data
}

export const getWorkspaceRolesQueryFn = async (
  workspaceId: string,
): Promise<WorkspaceRolesResponseType> => {
  const response = await API.get(`/workspace/roles/${workspaceId}`)
  return response.data
}

export const updateRolePermissionsMutationFn = async ({
  workspaceId,
  roleId,
  data,
}: UpdateRolePermissionsPayloadType): Promise<UpdateRolePermissionsResponseType> => {
  const response = await API.put(`/workspace/${workspaceId}/role/${roleId}/permissions`, data)
  return response.data
}

//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  iniviteCode: string,
): Promise<{
  message: string
  workspaceId: string
}> => {
  const response = await API.post(`/member/workspace/${iniviteCode}/join`)
  return response.data
}

//********* */
//********* PROJECTS
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(`/project/workspace/${workspaceId}/create`, data)
  return response.data
}

export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(`/project/${projectId}/workspace/${workspaceId}/update`, data)
  return response.data
}

export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`,
  )
  return response.data
}

export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(`/project/${projectId}/workspace/${workspaceId}`)
  return response.data
}

export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/project/${projectId}/workspace/${workspaceId}/analytics`)
  return response.data
}

export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{
  message: string
}> => {
  const response = await API.delete(`/project/${projectId}/workspace/${workspaceId}/delete`)
  return response.data
}

//*******TASKS ********************************
//************************* */

export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data,
  )
  return response.data
}

export const editTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
}: EditTaskPayloadType): Promise<{ message: string }> => {
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update/`,
    data,
  )
  return response.data
}

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`

  const queryParams = new URLSearchParams()
  if (keyword) queryParams.append("keyword", keyword)
  if (projectId) queryParams.append("projectId", projectId)
  if (assignedTo) queryParams.append("assignedTo", assignedTo)
  if (priority) queryParams.append("priority", priority)
  if (status) queryParams.append("status", status)
  if (dueDate) queryParams.append("dueDate", dueDate)
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString())
  if (pageSize) queryParams.append("pageSize", pageSize?.toString())

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl
  const response = await API.get(url)
  return response.data
}

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}): Promise<{
  message: string
}> => {
  const response = await API.delete(`task/${taskId}/workspace/${workspaceId}/delete`)
  return response.data
}

export const getTaskByIdQueryFn = async ({
  taskId,
  projectId,
  workspaceId,
}: {
  taskId: string
  projectId: string
  workspaceId: string
}): Promise<{ message: string; task: TaskType }> => {
  const response = await API.get(`/task/${taskId}/project/${projectId}/workspace/${workspaceId}`)
  return response.data
}

// ==========================================
// SPRINTS API FUNCTIONS
// ==========================================

export const createSprintMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateSprintPayloadType): Promise<{
  message: string
  sprint: SprintType
}> => {
  const response = await API.post(
    `/sprint/project/${projectId}/workspace/${workspaceId}/create`,
    data,
  )
  return response.data
}

export const updateSprintMutationFn = async ({
  workspaceId,
  projectId,
  sprintId,
  data,
}: UpdateSprintPayloadType): Promise<{
  message: string
  sprint: SprintType
}> => {
  const response = await API.put(
    `/sprint/${sprintId}/project/${projectId}/workspace/${workspaceId}/update`,
    data,
  )
  return response.data
}

export const getProjectSprintsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{
  message: string
  sprints: SprintType[]
}> => {
  const response = await API.get(`/sprint/project/${projectId}/workspace/${workspaceId}/all`)
  return response.data
}

export const getSprintByIdQueryFn = async ({
  workspaceId,
  projectId,
  sprintId,
}: {
  workspaceId: string
  projectId: string
  sprintId: string
}): Promise<{
  message: string
  sprint: SprintType
  tasks: TaskType[]
  stats: {
    totalTasks: number
    completedTasks: number
    totalStoryPoints: number
    completedStoryPoints: number
  }
}> => {
  const response = await API.get(
    `/sprint/${sprintId}/project/${projectId}/workspace/${workspaceId}`,
  )
  return response.data
}

export const deleteSprintMutationFn = async ({
  workspaceId,
  sprintId,
}: {
  workspaceId: string
  sprintId: string
}): Promise<{
  message: string
}> => {
  const response = await API.delete(`/sprint/${sprintId}/workspace/${workspaceId}/delete`)
  return response.data
}

// ==========================================
// COMMENTS API FUNCTIONS
// ==========================================

export const createCommentMutationFn = async ({
  workspaceId,
  taskId,
  data,
}: CreateCommentPayloadType): Promise<{
  message: string
  comment: CommentType
}> => {
  const response = await API.post(`/comment/task/${taskId}/workspace/${workspaceId}/create`, data)
  return response.data
}

export const getTaskCommentsQueryFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}): Promise<{
  message: string
  comments: CommentType[]
}> => {
  const response = await API.get(`/comment/task/${taskId}/workspace/${workspaceId}/all`)
  return response.data
}

export const updateCommentMutationFn = async ({
  workspaceId,
  commentId,
  data,
}: UpdateCommentPayloadType): Promise<{
  message: string
  comment: CommentType
}> => {
  const response = await API.put(`/comment/${commentId}/workspace/${workspaceId}/update`, data)
  return response.data
}

export const deleteCommentMutationFn = async ({
  workspaceId,
  commentId,
}: {
  workspaceId: string
  commentId: string
}): Promise<{
  message: string
}> => {
  const response = await API.delete(`/comment/${commentId}/workspace/${workspaceId}/delete`)
  return response.data
}

// ==========================================
// TIME LOGS API FUNCTIONS
// ==========================================

export const logTimeMutationFn = async ({
  workspaceId,
  taskId,
  data,
}: LogTimePayloadType): Promise<{
  message: string
  timeLog: TimeLogType
}> => {
  const response = await API.post(`/time-log/task/${taskId}/workspace/${workspaceId}/create`, data)
  return response.data
}

export const getTaskTimeLogsQueryFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}): Promise<{
  message: string
  timeLogs: TimeLogType[]
  totalMinutes: number
}> => {
  const response = await API.get(`/time-log/task/${taskId}/workspace/${workspaceId}/all`)
  return response.data
}

export const getProjectTimeLogsQueryFn = async ({
  workspaceId,
  projectId,
}: {
  workspaceId: string
  projectId: string
}): Promise<{
  message: string
  timeLogs: TimeLogType[]
  totalMinutes: number
}> => {
  const response = await API.get(`/time-log/project/${projectId}/workspace/${workspaceId}/all`)
  return response.data
}

export const deleteTimeLogMutationFn = async ({
  workspaceId,
  timeLogId,
}: {
  workspaceId: string
  timeLogId: string
}): Promise<{
  message: string
}> => {
  const response = await API.delete(`/time-log/${timeLogId}/workspace/${workspaceId}/delete`)
  return response.data
}

// ==========================================
// TIMELINE API FUNCTIONS
// ==========================================

export const getWorkspaceTimelineQueryFn = async ({
  workspaceId,
}: {
  workspaceId: string
}): Promise<{
  message: string
  logs: ActivityLogType[]
}> => {
  const response = await API.get(`/timeline/workspace/${workspaceId}`)
  return response.data
}

export const getProjectTimelineQueryFn = async ({
  workspaceId,
  projectId,
}: {
  workspaceId: string
  projectId: string
}): Promise<{
  message: string
  logs: ActivityLogType[]
}> => {
  const response = await API.get(`/timeline/project/${projectId}/workspace/${workspaceId}`)
  return response.data
}

export const getSprintTimelineQueryFn = async ({
  workspaceId,
  sprintId,
}: {
  workspaceId: string
  sprintId: string
}): Promise<{
  message: string
  logs: ActivityLogType[]
}> => {
  const response = await API.get(`/timeline/sprint/${sprintId}/workspace/${workspaceId}`)
  return response.data
}

export const getTaskTimelineQueryFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string
  taskId: string
}): Promise<{
  message: string
  logs: ActivityLogType[]
}> => {
  const response = await API.get(`/timeline/task/${taskId}/workspace/${workspaceId}`)
  return response.data
}

export interface IntegrationType {
  _id: string
  workspace: string
  provider: "GITHUB" | "SLACK"
  webhookUrl?: string
  secret?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const getWorkspaceIntegrationsQueryFn = async (
  workspaceId: string,
): Promise<{ message: string; integrations: IntegrationType[] }> => {
  const response = await API.get(`/integration/workspace/${workspaceId}`)
  return response.data
}

export const createOrUpdateIntegrationMutationFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string
  data: {
    provider: "GITHUB" | "SLACK"
    webhookUrl?: string
    secret?: string
    isActive?: boolean
  }
}): Promise<{ message: string; integration: IntegrationType }> => {
  const response = await API.post(`/integration/workspace/${workspaceId}`, data)
  return response.data
}

export interface SubscriptionType {
  _id: string
  workspace: string
  stripeCustomerId: string
  stripeSubscriptionId?: string
  plan: "FREE" | "PRO" | "ENTERPRISE"
  status: string
  currentPeriodEnd?: string
  createdAt: string
  updatedAt: string
}

export const getWorkspaceSubscriptionQueryFn = async (
  workspaceId: string,
): Promise<{ message: string; subscription: SubscriptionType }> => {
  const response = await API.get(`/billing/subscription/${workspaceId}`)
  return response.data
}

export const createCheckoutSessionMutationFn = async (
  workspaceId: string,
): Promise<{ message: string; url: string }> => {
  const response = await API.post(`/billing/checkout/${workspaceId}`)
  return response.data
}

export const createPortalSessionMutationFn = async (
  workspaceId: string,
): Promise<{ message: string; url: string }> => {
  const response = await API.post(`/billing/portal/${workspaceId}`)
  return response.data
}

export const createSubtaskMutationFn = async ({
  taskId,
  workspaceId,
  data,
}: CreateSubtaskPayloadType): Promise<{ message: string; subtask: SubTaskType }> => {
  const response = await API.post(`/task/${taskId}/workspace/${workspaceId}/subtask/create`, data)
  return response.data
}

export const toggleSubtaskMutationFn = async ({
  taskId,
  workspaceId,
  subtaskId,
}: SubtaskPayloadType): Promise<{ message: string; subtask: SubTaskType }> => {
  const response = await API.patch(
    `/task/${taskId}/workspace/${workspaceId}/subtask/${subtaskId}/toggle`,
  )
  return response.data
}

export const deleteSubtaskMutationFn = async ({
  taskId,
  workspaceId,
  subtaskId,
}: SubtaskPayloadType): Promise<{ message: string }> => {
  const response = await API.delete(
    `/task/${taskId}/workspace/${workspaceId}/subtask/${subtaskId}/delete`,
  )
  return response.data
}

export const getUserNotificationsQueryFn = async (): Promise<{
  message: string
  notifications: NotificationType[]
  unreadCount: number
}> => {
  const response = await API.get("/notification")
  return response.data
}

export const markNotificationAsReadMutationFn = async (
  notificationId: string,
): Promise<{ message: string; notification: NotificationType }> => {
  const response = await API.put(`/notification/${notificationId}/read`)
  return response.data
}

export const markAllNotificationsAsReadMutationFn = async (): Promise<{
  message: string
}> => {
  const response = await API.put("/notification/read-all")
  return response.data
}
