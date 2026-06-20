import {
  PermissionType,
  TaskPriorityEnumType,
  TaskStatusEnumType,
  TaskTypeEnumType,
} from "@/constant"

export type loginType = { email: string; password: string }
export type LoginResponseType = {
  message: string
  user: {
    _id: string
    currentWorkspace: string
  }
}

export type registerType = {
  name: string
  email: string
  password: string
}

// USER TYPE
export type UserType = {
  _id: string
  name: string
  email: string
  profilePicture: string | null
  isActive: true
  lastLogin: null
  createdAt: Date
  updatedAt: Date
  currentWorkspace: {
    _id: string
    name: string
    owner: string
    inviteCode: string
  }
}

export type CurrentUserResponseType = {
  message: string
  user: UserType
}

//******** */ WORLSPACE TYPES ****************
// ******************************************
export type WorkspaceType = {
  _id: string
  name: string
  description?: string
  owner: string
  inviteCode: string
}

export type CreateWorkspaceType = {
  name: string
  description: string
}

export type EditWorkspaceType = {
  workspaceId: string
  data: {
    name: string
    description: string
  }
}

export type CreateWorkspaceResponseType = {
  message: string
  workspace: WorkspaceType
}

export type AllWorkspaceResponseType = {
  message: string
  workspaces: WorkspaceType[]
}

export type WorkspaceWithMembersType = WorkspaceType & {
  members: {
    _id: string
    userId: string
    workspaceId: string
    role: {
      _id: string
      name: string
      permissions: PermissionType[]
    }
    joinedAt: string
    createdAt: string
  }[]
}

export type WorkspaceByIdResponseType = {
  message: string
  workspace: WorkspaceWithMembersType
}

export type ChangeWorkspaceMemberRoleType = {
  workspaceId: string
  data: {
    roleId: string
    memberId: string
  }
}

export type AllMembersInWorkspaceResponseType = {
  message: string
  members: {
    _id: string
    userId: {
      _id: string
      name: string
      email: string
      profilePicture: string | null
    }
    workspaceId: string
    role: {
      _id: string
      name: string
    }
    joinedAt: string
    createdAt: string
  }[]
  roles: RoleType[]
}

export type AnalyticsResponseType = {
  message: string
  analytics: {
    totalTasks: number
    overdueTasks: number
    completedTasks: number
    tasksByStatus?: { _id: string; count: number }[]
    tasksByPriority?: { _id: string; count: number }[]
  }
}

export type PaginationType = {
  totalCount: number
  pageSize: number
  pageNumber: number
  totalPages: number
  skip: number
  limit: number
}

export type RoleType = {
  _id: string
  name: string
}

export type WorkspaceRoleType = {
  _id: string
  name: string
  permissions: PermissionType[]
  createdAt: string
  updatedAt: string
}

export type WorkspaceRolesResponseType = {
  message: string
  roles: WorkspaceRoleType[]
}

export type UpdateRolePermissionsPayloadType = {
  workspaceId: string
  roleId: string
  data: {
    permissions: PermissionType[]
  }
}

export type UpdateRolePermissionsResponseType = {
  message: string
  role: WorkspaceRoleType
}
// *********** MEMBER ****************

//******** */ PROJECT TYPES ****************
//****************************************** */
export type ProjectType = {
  _id: string
  name: string
  emoji: string
  description: string
  workspace: string
  createdBy: {
    _id: string
    name: string
    profilePicture: string
  }
  createdAt: string
  updatedAt: string
}

export type CreateProjectPayloadType = {
  workspaceId: string
  data: {
    emoji: string
    name: string
    description: string
  }
}

export type ProjectResponseType = {
  message: "Project created successfully"
  project: ProjectType
}

export type EditProjectPayloadType = {
  workspaceId: string
  projectId: string
  data: {
    emoji: string
    name: string
    description: string
  }
}

//ALL PROJECTS IN WORKSPACE TYPE
export type AllProjectPayloadType = {
  workspaceId: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
  skip?: boolean
}

export type AllProjectResponseType = {
  message: string
  projects: ProjectType[]
  pagination: PaginationType
}

// SINGLE PROJECT IN WORKSPACE TYPE
export type ProjectByIdPayloadType = {
  workspaceId: string
  projectId: string
}

//********** */ TASK TYPES ************************
//************************************************* */

export type CreateTaskPayloadType = {
  workspaceId: string
  projectId: string
  data: {
    title: string
    description?: string
    priority: TaskPriorityEnumType
    status: TaskStatusEnumType
    assignedTo?: string | null
    dueDate?: string
    taskType?: TaskTypeEnumType
    storyPoints?: number | null
    sprint?: string | null
  }
}

//added new for edtiting of task
export type EditTaskPayloadType = {
  taskId: string
  workspaceId: string
  projectId: string
  data: Partial<{
    title: string
    description: string
    priority: TaskPriorityEnumType
    status: TaskStatusEnumType
    assignedTo: string | null
    dueDate: string
    taskType: TaskTypeEnumType
    storyPoints: number | null
    sprint: string | null
  }>
}

export type CreateSubtaskPayloadType = {
  taskId: string
  workspaceId: string
  data: {
    title: string
  }
}

export type SubtaskPayloadType = {
  taskId: string
  workspaceId: string
  subtaskId: string
}

export type SubTaskType = {
  _id: string
  title: string
  isCompleted: boolean
  createdAt: string
}

export type TaskDependencyType = {
  type: "BLOCKED_BY" | "BLOCKS" | "RELATED" | "PARENT" | "CHILD"
  task: {
    _id: string
    title: string
    taskCode: string
    status: TaskStatusEnumType
    priority: TaskPriorityEnumType
  }
}

export type TaskAttachmentType = {
  _id: string
  filename: string
  url: string
  publicId: string
  mimeType: string
  size: number
  uploadedBy: {
    _id: string
    name: string
    profilePicture: string | null
  }
  createdAt: string
}

export type TaskType = {
  _id: string
  title: string
  subtasks?: SubTaskType[]
  description?: string
  project?: {
    _id: string
    emoji: string
    name: string
  }
  priority: TaskPriorityEnumType
  status: TaskStatusEnumType
  taskType: TaskTypeEnumType
  storyPoints: number | null
  sprint: {
    _id: string
    name: string
    status: "PLANNED" | "ACTIVE" | "COMPLETED"
    startDate: string
    endDate: string
  } | null
  assignedTo: {
    _id: string
    name: string
    profilePicture: string | null
  } | null
  createdBy?: string
  dueDate: string
  taskCode: string
  createdAt?: string
  updatedAt?: string
  dependencies?: TaskDependencyType[]
  attachments?: TaskAttachmentType[]
}

export type AllTaskPayloadType = {
  workspaceId: string
  projectId?: string | null
  keyword?: string | null
  priority?: TaskPriorityEnumType | null
  status?: TaskStatusEnumType | null
  assignedTo?: string | null
  dueDate?: string | null
  sprint?: string | null
  taskType?: TaskTypeEnumType[] | string | null
  pageNumber?: number | null
  pageSize?: number | null
}

export type AllTaskResponseType = {
  message: string
  tasks: TaskType[]
  pagination: PaginationType
}

// ==========================================
// Sprints
// ==========================================
export type SprintStatusType = "PLANNED" | "ACTIVE" | "COMPLETED"

export type SprintType = {
  _id: string
  name: string
  description: string | null
  startDate: string
  endDate: string
  status: SprintStatusType
  project: string
  workspace: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type CreateSprintPayloadType = {
  workspaceId: string
  projectId: string
  data: {
    name: string
    description?: string
    startDate: string
    endDate: string
  }
}

export type UpdateSprintPayloadType = {
  workspaceId: string
  projectId: string
  sprintId: string
  data: Partial<{
    name: string
    description: string
    startDate: string
    endDate: string
    status: SprintStatusType
  }>
}

// ==========================================
// Comments
// ==========================================
export type CommentType = {
  _id: string
  content: string
  task: string
  user: {
    _id: string
    name: string
    profilePicture: string | null
  }
  workspace: string
  createdAt: string
  updatedAt: string
}

export type CreateCommentPayloadType = {
  workspaceId: string
  taskId: string
  data: {
    content: string
  }
}

export type UpdateCommentPayloadType = {
  workspaceId: string
  commentId: string
  data: {
    content: string
  }
}

// ==========================================
// Time Logs
// ==========================================
export type TimeLogType = {
  _id: string
  task: string | { _id: string; title: string; taskCode: string }
  user: {
    _id: string
    name: string
    profilePicture: string | null
  }
  workspace: string
  durationMinutes: number
  description: string | null
  loggedAt: string
  createdAt: string
  updatedAt: string
}

export type LogTimePayloadType = {
  workspaceId: string
  taskId: string
  data: {
    durationMinutes: number
    description?: string
    loggedAt?: string
  }
}

// ==========================================
// Timeline / Activity Logs
// ==========================================
export type ActivityLogType = {
  _id: string
  workspace: string
  project?: {
    _id: string
    name: string
    emoji: string
  } | null
  sprint?: {
    _id: string
    name: string
    status: string
  } | null
  task?: {
    _id: string
    title: string
    taskCode: string
  } | null
  user: {
    _id: string
    name: string
    profilePicture: string | null
  }
  actionType: string
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type NotificationType = {
  _id: string
  recipient: string
  sender: {
    _id: string
    name: string
    profilePicture: string | null
  }
  workspace: string
  project?: {
    _id: string
    name: string
  } | null
  task?: {
    _id: string
    title: string
    taskCode: string
  } | null
  type: "ASSIGNED" | "UNASSIGNED" | "COMMENT" | "STATUS_CHANGE"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}
